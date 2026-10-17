//! `@timbagame/protocol/common`: shared primitives and envelopes.

use crate::schema::{Schema, NON_EMPTY_STRING};

pub static SOLANA_ADDRESS: Schema = Schema::Address;
pub static SOLANA_SIGNATURE: Schema = Schema::Signature;
pub static BASE64_TRANSACTION: Schema = Schema::Base64Transaction { max: 16_384 };
pub static HEX32: Schema = Schema::Hex32;
pub static U64_STRING: Schema = Schema::U64String;
pub static NON_NEGATIVE_INTEGER: Schema = Schema::NonNegativeInteger;
pub static POSITIVE_INTEGER: Schema = Schema::PositiveInteger;
pub static UNIX_TIMESTAMP: Schema = Schema::NonNegativeInteger;
pub static SLOT: Schema = Schema::NonNegativeInteger;
pub static NULLABLE_PRICE_USD: Schema = Schema::Nullable(&Schema::NonNegativeNumber);

/// `ServiceMetadataSchema`'s shape.
pub const SERVICE_METADATA_SHAPE: &[(&str, Schema)] = &[
    ("name", NON_EMPTY_STRING),
    ("version", NON_EMPTY_STRING),
    ("environment", NON_EMPTY_STRING),
    ("uptime", Schema::NonNegativeNumber),
];

pub static SERVICE_METADATA: Schema = Schema::Object(SERVICE_METADATA_SHAPE);

/// `ServiceEnvelopeSchema.extend({ ... })`: the envelope keys, then `fields`.
macro_rules! envelope {
    ($($field:expr),* $(,)?) => {
        $crate::schema::Schema::Object(&[
            ("timestamp", $crate::schema::Schema::DateTime),
            ("service", $crate::schema::Schema::Object($crate::http::common::SERVICE_METADATA_SHAPE)),
            $($field),*
        ])
    };
}
pub(crate) use envelope;

pub static SERVICE_ENVELOPE: Schema = envelope!();

pub static API_ERROR: Schema = envelope!(("success", Schema::BoolLiteral(false)), ("error", NON_EMPTY_STRING));

pub static SIMPLE_API_ERROR: Schema = Schema::Object(&[("error", NON_EMPTY_STRING)]);
