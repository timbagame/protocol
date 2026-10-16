//! Chain-neutral game rules (`@timbagame/protocol/games`: `index.ts` and `workflows.ts`).

use crate::amounts::{parse_token_amount, TokenAmountError};

/// `GameReference`. EVM values keep the caller's text; `game_reference_key` lowercases them.
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum GameReference {
    Solana { network: String, deployment: String, game_id: String },
    Evm { chain_id: u64, deployment: String, game_id: String },
}

/// Always include deployment and network in cache, journal and UI identity.
pub fn game_reference_key(reference: &GameReference) -> String {
    let parts = match reference {
        GameReference::Evm { chain_id, deployment, game_id } => {
            ["evm".into(), chain_id.to_string(), deployment.to_lowercase(), game_id.to_lowercase()]
        }
        GameReference::Solana { network, deployment, game_id } => {
            ["solana".into(), network.clone(), deployment.clone(), game_id.clone()]
        }
    };
    serde_json::to_string(&parts).expect("strings serialize")
}

/// JavaScript `encodeURIComponent`.
fn encode_uri_component(text: &str) -> String {
    let mut encoded = String::with_capacity(text.len());
    for byte in text.bytes() {
        if byte.is_ascii_alphanumeric() || b"-_.!~*'()".contains(&byte) {
            encoded.push(byte as char);
        } else {
            encoded.push_str(&format!("%{byte:02X}"));
        }
    }
    encoded
}

