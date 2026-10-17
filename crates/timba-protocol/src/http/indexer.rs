//! `@timbagame/protocol/indexer`.

use super::common::SIMPLE_API_ERROR;
use super::Endpoint;
use crate::schema::{array, Schema, MAX_SAFE_INTEGER, NON_EMPTY_STRING};

const MAX_SAFE: i64 = MAX_SAFE_INTEGER as i64;
const GAME_TYPES: &[&str] = &["coinflip", "giveaway"];

pub static GAME_TYPE: Schema = Schema::Enum(GAME_TYPES);
pub static GAME_STATUS: Schema = Schema::Enum(&["active", "completed", "cancelled"]);

static NULLABLE_AMOUNT: Schema = Schema::Nullable(&Schema::NonNegativeNumber);
static NULLABLE_PRICE_USD: Schema = Schema::Nullable(&Schema::NonNegativeNumber);

pub static INDEXER_GAME: Schema = Schema::Object(&[
    ("signature", Schema::Signature),
    ("gameKey", Schema::Address),
    ("status", Schema::Optional(&GAME_STATUS)),
    ("creator", Schema::Optional(&Schema::Nullable(&Schema::Address))),
    ("gameType", Schema::Optional(&Schema::Nullable(&GAME_TYPE))),
    ("ticketAmount", Schema::Optional(&NULLABLE_AMOUNT)),
    ("totalAmount", Schema::Optional(&NULLABLE_AMOUNT)),
    ("maxTickets", Schema::Optional(&Schema::Nullable(&Schema::NonNegativeInteger))),
    ("minTickets", Schema::Optional(&Schema::Nullable(&Schema::NonNegativeInteger))),
    ("isPrivate", Schema::Optional(&Schema::Nullable(&Schema::Bool))),
    ("createdAt", Schema::Optional(&Schema::Nullable(&Schema::NonNegativeInteger))),
    ("timeout", Schema::Optional(&Schema::Nullable(&Schema::NonNegativeInteger))),
    ("expiresAt", Schema::Optional(&Schema::Nullable(&Schema::NonNegativeInteger))),
    ("winner", Schema::Nullable(&Schema::Address)),
    ("winnerAmount", Schema::Ref(&NULLABLE_AMOUNT)),
    ("feeAmount", Schema::Ref(&NULLABLE_AMOUNT)),
    ("ticketsCount", Schema::Nullable(&Schema::NonNegativeInteger)),
    ("tokenMint", Schema::Address),
    ("timestamp", Schema::NonNegativeInteger),
    ("slot", Schema::NonNegativeInteger),
    ("priceUsd", Schema::Optional(&NULLABLE_PRICE_USD)),
    ("isCreator", Schema::Optional(&Schema::Bool)),
    ("isPlayer", Schema::Optional(&Schema::Bool)),
    ("isJoined", Schema::Optional(&Schema::Bool)),
]);

pub static INDEXER_TOKEN_FINANCIAL_STATS: Schema = Schema::Object(&[
    ("tokenMint", Schema::Address),
    ("totalVolume", Schema::NonNegativeNumber),
    ("totalFees", Schema::NonNegativeNumber),
    ("priceUsd", Schema::Optional(&NULLABLE_PRICE_USD)),
    (
        "biggestWin",
        Schema::Nullable(&Schema::Object(&[
            ("amount", Schema::NonNegativeNumber),
            ("winner", Schema::Address),
            ("signature", Schema::Signature),
        ])),
    ),
]);

pub static INDEXER_STATS_RESPONSE: Schema = Schema::Object(&[
    ("totalGames", Schema::NonNegativeInteger),
    ("uniquePlayers", Schema::NonNegativeInteger),
    ("financials", array(&INDEXER_TOKEN_FINANCIAL_STATS)),
    ("lastUpdated", Schema::NonNegativeInteger),
]);

pub static INDEXER_GAMES_RESPONSE: Schema = Schema::Object(&[
    ("games", array(&INDEXER_GAME)),
    ("total", Schema::NonNegativeInteger),
    ("page", Schema::PositiveInteger),
    ("limit", Schema::PositiveInteger),
]);

