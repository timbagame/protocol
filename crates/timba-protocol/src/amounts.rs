//! Exact token amount helpers (`@timbagame/protocol/amounts`).

#[derive(Debug, Clone, PartialEq, Eq, thiserror::Error)]
#[error("{message}")]
pub struct TokenAmountError {
    pub code: &'static str,
    pub message: String,
}

fn assert_decimals(decimals: u32) -> Result<(), TokenAmountError> {
    if decimals > 255 {
        return Err(TokenAmountError {
            code: "decimals",
            message: "Decimals must be an integer between 0 and 255".into(),
        });
    }
    Ok(())
}

/// JavaScript `String.prototype.trim` whitespace: Rust's `char::is_whitespace` plus the BOM,
/// minus U+0085, which JavaScript keeps.
fn is_js_whitespace(c: char) -> bool {
    (c.is_whitespace() && c != '\u{85}') || c == '\u{feff}'
}

/// Accepts unsigned decimal strings, including .5 and 1., with surrounding whitespace.
///
/// The TypeScript version returns an unbounded bigint; amounts above `u128::MAX` fail here
/// with the `range` code.
pub fn parse_token_amount(value: &str, decimals: u32) -> Result<u128, TokenAmountError> {
    assert_decimals(decimals)?;
    let normalized = value.trim_matches(is_js_whitespace);
    let (whole, fraction) = normalized.split_once('.').unwrap_or((normalized, ""));
    let digits = |part: &str| part.bytes().all(|byte| byte.is_ascii_digit());
    if (whole.is_empty() && fraction.is_empty()) || !digits(whole) || !digits(fraction) {
        return Err(TokenAmountError { code: "format", message: "Invalid amount format".into() });
    }
    if fraction.len() > decimals as usize {
        return Err(TokenAmountError {
            code: "precision",
            message: format!("This token supports {decimals} decimal places"),
        });
    }
    let units = format!("{whole}{fraction:0<width$}", width = decimals as usize);
    let significant = units.trim_start_matches('0');
    if significant.is_empty() {
        return Ok(0);
    }
    significant.parse().map_err(|_| TokenAmountError { code: "range", message: "Amount is too large".into() })
}

/// Formats unsigned base units without rounding, including zero-decimal tokens.
pub fn format_token_amount(value: u128, decimals: u32) -> Result<String, TokenAmountError> {
    assert_decimals(decimals)?;
    if decimals == 0 {
        return Ok(value.to_string());
    }
    let d = decimals as usize;
    let digits = value.to_string();
    let padded = if digits.len() < d + 1 { format!("{}{}", "0".repeat(d + 1 - digits.len()), digits) } else { digits };
    let (whole, fraction) = padded.split_at(padded.len() - d);
    let fraction = fraction.trim_end_matches('0');
    Ok(if fraction.is_empty() { whole.to_string() } else { format!("{whole}.{fraction}") })
}

/// JS `tokensToAmount`: `Number(whole) + Number(remainder) / 10^decimals`.
pub fn tokens_to_amount(amount: u64, decimals: u32) -> f64 {
    let divisor = 10u64.pow(decimals);
    let whole = amount / divisor;
    let remainder = amount % divisor;
    whole as f64 + remainder as f64 / divisor as f64
}

#[cfg(test)]
mod tests {
    use super::*;
    use proptest::prelude::*;

    proptest! {
        #[test]
        fn parse_inverts_format(value: u128, decimals in 0u32..=38) {
            let text = format_token_amount(value, decimals).unwrap();
            prop_assert_eq!(parse_token_amount(&format!(" {text} "), decimals).unwrap(), value);
        }

        #[test]
        fn parse_matches_scaled_digits(whole in "[0-9]{0,12}", fraction in "[0-9]{0,6}", decimals in 6u32..=20) {
            prop_assume!(!whole.is_empty() || !fraction.is_empty());
            let expected = whole.parse::<u128>().unwrap_or(0) * 10u128.pow(decimals)
                + fraction.parse::<u128>().unwrap_or(0) * 10u128.pow(decimals - fraction.len() as u32);
            prop_assert_eq!(parse_token_amount(&format!("{whole}.{fraction}"), decimals).unwrap(), expected);
        }
    }

    #[test]
    fn formats() {
        assert_eq!(format_token_amount(0, 6).unwrap(), "0");
        assert_eq!(format_token_amount(1, 6).unwrap(), "0.000001");
        assert_eq!(format_token_amount(1_500_000, 6).unwrap(), "1.5");
        assert_eq!(format_token_amount(42, 0).unwrap(), "42");
        assert!(format_token_amount(1, 256).is_err());
        assert_eq!(tokens_to_amount(1_500_000, 6), 1.5);
    }

    #[test]
    fn parses() {
        let parse = |value: &str, decimals| parse_token_amount(value, decimals);
        let code = |value: &str, decimals| parse(value, decimals).unwrap_err().code;
        assert_eq!(parse(" 1.5 ", 6).unwrap(), 1_500_000);
        assert_eq!(parse(".5", 1).unwrap(), 5);
        assert_eq!(parse("1.", 0).unwrap(), 1);
        assert_eq!(parse("0.000", 255).unwrap(), 0);
        assert_eq!(parse("\u{feff}2\u{a0}", 0).unwrap(), 2);
        assert_eq!(parse(&u128::MAX.to_string(), 0).unwrap(), u128::MAX);
        assert_eq!(code(&format!("{}0", u128::MAX), 0), "range");
        assert_eq!(code("1", 39), "range");
        assert_eq!(code("\u{85}1", 0), "format");
        for bad in ["", ".", "-1", "1e3", "1.2.3", "+1", "1 2", "١"] {
            assert_eq!(code(bad, 6), "format", "{bad:?}");
        }
        assert_eq!(parse("1.1234567", 6).unwrap_err().to_string(), "This token supports 6 decimal places");
        assert_eq!(code("1", 256), "decimals");
    }
}