pub fn game_path(reference: &GameReference) -> String {
    match reference {
        GameReference::Solana { game_id, .. } => format!("/play/games/{}", encode_uri_component(game_id)),
        GameReference::Evm { chain_id, deployment, game_id } => format!(
            "/play/games/{}?chainId={chain_id}&deployment={}",
            encode_uri_component(game_id),
            encode_uri_component(deployment)
        ),
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum GameStatus {
    Open,
    Completed,
    Closed,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum GameType {
    Coinflip,
    Giveaway,
}

impl GameType {
    pub fn from_code(value: u8) -> Result<Self, GameError> {
        match value {
            0 => Ok(Self::Coinflip),
            1 => Ok(Self::Giveaway),
            _ => Err(GameError("Unknown game type")),
        }
    }

    pub fn as_str(self) -> &'static str {
        match self {
            Self::Coinflip => "coinflip",
            Self::Giveaway => "giveaway",
        }
    }
}

/// A rule violation, with the TypeScript error message.
#[derive(Debug, Clone, Copy, PartialEq, Eq, thiserror::Error)]
#[error("{0}")]
pub struct GameError(pub &'static str);

/// The subset of `NormalizedGame` that lifecycle decisions read.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct NormalizedGame<R> {
    pub reference: R,
    pub status: GameStatus,
    pub game_type: GameType,
    pub minimum_participants: u32,
    pub maximum_participants: u32,
    pub participant_count: usize,
    pub expires_at: u64,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct Lifecycle {
    pub expired: bool,
    pub recovery_at: u128,
    pub can_join: bool,
    pub can_settle: bool,
    pub can_refund: bool,
}

/// Derived from the current Oracle buffer. Never cache this as a creation-time economic term.
pub fn game_lifecycle<R>(game: &NormalizedGame<R>, now: u64, buffer: u64) -> Result<Lifecycle, GameError> {
    if buffer == 0 {
        return Err(GameError("Invalid time or buffer"));
    }
    let now = u128::from(now);
    let expires_at = u128::from(game.expires_at);
    let expired = now >= expires_at;
    let recovery_at = expires_at + u128::from(buffer);
    let count = game.participant_count as u128;
    let ready =
        count == u128::from(game.maximum_participants) || (count >= u128::from(game.minimum_participants) && expired);
    let open = game.status == GameStatus::Open;
    Ok(Lifecycle {
        expired,
        recovery_at,
        can_join: open && !expired && count < u128::from(game.maximum_participants),
        can_settle: open && ready && now < recovery_at,
        can_refund: open && expired && (!ready || now >= recovery_at),
    })
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ActionProgress {
    AwaitingWallet,
    Submitted,
    Confirmed,
    Failed,
}

impl ActionProgress {
    pub fn as_str(self) -> &'static str {
        match self {
            Self::AwaitingWallet => "awaiting-wallet",
            Self::Submitted => "submitted",
            Self::Confirmed => "confirmed",
            Self::Failed => "failed",
        }
    }
}

/// Receipt summary: success flag and confirmation count (may be negative on a lagging RPC).
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct ReceiptProgress {
    pub success: bool,
    pub confirmations: i128,
}

pub fn transaction_progress(receipt: Option<ReceiptProgress>, required: u32) -> Result<ActionProgress, GameError> {
    if required < 1 {
        return Err(GameError("Invalid confirmation depth"));
    }
    Ok(match receipt {
        Some(receipt) if receipt.confirmations >= i128::from(required) => {
            if receipt.success {
                ActionProgress::Confirmed
            } else {
                ActionProgress::Failed
            }
        }
        _ => ActionProgress::Submitted,
    })
}

/// `CLIENT_GAME_LIMITS`.
pub mod client_game_limits {
    pub const MAX_PLAYERS: u32 = 100;
    pub const MAX_TIMEOUT: u32 = 86_400;
    pub const DEFAULT_TIMEOUT: u32 = 3_600;
    pub const DEFAULT_BUFFER: u32 = 3_600;
}

/// `GAME_DEFAULTS`: `(min_players, max_players)` per game type.
pub const fn game_defaults(game_type: GameType) -> (u32, u32) {
    match game_type {
        GameType::Coinflip => (2, 2),
        GameType::Giveaway => (1, 10),
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Chain {
    Solana,
    Evm,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct GameCapabilities {
    pub private_games: bool,
    pub min_timeout: u32,
    pub max_timeout: u32,
    pub max_players: u32,
}

pub fn game_capabilities(chain: Chain) -> GameCapabilities {
    GameCapabilities {
        private_games: chain == Chain::Evm,
        min_timeout: if chain == Chain::Evm { 300 } else { 60 },
        max_timeout: client_game_limits::MAX_TIMEOUT,
        max_players: client_game_limits::MAX_PLAYERS,
    }
}

/// `GameDraft`. Counts and minutes are JavaScript numbers, so they stay `f64` and are checked
/// the same way.
#[derive(Debug, Clone, PartialEq)]
pub struct GameDraft {
    pub game_type: GameType,
    pub token_mint: String,
    pub amount: String,
    pub min_players: f64,
    pub max_players: f64,
    pub timeout_minutes: f64,
    pub is_private: bool,
}

#[derive(Debug, Clone, PartialEq, Eq, thiserror::Error)]
pub enum DraftError {
    #[error(transparent)]
    Amount(#[from] TokenAmountError),
    #[error("Invalid game terms")]
    Terms,
}

/// JavaScript `Math.round`: halves round toward positive infinity.
fn js_round(value: f64) -> f64 {
    let floor = value.floor();
    if value - floor >= 0.5 {
        floor + 1.0
    } else {
        floor
    }
}

fn is_integer(value: f64) -> bool {
    value.is_finite() && value.fract() == 0.0
}

/// Validates user input without signing, RPC calls, implicit rounding or float amounts.
pub fn validate_game_draft(
    draft: &GameDraft,
    decimals: u32,
    minimum_amount: &str,
    capabilities: &GameCapabilities,
) -> Result<u128, DraftError> {
    let amount = parse_token_amount(&draft.amount, decimals)?;
    let minimum = parse_token_amount(minimum_amount, decimals)?;
    // Round-trip through seconds so values such as 301 / 60 survive float noise.
    let timeout_seconds = js_round(draft.timeout_minutes * 60.0);
    let floor = if draft.game_type == GameType::Coinflip { 2.0 } else { 1.0 };
    let invalid = amount == 0
        || amount < minimum
        || !is_integer(draft.min_players)
        || !is_integer(draft.max_players)
        || draft.min_players < floor
        || draft.max_players < draft.min_players
        || draft.max_players > f64::from(capabilities.max_players)
        // Number.isSafeInteger: the timeout bounds below already rule out unsafe magnitudes.
        || !is_integer(timeout_seconds)
        || draft.timeout_minutes != timeout_seconds / 60.0
        || timeout_seconds < f64::from(capabilities.min_timeout)
        || timeout_seconds > f64::from(capabilities.max_timeout)
        || (draft.is_private && !capabilities.private_games);
    if invalid {
        return Err(DraftError::Terms);
    }
    Ok(amount)
}

#[cfg(test)]
mod tests {
    use super::*;

    fn game(count: usize, min: u32, max: u32, expires_at: u64) -> NormalizedGame<()> {
        NormalizedGame {
            reference: (),
            status: GameStatus::Open,
            game_type: GameType::Giveaway,
            minimum_participants: min,
            maximum_participants: max,
            participant_count: count,
            expires_at,
        }
    }

    #[test]
    fn lifecycle_settles_full_or_expired_ready_games_before_recovery() {
        let full = game_lifecycle(&game(2, 2, 2, 100), 50, 10).unwrap();
        assert!(full.can_settle && !full.can_join && !full.expired);
        let waiting = game_lifecycle(&game(1, 2, 2, 100), 50, 10).unwrap();
        assert!(!waiting.can_settle && waiting.can_join);
        let expired_ready = game_lifecycle(&game(2, 2, 3, 100), 105, 10).unwrap();
        assert!(expired_ready.can_settle && !expired_ready.can_refund);
        let recovery = game_lifecycle(&game(2, 2, 3, 100), 110, 10).unwrap();
        assert!(!recovery.can_settle && recovery.can_refund);
        assert_eq!(recovery.recovery_at, 110);
        let short = game_lifecycle(&game(1, 2, 3, 100), 100, 10).unwrap();
        assert!(short.can_refund && !short.can_settle);
        let closed = NormalizedGame { status: GameStatus::Closed, ..game(1, 2, 3, 100) };
        let closed = game_lifecycle(&closed, 0, 10).unwrap();
        assert!(!closed.can_join && !closed.can_settle && !closed.can_refund);
        assert_eq!(game_lifecycle(&game(1, 1, 1, 1), 0, 0).unwrap_err().to_string(), "Invalid time or buffer");
        let late = game_lifecycle(&game(1, 1, 1, u64::MAX), u64::MAX, u64::MAX).unwrap();
        assert_eq!(late.recovery_at, 2 * u128::from(u64::MAX));
    }

    #[test]
    fn transaction_progress_requires_depth() {
        let receipt = |success, confirmations| Some(ReceiptProgress { success, confirmations });
        assert_eq!(transaction_progress(None, 2).unwrap(), ActionProgress::Submitted);
        assert_eq!(transaction_progress(receipt(true, 1), 2).unwrap(), ActionProgress::Submitted);
        assert_eq!(transaction_progress(receipt(true, 2), 2).unwrap(), ActionProgress::Confirmed);
        assert_eq!(transaction_progress(receipt(false, 3), 2).unwrap(), ActionProgress::Failed);
        assert_eq!(transaction_progress(receipt(true, -1), 1).unwrap(), ActionProgress::Submitted);
        assert_eq!(transaction_progress(None, 0).unwrap_err().to_string(), "Invalid confirmation depth");
        let names = [ActionProgress::AwaitingWallet, ActionProgress::Submitted, ActionProgress::Confirmed]
            .map(ActionProgress::as_str);
        assert_eq!(names, ["awaiting-wallet", "submitted", "confirmed"]);
        assert_eq!(ActionProgress::Failed.as_str(), "failed");
    }

    #[test]
    fn game_types_and_defaults() {
        assert_eq!(GameType::from_code(0).unwrap().as_str(), "coinflip");
        assert_eq!(GameType::from_code(1).unwrap().as_str(), "giveaway");
        assert_eq!(GameType::from_code(2).unwrap_err().to_string(), "Unknown game type");
        assert_eq!(game_defaults(GameType::Coinflip), (2, 2));
        assert_eq!(game_defaults(GameType::Giveaway), (1, 10));
        assert_eq!(client_game_limits::DEFAULT_TIMEOUT, 3_600);
        assert_eq!(client_game_limits::DEFAULT_BUFFER, 3_600);
    }

    #[test]
    fn js_round_matches_math_round() {
        for (value, rounded) in [(0.5, 1.0), (-0.5, 0.0), (-1.5, -1.0), (2.4, 2.0), (0.49999999999999994, 0.0)] {
            assert_eq!(js_round(value), rounded, "{value}");
        }
        assert!(js_round(f64::NAN).is_nan());
        assert_eq!(js_round(f64::INFINITY), f64::INFINITY);
    }
}