pub static INDEXER_PLAYER_GAMES_RESPONSE: Schema = Schema::Object(&[
    ("games", array(&INDEXER_GAME)),
    ("count", Schema::NonNegativeInteger),
    ("limit", Schema::PositiveInteger),
    ("offset", Schema::NonNegativeInteger),
]);

pub static INDEXER_ACTIVE_GAME: Schema = Schema::Object(&[
    ("game_key", Schema::Address),
    ("creator", Schema::Address),
    ("ticket_amount", Schema::NonNegativeNumber),
    ("total_amount", Schema::NonNegativeNumber),
    ("max_tickets", Schema::NonNegativeInteger),
    ("min_tickets", Schema::NonNegativeInteger),
    ("current_tickets", Schema::NonNegativeInteger),
    ("token_mint", Schema::Address),
    ("is_private", Schema::IntLiterals(&[0, 1])),
    ("created_at", Schema::NonNegativeInteger),
    ("timeout", Schema::NonNegativeInteger),
    ("signature", Schema::Signature),
    ("slot", Schema::NonNegativeInteger),
    ("indexed_at", Schema::NonNegativeInteger),
    ("expiresAt", Schema::NonNegativeInteger),
    ("timeLeft", Schema::NonNegativeInteger),
    ("isPrivate", Schema::Bool),
    ("game_type", Schema::Nullable(&GAME_TYPE)),
    ("priceUsd", Schema::Optional(&NULLABLE_PRICE_USD)),
]);

pub static INDEXER_ACTIVE_GAMES_RESPONSE: Schema =
    Schema::Object(&[("games", array(&INDEXER_ACTIVE_GAME)), ("count", Schema::NonNegativeInteger)]);

pub static INDEXER_PLAYER_PROFILE: Schema = Schema::Object(&[
    ("wallet", Schema::Address),
    (
        "summary",
        Schema::Object(&[
            ("relatedGames", Schema::NonNegativeInteger),
            ("createdGames", Schema::NonNegativeInteger),
            ("playedGames", Schema::NonNegativeInteger),
            ("activeGames", Schema::NonNegativeInteger),
            ("completedGames", Schema::NonNegativeInteger),
            ("cancelledGames", Schema::NonNegativeInteger),
            ("wins", Schema::NonNegativeInteger),
            ("losses", Schema::NonNegativeInteger),
            ("lastActivity", Schema::Nullable(&Schema::NonNegativeInteger)),
        ]),
    ),
    (
        "tokens",
        array(&Schema::Object(&[
            ("tokenMint", Schema::Address),
            ("gamesPlayed", Schema::NonNegativeInteger),
            ("stakedAmount", Schema::NonNegativeNumber),
            ("wonAmount", Schema::NonNegativeNumber),
            ("priceUsd", Schema::Optional(&NULLABLE_PRICE_USD)),
        ])),
    ),
    (
        "frequentPlayers",
        array(&Schema::Object(&[("player", Schema::Address), ("gamesTogether", Schema::NonNegativeInteger)])),
    ),
    ("historyComplete", Schema::Bool),
]);

pub static INDEXER_TOKEN_SUMMARY: Schema = Schema::Object(&[
    ("tokenMint", Schema::Address),
    ("games", Schema::NonNegativeInteger),
    ("latestTimestamp", Schema::NonNegativeInteger),
    ("priceUsd", Schema::Optional(&NULLABLE_PRICE_USD)),
]);

pub static INDEXER_TOKENS_RESPONSE: Schema = Schema::Object(&[("tokens", array(&INDEXER_TOKEN_SUMMARY))]);

pub static INDEXER_LEADERBOARD_PLAYER: Schema = Schema::Object(&[
    ("player", Schema::Address),
    ("games_won", Schema::NonNegativeInteger),
    ("total_winnings", Schema::Nullable(&Schema::NonNegativeNumber)),
    ("avg_win", Schema::Nullable(&Schema::NonNegativeNumber)),
]);

pub static INDEXER_LEADERBOARD_RESPONSE: Schema =
    Schema::Object(&[("players", array(&INDEXER_LEADERBOARD_PLAYER)), ("count", Schema::NonNegativeInteger)]);

