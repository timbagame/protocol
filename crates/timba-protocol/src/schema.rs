//! A subset of zod, enough to run the protocol's HTTP schemas (`crate::http`) in Rust.
//!
//! [`parse`] behaves like `schema.parse(value)`: it validates, strips the unknown keys of
//! `z.object`, rejects them for `z.strictObject`, emits object keys in schema order, applies
//! transforms and defaults, and reports the path of the first issue zod would report. Error
//! messages are this crate's own, not zod's.
//!
//! The JavaScript helpers (`Number(string)`, `Number.prototype.toString`, `JSON.stringify`)
//! cover the conversions the schemas and their callers rely on.

use serde_json::{Map, Value};

use crate::validators::{is_hex32, is_solana_address, is_solana_signature, is_strict_base64, is_u64_string};

/// JavaScript `Number.MAX_SAFE_INTEGER`.
pub const MAX_SAFE_INTEGER: f64 = 9_007_199_254_740_991.0;

#[derive(Debug, Clone, PartialEq, Eq, thiserror::Error)]
#[error("Schema validation failed at {}: {message}", if path.is_empty() { "<root>" } else { path })]
pub struct SchemaError {
    /// Dot-joined zod issue path; empty for the root.
    pub path: String,
    pub message: String,
}

impl SchemaError {
    pub fn new(path: &str, message: impl Into<String>) -> Self {
        Self { path: path.to_string(), message: message.into() }
    }
}

/// A refinement over an already parsed value (`.refine` / `.superRefine`). Paths in the
/// returned error are relative to the refined value.
pub type Refinement = fn(&Value) -> Result<(), SchemaError>;

