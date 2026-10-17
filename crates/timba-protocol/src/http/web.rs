//! `@timbagame/protocol/web`.

use serde_json::Value;

use super::common::SIMPLE_API_ERROR;
use super::Endpoint;
use crate::schema::{array, Schema, SchemaError, NON_EMPTY_STRING};

const GAME_TYPES: &[&str] = &["coinflip", "giveaway"];

fn positive_amount(value: &Value) -> Result<(), SchemaError> {
    if value.as_str() == Some("0") {
        Err(SchemaError::new("", "Amount must be positive"))
    } else {
        Ok(())
    }
}

fn player_bounds(value: &Value) -> Result<(), SchemaError> {
    let coinflip = value["type"] == "coinflip";
    let minimum = if coinflip { 2 } else { 1 };
    let min_players = value["minPlayers"].as_i64().unwrap_or_default();
    if min_players < minimum {
        let game_type = if coinflip { "coinflip" } else { "giveaway" };
        return Err(SchemaError::new("minPlayers", format!("Minimum players for {game_type} is {minimum}")));
    }
    if value["maxPlayers"].as_i64().unwrap_or_default() < min_players {
        return Err(SchemaError::new("maxPlayers", "Maximum players must not be lower than minimum players"));
    }
    Ok(())
}

pub static CREATE_GAME_REQUEST: Schema = Schema::Refine(
    &Schema::StrictObject(&[
        ("creator", Schema::Address),
        ("tokenMint", Schema::Address),
        ("type", Schema::Enum(GAME_TYPES)),
        ("amount", Schema::Refine(&Schema::U64String, positive_amount)),
        ("minPlayers", Schema::IntegerRange(1, 100)),
        ("maxPlayers", Schema::IntegerRange(1, 100)),
        ("timeoutSeconds", Schema::IntegerRange(60, 86_400)),
    ]),
    player_bounds,
);

pub static PREPARE_GAME_RESPONSE: Schema = Schema::Object(&[
    ("txBase64", Schema::Base64Transaction { max: 16_384 }),
    ("gameAddress", Schema::Address),
    ("lastValidBlockHeight", Schema::NonNegativeInteger),
]);

pub static SUBMIT_GAME_REQUEST: Schema =
    Schema::StrictObject(&[("txBase64", Schema::Base64Transaction { max: 4_000 })]);

pub static SUBMIT_GAME_RESPONSE: Schema = Schema::Object(&[("signature", Schema::Signature)]);

pub static SERIALIZED_GAME: Schema = Schema::Object(&[
    ("address", Schema::Address),
    ("creator", Schema::Address),
    ("type", Schema::Enum(GAME_TYPES)),
    ("tokenMint", Schema::Address),
    ("stakeAmount", Schema::U64String),
    ("prizeAmount", Schema::U64String),
    ("currentPlayers", Schema::NonNegativeInteger),
    ("minPlayers", Schema::NonNegativeInteger),
    ("maxPlayers", Schema::NonNegativeInteger),
    ("isPrivate", Schema::Bool),
    ("createdAt", Schema::NonNegativeInteger),
    ("expiresAt", Schema::NonNegativeInteger),
    ("lastSlot", Schema::U64String),
    ("participantAddresses", array(&Schema::Address)),
]);

pub static GAME_TOKEN_CONFIG: Schema = Schema::Object(&[
    ("mint", Schema::Address),
    ("symbol", NON_EMPTY_STRING),
    ("decimals", Schema::IntegerRange(0, 255)),
    ("minimumAmount", NON_EMPTY_STRING),
    ("minimumAmountRaw", Schema::U64String),
    ("enabled", Schema::Bool),
    ("priceUsd", Schema::Optional(&Schema::Nullable(&Schema::NonNegativeNumber))),
]);

pub static GAME_CONFIG_RESPONSE: Schema = Schema::Object(&[("tokens", array(&GAME_TOKEN_CONFIG))]);

pub static VERIFY_GAME_REQUEST: Schema = Schema::StrictObject(&[("signature", Schema::Signature)]);

pub static GAME_ADDRESS_PARAMS: Schema = Schema::Object(&[("address", Schema::Address)]);

pub static VERIFY_GAME_PARAMS: Schema = Schema::Object(&[("signature", Schema::Signature)]);

/// `webContract.game.query`.
pub static GAME_QUERY: Schema = Schema::Object(&[("fresh", Schema::Optional(&Schema::Enum(&["0", "1"])))]);

static PARTICIPANT: Schema = Schema::Object(&[
    ("address", Schema::Address),
    ("ticketCount", Schema::NonNegativeInteger),
    ("ticketIndices", array(&Schema::NonNegativeInteger)),
]);

