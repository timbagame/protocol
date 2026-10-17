//! `@timbagame/protocol/bot`.

use super::common::SIMPLE_API_ERROR;
use super::Endpoint;
use crate::schema::Schema;

pub static COMPLETED_GAME_NOTIFICATION: Schema = Schema::StrictObject(&[
    ("gameAddress", Schema::Address),
    ("winnerAddress", Schema::Address),
    ("winnerTxSignature", Schema::Signature),
    ("totalPot", Schema::NonNegativeNumber),
]);

pub static COMPLETED_GAME_NOTIFICATION_RESPONSE: Schema = Schema::Object(&[("success", Schema::BoolLiteral(true))]);

pub static BOT_HEALTH_RESPONSE: Schema = Schema::Object(&[("status", Schema::Literal("ok"))]);

pub static BOT_CONTRACT: &[(&str, Endpoint)] = &[
    ("health", Endpoint::get("/health", false).responses(&[(200, &BOT_HEALTH_RESPONSE)])),
    (
        "completedGame",
        Endpoint::post("/internal/completed", false).body(&COMPLETED_GAME_NOTIFICATION).responses(&[
            (200, &COMPLETED_GAME_NOTIFICATION_RESPONSE),
            (400, &SIMPLE_API_ERROR),
            (500, &SIMPLE_API_ERROR),
        ]),
    ),
];