/// The zod schemas the protocol uses.
#[derive(Debug)]
pub enum Schema {
    /// `SolanaAddressSchema`
    Address,
    /// `SolanaSignatureSchema`
    Signature,
    /// `Hex32Schema`
    Hex32,
    /// `U64StringSchema`
    U64String,
    /// `Base64TransactionSchema`, optionally with a lower `.max(n)`.
    Base64Transaction { max: usize },
    /// `z.string().min(min).max(max)`, lengths in UTF-16 code units.
    String { min: usize, max: usize },
    /// `z.string().trim().toLowerCase().min(min).max(max)`
    TrimLower { min: usize, max: usize },
    /// `z.url()`
    Url,
    /// `z.iso.datetime()`: UTC (`Z`) with seconds and any fraction.
    DateTime,
    /// `z.boolean()`
    Bool,
    /// `z.literal(true | false)`
    BoolLiteral(bool),
    /// `z.literal("...")`
    Literal(&'static str),
    /// `z.union([z.literal(n), ...])`
    IntLiterals(&'static [i64]),
    /// `z.enum([...])`
    Enum(&'static [&'static str]),
    /// `z.number().finite().nonnegative()`
    NonNegativeNumber,
    /// `z.number().int().nonnegative()`
    NonNegativeInteger,
    /// `z.number().int().positive()`
    PositiveInteger,
    /// `z.number().int().min(min).max(max)`
    IntegerRange(i64, i64),
    /// `z.coerce.number().int().min(min).max(max)`, with `.default(n)` when set.
    CoerceInteger { min: i64, max: i64, default: Option<i64> },
    /// `.nullable()`
    Nullable(&'static Schema),
    /// `.optional()`: the key may be missing, but `null` is still rejected.
    Optional(&'static Schema),
    /// `z.array(item).min(min).max(max)`
    Array { item: &'static Schema, min: usize, max: usize },
    /// `z.object({...})`: unknown keys are stripped.
    Object(&'static [(&'static str, Schema)]),
    /// `z.strictObject({...})`: unknown keys are rejected.
    StrictObject(&'static [(&'static str, Schema)]),
    /// `z.discriminatedUnion(key, [...])`, options listed by discriminator value.
    DiscriminatedUnion { key: &'static str, options: &'static [(&'static str, Schema)] },
    /// `schema.refine(...)` / `schema.superRefine(...)`.
    Refine(&'static Schema, Refinement),
    /// Another schema used as a field, unchanged.
    Ref(&'static Schema),
}

/// `z.array(item)` without length limits.
pub const fn array(item: &'static Schema) -> Schema {
    Schema::Array { item, min: 0, max: usize::MAX }
}

/// `z.string().min(1)`.
pub const NON_EMPTY_STRING: Schema = Schema::String { min: 1, max: usize::MAX };

/// `schema.parse(value)`.
pub fn parse(schema: &Schema, value: &Value) -> Result<Value, SchemaError> {
    parse_at(schema, value, "")
}

fn join(path: &str, key: &str) -> String {
    if path.is_empty() {
        key.to_string()
    } else {
        format!("{path}.{key}")
    }
}

fn prefixed(path: &str, error: SchemaError) -> SchemaError {
    SchemaError { path: if error.path.is_empty() { path.to_string() } else { join(path, &error.path) }, ..error }
}

fn safe_integer(value: &Value) -> Option<i64> {
    let number = value.as_number()?;
    if let Some(integer) = number.as_i64() {
        return (integer.unsigned_abs() as f64 <= MAX_SAFE_INTEGER).then_some(integer);
    }
    let float = number.as_f64()?;
    (float.fract() == 0.0 && float.abs() <= MAX_SAFE_INTEGER).then_some(float as i64)
}

fn utf16_len(text: &str) -> usize {
    text.encode_utf16().count()
}

/// JSON number formatting that matches `JSON.stringify` for integral values.
pub fn normalize_number(value: f64) -> Value {
    if !value.is_finite() {
        return Value::Null;
    }
    if value.fract() == 0.0 && value.abs() < 9.2e18 {
        return Value::from(value as i64);
    }
    Value::from(value)
}

fn integer_check(integer: Option<i64>, path: &str, min: i64, max: i64, label: &str) -> Result<Value, SchemaError> {
    match integer {
        Some(integer) if (min..=max).contains(&integer) => Ok(Value::from(integer)),
        _ => Err(SchemaError::new(path, label)),
    }
}

fn parse_at(schema: &Schema, value: &Value, path: &str) -> Result<Value, SchemaError> {
    let string = || value.as_str().ok_or_else(|| SchemaError::new(path, "expected string"));
    let check = |valid: bool, message: &str| {
        if valid {
            Ok(value.clone())
        } else {
            Err(SchemaError::new(path, message))
        }
    };
    match schema {
        Schema::Address => check(is_solana_address(string()?), "invalid Solana address"),
        Schema::Signature => check(is_solana_signature(string()?), "invalid Solana signature"),
        Schema::Hex32 => check(is_hex32(string()?), "invalid hex32"),
        Schema::U64String => check(is_u64_string(string()?), "invalid u64 string"),
        Schema::Base64Transaction { max } => {
            let text = string()?;
            check(!text.is_empty() && text.len() <= *max && is_strict_base64(text), "invalid base64 transaction")
        }
        Schema::String { min, max } => {
            let length = utf16_len(string()?);
            check(length >= *min && length <= *max, "string length out of range")
        }
        Schema::TrimLower { min, max } => {
            let text = string()?.trim_matches(is_js_whitespace).to_lowercase();
            let length = utf16_len(&text);
            if length < *min || length > *max {
                return Err(SchemaError::new(path, "string length out of range"));
            }
            Ok(Value::String(text))
        }
        Schema::Url => check(url::Url::parse(string()?).is_ok(), "invalid URL"),
        Schema::DateTime => check(is_iso_datetime(string()?), "invalid ISO datetime"),
        Schema::Bool => check(value.is_boolean(), "expected boolean"),
        Schema::BoolLiteral(expected) => check(value.as_bool() == Some(*expected), "unexpected literal"),
        Schema::Literal(expected) => check(value.as_str() == Some(*expected), "unexpected literal"),
        Schema::IntLiterals(allowed) => match safe_integer(value) {
            Some(integer) if allowed.contains(&integer) => Ok(Value::from(integer)),
            _ => Err(SchemaError::new(path, "unexpected literal")),
        },
        Schema::Enum(values) => check(value.as_str().is_some_and(|text| values.contains(&text)), "invalid enum value"),
        Schema::NonNegativeNumber => match value.as_f64() {
            Some(number) if number >= 0.0 => Ok(normalize_number(number)),
            _ => Err(SchemaError::new(path, "expected a non-negative finite number")),
        },
        Schema::NonNegativeInteger => {
            integer_check(safe_integer(value), path, 0, i64::MAX, "expected a non-negative integer")
        }
        Schema::PositiveInteger => integer_check(safe_integer(value), path, 1, i64::MAX, "expected a positive integer"),
        Schema::IntegerRange(min, max) => integer_check(safe_integer(value), path, *min, *max, "integer out of range"),
        Schema::CoerceInteger { min, max, .. } => {
            let number = js_coerce_number(value);
            let integer = (number.fract() == 0.0 && number.abs() <= MAX_SAFE_INTEGER).then_some(number as i64);
            integer_check(integer, path, *min, *max, "integer out of range")
        }
        Schema::Nullable(inner) => {
            if value.is_null() {
                Ok(Value::Null)
            } else {
                parse_at(inner, value, path)
            }
        }
        Schema::Optional(inner) => parse_at(inner, value, path),
        Schema::Array { item, min, max } => {
            let items = value.as_array().ok_or_else(|| SchemaError::new(path, "expected array"))?;
            let parsed = items
                .iter()
                .enumerate()
                .map(|(index, entry)| parse_at(item, entry, &join(path, &index.to_string())))
                .collect::<Result<Vec<_>, _>>()?;
            if parsed.len() < *min || parsed.len() > *max {
                return Err(SchemaError::new(path, "array length out of range"));
            }
            Ok(Value::Array(parsed))
        }
        Schema::Object(shape) => parse_object(shape, false, value, path),
        Schema::StrictObject(shape) => parse_object(shape, true, value, path),
        Schema::DiscriminatedUnion { key, options } => {
            let input = value.as_object().ok_or_else(|| SchemaError::new(path, "expected object"))?;
            let option = input
                .get(*key)
                .and_then(Value::as_str)
                .and_then(|tag| options.iter().find(|(name, _)| *name == tag))
                .ok_or_else(|| SchemaError::new(&join(path, key), "invalid discriminator"))?;
            parse_at(&option.1, value, path)
        }
        Schema::Ref(inner) => parse_at(inner, value, path),
        Schema::Refine(inner, refinement) => {
            let parsed = parse_at(inner, value, path)?;
            refinement(&parsed).map_err(|error| prefixed(path, error))?;
            Ok(parsed)
        }
    }
}

/// The value a missing key takes, if the field allows the key to be missing.
fn missing(schema: &Schema) -> Option<Option<Value>> {
    match schema {
        Schema::Optional(_) => Some(None),
        Schema::CoerceInteger { default: Some(default), .. } => Some(Some(Value::from(*default))),
        Schema::Ref(inner) => missing(inner),
        _ => None,
    }
}

fn parse_object(shape: &[(&str, Schema)], strict: bool, value: &Value, path: &str) -> Result<Value, SchemaError> {
    let input = value.as_object().ok_or_else(|| SchemaError::new(path, "expected object"))?;
    let mut output = Map::new();
    for (key, field) in shape {
        let field_path = join(path, key);
        match input.get(*key) {
            Some(field_value) => {
                output.insert((*key).to_string(), parse_at(field, field_value, &field_path)?);
            }
            None => match missing(field) {
                Some(Some(default)) => {
                    output.insert((*key).to_string(), default);
                }
                Some(None) => {}
                None => return Err(SchemaError::new(&field_path, "required")),
            },
        }
    }
    if strict {
        if let Some(key) = input.keys().find(|key| !shape.iter().any(|(name, _)| name == key)) {
            return Err(SchemaError::new(path, format!("unrecognized key {key:?}")));
        }
    }
    Ok(Value::Object(output))
}

fn digits(text: &str, range: std::ops::Range<usize>) -> Option<u32> {
    let part = text.get(range)?;
    part.bytes().all(|byte| byte.is_ascii_digit()).then(|| part.parse().ok())?
}

/// `z.iso.datetime()`: `YYYY-MM-DDTHH:MM:SS[.fraction]Z` with a real calendar date.
fn is_iso_datetime(text: &str) -> bool {
    let bytes = text.as_bytes();
    let separators = [(4, b'-'), (7, b'-'), (10, b'T'), (13, b':'), (16, b':')];
    if bytes.len() < 20 || separators.iter().any(|(index, byte)| bytes[*index] != *byte) || !text.ends_with('Z') {
        return false;
    }
    let fraction = &text[19..text.len() - 1];
    if !fraction.is_empty()
        && (!fraction.starts_with('.')
            || fraction.len() < 2
            || !fraction[1..].bytes().all(|byte| byte.is_ascii_digit()))
    {
        return false;
    }
    let field = |start: usize, end: usize| digits(text, start..end);
    let (Some(year), Some(month), Some(day), Some(hour), Some(minute), Some(second)) =
        (field(0, 4), field(5, 7), field(8, 10), field(11, 13), field(14, 16), field(17, 19))
    else {
        return false;
    };
    let leap = (year % 4 == 0 && year % 100 != 0) || year % 400 == 0;
    let days = match month {
        1 | 3 | 5 | 7 | 8 | 10 | 12 => 31,
        4 | 6 | 9 | 11 => 30,
        2 if leap => 29,
        2 => 28,
        _ => return false,
    };
    (1..=days).contains(&day) && hour < 24 && minute < 60 && second < 60
}

// ---------------------------------------------------------------------------
// JavaScript conversions
// ---------------------------------------------------------------------------

/// JavaScript `String.prototype.trim` whitespace and line terminators.
pub fn is_js_whitespace(c: char) -> bool {
    matches!(
        c,
        '\t' | '\n' | '\u{b}' | '\u{c}' | '\r' | ' ' | '\u{a0}' | '\u{1680}' | '\u{2000}'
            ..='\u{200a}' | '\u{2028}' | '\u{2029}' | '\u{202f}' | '\u{205f}' | '\u{3000}' | '\u{feff}'
    )
}

fn is_decimal_literal(text: &str) -> bool {
    let bytes = text.as_bytes();
    let mut index = usize::from(matches!(bytes.first(), Some(b'+' | b'-')));
    let mut digit_count = 0;
    let skip_digits = |index: &mut usize| {
        let start = *index;
        while bytes.get(*index).is_some_and(u8::is_ascii_digit) {
            *index += 1;
        }
        *index - start
    };
    digit_count += skip_digits(&mut index);
    if bytes.get(index) == Some(&b'.') {
        index += 1;
        digit_count += skip_digits(&mut index);
    }
    if digit_count == 0 {
        return false;
    }
    if matches!(bytes.get(index), Some(b'e' | b'E')) {
        index += 1;
        if matches!(bytes.get(index), Some(b'+' | b'-')) {
            index += 1;
        }
        if skip_digits(&mut index) == 0 {
            return false;
        }
    }
    index == bytes.len()
}

/// JavaScript `Number(string)`.
pub fn js_to_number(input: &str) -> f64 {
    let text = input.trim_matches(is_js_whitespace);
    match text {
        "" => return 0.0,
        "Infinity" | "+Infinity" => return f64::INFINITY,
        "-Infinity" => return f64::NEG_INFINITY,
        _ => {}
    }
    let radix = match text.get(..2) {
        Some("0x" | "0X") => Some(16),
        Some("0o" | "0O") => Some(8),
        Some("0b" | "0B") => Some(2),
        _ => None,
    };
    if let Some(radix) = radix {
        let digits = &text[2..];
        if digits.is_empty() {
            return f64::NAN;
        }
        return digits
            .chars()
            .try_fold(0f64, |value, c| Some(value * f64::from(radix) + f64::from(c.to_digit(radix)?)))
            .unwrap_or(f64::NAN);
    }
    if !is_decimal_literal(text) {
        return f64::NAN;
    }
    text.parse().unwrap_or(f64::NAN)
}

/// JavaScript `Number(value)` for JSON values.
pub fn js_coerce_number(value: &Value) -> f64 {
    match value {
        Value::Null => 0.0,
        Value::Bool(flag) => f64::from(u8::from(*flag)),
        Value::Number(number) => number.as_f64().unwrap_or(f64::NAN),
        Value::String(text) => js_to_number(text),
        // Arrays convert through `String(array)`; plain objects become "[object Object]".
        Value::Array(_) => js_to_number(&js_to_string(value)),
        Value::Object(_) => f64::NAN,
    }
}

/// JavaScript `String(value)` for JSON values.
pub fn js_to_string(value: &Value) -> String {
    match value {
        Value::Null => "null".into(),
        Value::Bool(flag) => flag.to_string(),
        Value::Number(number) => match number.as_f64() {
            Some(float) if !(number.is_i64() || number.is_u64()) => js_number_to_string(float),
            _ => number.to_string(),
        },
        Value::String(text) => text.clone(),
        // `Array.prototype.join` writes null elements as empty strings.
        Value::Array(items) => items
            .iter()
            .map(|item| if item.is_null() { String::new() } else { js_to_string(item) })
            .collect::<Vec<_>>()
            .join(","),
        Value::Object(_) => "[object Object]".into(),
    }
}

/// JavaScript `Number.prototype.toString()` (`String(number)`).
pub fn js_number_to_string(value: f64) -> String {
    if value.is_nan() {
        return "NaN".into();
    }
    if value.is_infinite() {
        return if value > 0.0 { "Infinity" } else { "-Infinity" }.into();
    }
    if value == 0.0 {
        return "0".into();
    }
    let sign = if value < 0.0 { "-" } else { "" };
    // `{:e}` yields the shortest round-trip digits, like ECMAScript's Number::toString.
    let scientific = format!("{:e}", value.abs());
    let (mantissa, exponent) = scientific.split_once('e').expect("exponent");
    let exponent: i32 = exponent.parse().expect("exponent");
    let digits: String = mantissa.chars().filter(|c| *c != '.').collect();
    let k = digits.len() as i32;
    let n = exponent + 1;
    let body = if k <= n && n <= 21 {
        format!("{digits}{}", "0".repeat((n - k) as usize))
    } else if 0 < n && n <= 21 {
        format!("{}.{}", &digits[..n as usize], &digits[n as usize..])
    } else if -6 < n && n <= 0 {
        format!("0.{}{digits}", "0".repeat((-n) as usize))
    } else {
        let mantissa = if k == 1 { digits } else { format!("{}.{}", &digits[..1], &digits[1..]) };
        let e = n - 1;
        format!("{mantissa}e{}{}", if e < 0 { '-' } else { '+' }, e.abs())
    };
    format!("{sign}{body}")
}

struct JsFormatter;

impl serde_json::ser::Formatter for JsFormatter {
    fn write_f64<W: ?Sized + std::io::Write>(&mut self, writer: &mut W, value: f64) -> std::io::Result<()> {
        writer.write_all(js_number_to_string(value).as_bytes())
    }
}

/// `JSON.stringify(value)`: like `serde_json::to_string`, but floats use the JavaScript
/// number formatting (`0.000004`, not `4e-6`).
pub fn to_js_json(value: &Value) -> String {
    use serde::Serialize;
    let mut output = Vec::new();
    let mut serializer = serde_json::Serializer::with_formatter(&mut output, JsFormatter);
    value.serialize(&mut serializer).expect("JSON values always serialize");
    String::from_utf8(output).expect("JSON output is UTF-8")
}

/// Decoded `URLSearchParams`.
#[derive(Debug, Clone, Default, PartialEq, Eq)]
pub struct QueryParams {
    entries: Vec<(String, String)>,
}

impl QueryParams {
    pub fn parse(query: Option<&str>) -> Self {
        let entries = query
            .map(|query| {
                url::form_urlencoded::parse(query.as_bytes()).map(|(k, v)| (k.into_owned(), v.into_owned())).collect()
            })
            .unwrap_or_default();
        Self { entries }
    }

    /// `Object.fromEntries(searchParams)[key]` (the last value wins).
    pub fn last(&self, key: &str) -> Option<&str> {
        self.entries.iter().rev().find(|(k, _)| k == key).map(|(_, v)| v.as_str())
    }

    /// `searchParams.get(key)` (the first value wins).
    pub fn first(&self, key: &str) -> Option<&str> {
        self.entries.iter().find(|(k, _)| k == key).map(|(_, v)| v.as_str())
    }

    /// `Object.fromEntries(searchParams)`, the input query schemas parse.
    pub fn to_object(&self) -> Value {
        let mut object = Map::new();
        for (key, value) in &self.entries {
            object.insert(key.clone(), Value::String(value.clone()));
        }
        Value::Object(object)
    }
}