static CALCULATION_BREAKDOWN: Schema = Schema::Object(&[
    ("randomValue", Schema::U64String),
    ("totalTickets", Schema::NonNegativeInteger),
    ("winnerIndex", Schema::NonNegativeInteger),
    ("formula", NON_EMPTY_STRING),
]);

static TRANSACTION_SIGNATURES: Schema = Schema::Array { item: &Schema::Signature, min: 1, max: 2001 };

/// `VerifiedGameSchema` with the proof fields either optional or required.
macro_rules! verified_game {
    ($proof:expr, $signatures:expr) => {
        Schema::Object(&[
            ("gameKey", Schema::Address),
            ("signature", Schema::Signature),
            ("timestamp", Schema::NonNegativeInteger),
            ("gameType", Schema::Optional(&Schema::Enum(GAME_TYPES))),
            ("creator", Schema::Optional(&Schema::Address)),
            ("isPrivate", Schema::Optional(&Schema::Bool)),
            ("ticketAmount", Schema::Optional(&Schema::NonNegativeNumber)),
            ("totalAmount", Schema::Optional(&Schema::NonNegativeNumber)),
            ("maxTickets", Schema::Optional(&Schema::NonNegativeInteger)),
            ("createdAt", Schema::Optional(&Schema::NonNegativeInteger)),
            ("participants", array(&PARTICIPANT)),
            ("totalTickets", Schema::NonNegativeInteger),
            ("winner", Schema::Address),
            ("winnerTicketIndex", Schema::NonNegativeInteger),
            ("prizeAmount", Schema::NonNegativeNumber),
            ("feeAmount", Schema::NonNegativeNumber),
            ("tokenMint", Schema::Address),
            ("tokenSymbol", NON_EMPTY_STRING),
            ("tokenDecimals", Schema::IntegerRange(0, 255)),
            ("randomValue", Schema::U64String),
            ("secretKey", $proof(&Schema::Hex32)),
            ("randomHash", $proof(&Schema::Hex32)),
            ("transactionSignatures", $signatures),
            ("lastSlot", $proof(&Schema::U64String)),
            ("calculationBreakdown", Schema::Ref(&CALCULATION_BREAKDOWN)),
            ("explorerUrl", Schema::Url),
        ])
    };
}

pub static VERIFIED_GAME: Schema = verified_game!(Schema::Optional, Schema::Optional(&TRANSACTION_SIGNATURES));

/// Complete published proof; chain reconstruction remains the oracle's responsibility.
pub static FINALIZED_VERIFIED_GAME: Schema = verified_game!(Schema::Ref, Schema::Ref(&TRANSACTION_SIGNATURES));

pub static WEB_CONTRACT: &[(&str, Endpoint)] = &[
    (
        "prepareGame",
        Endpoint::post("/api/play/games/prepare", false).body(&CREATE_GAME_REQUEST).responses(&[
            (200, &PREPARE_GAME_RESPONSE),
            (400, &SIMPLE_API_ERROR),
            (403, &SIMPLE_API_ERROR),
            (413, &SIMPLE_API_ERROR),
            (415, &SIMPLE_API_ERROR),
            (503, &SIMPLE_API_ERROR),
        ]),
    ),
    (
        "submitGame",
        Endpoint::post("/api/play/games/submit", false).body(&SUBMIT_GAME_REQUEST).responses(&[
            (200, &SUBMIT_GAME_RESPONSE),
            (400, &SIMPLE_API_ERROR),
            (403, &SIMPLE_API_ERROR),
            (415, &SIMPLE_API_ERROR),
            (503, &SIMPLE_API_ERROR),
        ]),
    ),
    (
        "gameConfig",
        Endpoint::get("/api/play/config", false).responses(&[(200, &GAME_CONFIG_RESPONSE), (503, &SIMPLE_API_ERROR)]),
    ),
    (
        "game",
        Endpoint::get("/api/play/games/:address", false).params(&GAME_ADDRESS_PARAMS).query(&GAME_QUERY).responses(&[
            (200, &SERIALIZED_GAME),
            (400, &SIMPLE_API_ERROR),
            (404, &SIMPLE_API_ERROR),
            (503, &SIMPLE_API_ERROR),
        ]),
    ),
    (
        "verifyGame",
        Endpoint::post("/api/verify-game", false).body(&VERIFY_GAME_REQUEST).responses(&[
            (200, &FINALIZED_VERIFIED_GAME),
            (400, &SIMPLE_API_ERROR),
            (403, &SIMPLE_API_ERROR),
            (503, &SIMPLE_API_ERROR),
        ]),
    ),
    (
        "cachedVerifyGame",
        Endpoint::get("/api/verify-game/:signature", false).params(&VERIFY_GAME_PARAMS).responses(&[
            (200, &FINALIZED_VERIFIED_GAME),
            (400, &SIMPLE_API_ERROR),
            (503, &SIMPLE_API_ERROR),
        ]),
    ),
];