pub static INDEXER_HEALTH_RESPONSE: Schema =
    Schema::Object(&[("status", Schema::Literal("ok")), ("timestamp", Schema::NonNegativeInteger)]);

pub static INDEXER_TRIGGER_RESPONSE: Schema = Schema::Object(&[
    ("success", Schema::BoolLiteral(true)),
    ("indexed", Schema::NonNegativeInteger),
    ("total", Schema::NonNegativeInteger),
    ("message", NON_EMPTY_STRING),
]);

pub static INDEXER_TRIGGER_ERROR: Schema =
    Schema::Object(&[("success", Schema::BoolLiteral(false)), ("error", NON_EMPTY_STRING)]);

pub static HISTORICAL_BACKFILL_STATE: Schema = Schema::Object(&[
    ("beforeSignature", Schema::Nullable(&Schema::Signature)),
    ("pages", Schema::NonNegativeInteger),
    ("transactions", Schema::NonNegativeInteger),
    ("initializedEvents", Schema::NonNegativeInteger),
    ("closedEvents", Schema::NonNegativeInteger),
    ("complete", Schema::Bool),
]);

pub static HISTORICAL_INITIALIZED_EVENT: Schema = Schema::Object(&[
    ("signature", Schema::Signature),
    ("gameKey", Schema::Address),
    ("creator", Schema::Address),
    ("gameType", Schema::Ref(&GAME_TYPE)),
    ("ticketAmount", Schema::NonNegativeNumber),
    ("totalAmount", Schema::NonNegativeNumber),
    ("maxTickets", Schema::NonNegativeInteger),
    ("minTickets", Schema::NonNegativeInteger),
    ("tokenMint", Schema::Address),
    ("isPrivate", Schema::Bool),
    ("createdAt", Schema::NonNegativeInteger),
    ("timeout", Schema::NonNegativeInteger),
    ("slot", Schema::NonNegativeInteger),
]);

pub static HISTORICAL_COMPLETED_EVENT: Schema = Schema::Object(&[
    ("signature", Schema::Signature),
    ("gameKey", Schema::Address),
    ("winner", Schema::Address),
    ("winnerAmount", Schema::NonNegativeNumber),
    ("feeAmount", Schema::NonNegativeNumber),
    ("ticketsCount", Schema::NonNegativeInteger),
    ("timestamp", Schema::NonNegativeInteger),
    ("slot", Schema::NonNegativeInteger),
]);

pub static HISTORICAL_CLOSED_EVENT: Schema = Schema::Object(&[
    ("signature", Schema::Signature),
    ("gameKey", Schema::Address),
    ("timestamp", Schema::NonNegativeInteger),
    ("slot", Schema::NonNegativeInteger),
]);

pub static HISTORICAL_OPERATOR_CLOSED_EVENT: Schema = Schema::Object(&[
    ("signature", Schema::Signature),
    ("gameKey", Schema::Address),
    ("timestamp", Schema::NonNegativeInteger),
    ("slot", Schema::NonNegativeInteger),
    ("creator", Schema::Address),
    ("operator", Schema::Address),
    ("refundedAmount", Schema::U64String),
    ("recoveredLamports", Schema::NonNegativeNumber),
]);

pub static HISTORICAL_MEMBERSHIP_EVENT: Schema = Schema::Object(&[
    ("kind", Schema::Enum(&["joined", "unjoined"])),
    ("signature", Schema::Signature),
    ("gameKey", Schema::Address),
    ("player", Schema::Address),
    ("ticketsCount", Schema::NonNegativeInteger),
    ("ticketIndex", Schema::NonNegativeInteger),
    ("timestamp", Schema::NonNegativeInteger),
    ("slot", Schema::NonNegativeInteger),
]);

pub static HISTORICAL_GAME_EVENT_PAGE: Schema = Schema::Object(&[
    ("initialized", array(&HISTORICAL_INITIALIZED_EVENT)),
    ("completed", array(&HISTORICAL_COMPLETED_EVENT)),
    ("closed", array(&HISTORICAL_CLOSED_EVENT)),
    ("operatorClosed", array(&HISTORICAL_OPERATOR_CLOSED_EVENT)),
    ("membership", array(&HISTORICAL_MEMBERSHIP_EVENT)),
    ("nextBefore", Schema::Nullable(&Schema::Signature)),
    ("oldestSlot", Schema::Nullable(&Schema::NonNegativeInteger)),
    ("transactions", Schema::IntegerRange(0, 100)),
    ("complete", Schema::Bool),
]);

pub static BACKFILL_COMMIT_REQUEST: Schema = Schema::StrictObject(&[
    ("expectedBefore", Schema::Nullable(&Schema::Signature)),
    ("page", Schema::Ref(&HISTORICAL_GAME_EVENT_PAGE)),
]);

pub static BACKFILL_STATE_RESPONSE: Schema =
    Schema::Object(&[("success", Schema::BoolLiteral(true)), ("state", Schema::Ref(&HISTORICAL_BACKFILL_STATE))]);

pub static BACKFILL_CONFLICT_RESPONSE: Schema =
    Schema::Object(&[("error", NON_EMPTY_STRING), ("state", Schema::Ref(&HISTORICAL_BACKFILL_STATE))]);

pub static BACKFILL_RETRYABLE_ERROR: Schema = Schema::Object(&[
    ("success", Schema::BoolLiteral(false)),
    ("retryable", Schema::BoolLiteral(true)),
    ("reason", Schema::Enum(&["rpc_rate_limited", "page_failed"])),
    ("error", NON_EMPTY_STRING),
]);

const LIMIT_50: Schema = Schema::CoerceInteger { min: 1, max: 100, default: Some(50) };
const OFFSET: Schema = Schema::CoerceInteger { min: 0, max: MAX_SAFE, default: Some(0) };

pub static PAGINATION_QUERY: Schema = Schema::Object(&[("limit", LIMIT_50), ("offset", OFFSET)]);

pub static GAMES_QUERY: Schema =
    Schema::Object(&[("limit", LIMIT_50), ("offset", OFFSET), ("tokenMint", Schema::Optional(&Schema::Address))]);

pub static PLAYER_QUERY: Schema =
    Schema::Object(&[("limit", LIMIT_50), ("offset", OFFSET), ("player", Schema::Address)]);

pub static LATEST_GAMES_QUERY: Schema = Schema::Object(&[
    ("limit", Schema::CoerceInteger { min: 1, max: 100, default: Some(10) }),
    ("tokenMint", Schema::Optional(&Schema::Address)),
    ("gameType", Schema::Optional(&GAME_TYPE)),
    ("includeLifecycle", Schema::Optional(&Schema::Enum(&["0", "1"]))),
]);

pub static GAME_BY_KEY_QUERY: Schema = Schema::Object(&[
    ("gameKey", Schema::Address),
    ("fresh", Schema::Optional(&Schema::String { min: 0, max: usize::MAX })),
]);

/// `indexerContract.stats.query`.
pub static STATS_QUERY: Schema = Schema::Object(&[("tokenMint", Schema::Optional(&Schema::Address))]);

/// `indexerContract.playerActiveGames.query` and `indexerContract.playerProfile.query`.
pub static PLAYER_ADDRESS_QUERY: Schema = Schema::Object(&[("player", Schema::Address)]);

/// `indexerContract.leaderboard.query`.
pub static LEADERBOARD_QUERY: Schema = Schema::Object(&[
    ("limit", Schema::CoerceInteger { min: 1, max: 100, default: Some(20) }),
    ("tokenMint", Schema::Optional(&Schema::Address)),
]);

/// `indexerContract.latestGames.responses[200]`.
pub static LATEST_GAMES_RESPONSE: Schema = array(&INDEXER_GAME);

pub static INDEXER_CONTRACT: &[(&str, Endpoint)] = &[
    ("health", Endpoint::get("/health", false).responses(&[(200, &INDEXER_HEALTH_RESPONSE)])),
    (
        "triggerIndex",
        Endpoint::post("/api/trigger-index", true).responses(&[
            (200, &INDEXER_TRIGGER_RESPONSE),
            (401, &SIMPLE_API_ERROR),
            (500, &INDEXER_TRIGGER_ERROR),
        ]),
    ),
    (
        "readBackfill",
        Endpoint::get("/api/backfill", true).responses(&[
            (200, &BACKFILL_STATE_RESPONSE),
            (401, &SIMPLE_API_ERROR),
            (429, &BACKFILL_RETRYABLE_ERROR),
            (500, &BACKFILL_RETRYABLE_ERROR),
        ]),
    ),
    (
        "runBackfill",
        Endpoint::post("/api/backfill", true).responses(&[
            (200, &BACKFILL_STATE_RESPONSE),
            (401, &SIMPLE_API_ERROR),
            (429, &BACKFILL_RETRYABLE_ERROR),
            (500, &BACKFILL_RETRYABLE_ERROR),
        ]),
    ),
    (
        "commitBackfill",
        Endpoint::post("/api/backfill/commit", true).body(&BACKFILL_COMMIT_REQUEST).responses(&[
            (200, &BACKFILL_STATE_RESPONSE),
            (400, &SIMPLE_API_ERROR),
            (401, &SIMPLE_API_ERROR),
            (409, &BACKFILL_CONFLICT_RESPONSE),
            (500, &SIMPLE_API_ERROR),
        ]),
    ),
    (
        "stats",
        Endpoint::get("/api/stats", false).query(&STATS_QUERY).responses(&[
            (200, &INDEXER_STATS_RESPONSE),
            (400, &SIMPLE_API_ERROR),
            (500, &SIMPLE_API_ERROR),
        ]),
    ),
    (
        "games",
        Endpoint::get("/api/games", false).query(&GAMES_QUERY).responses(&[
            (200, &INDEXER_GAMES_RESPONSE),
            (400, &SIMPLE_API_ERROR),
            (500, &SIMPLE_API_ERROR),
        ]),
    ),
    (
        "latestGames",
        Endpoint::get("/api/games/latest", false).query(&LATEST_GAMES_QUERY).responses(&[
            (200, &LATEST_GAMES_RESPONSE),
            (400, &SIMPLE_API_ERROR),
            (500, &SIMPLE_API_ERROR),
        ]),
    ),
    (
        "gameByKey",
        Endpoint::get("/api/games/by-key", false).query(&GAME_BY_KEY_QUERY).responses(&[
            (200, &INDEXER_GAME),
            (400, &SIMPLE_API_ERROR),
            (404, &SIMPLE_API_ERROR),
            (500, &SIMPLE_API_ERROR),
        ]),
    ),
    (
        "activeGames",
        Endpoint::get("/api/active-games", false)
            .responses(&[(200, &INDEXER_ACTIVE_GAMES_RESPONSE), (500, &SIMPLE_API_ERROR)]),
    ),
    (
        "playerActiveGames",
        Endpoint::get("/api/my-active-games", false).query(&PLAYER_ADDRESS_QUERY).responses(&[
            (200, &INDEXER_ACTIVE_GAMES_RESPONSE),
            (400, &SIMPLE_API_ERROR),
            (500, &SIMPLE_API_ERROR),
        ]),
    ),
    (
        "playerGames",
        Endpoint::get("/api/player-games", false).query(&PLAYER_QUERY).responses(&[
            (200, &INDEXER_PLAYER_GAMES_RESPONSE),
            (400, &SIMPLE_API_ERROR),
            (500, &SIMPLE_API_ERROR),
        ]),
    ),
    (
        "playerProfile",
        Endpoint::get("/api/player-profile", false).query(&PLAYER_ADDRESS_QUERY).responses(&[
            (200, &INDEXER_PLAYER_PROFILE),
            (400, &SIMPLE_API_ERROR),
            (500, &SIMPLE_API_ERROR),
        ]),
    ),
    (
        "tokens",
        Endpoint::get("/api/tokens", false).responses(&[(200, &INDEXER_TOKENS_RESPONSE), (500, &SIMPLE_API_ERROR)]),
    ),
    (
        "leaderboard",
        Endpoint::get("/api/leaderboard", false).query(&LEADERBOARD_QUERY).responses(&[
            (200, &INDEXER_LEADERBOARD_RESPONSE),
            (400, &SIMPLE_API_ERROR),
            (500, &SIMPLE_API_ERROR),
        ]),
    ),
];
