//! Caller permissions for an EVM game (`evm/actions.ts`).

use alloy_primitives::Address;

use super::abi::Game;

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct EvmGameActions {
    pub creator: bool,
    pub participant: bool,
    pub join: bool,
    pub refund: bool,
    pub close: bool,
}

/// Mirror caller permissions separately from lifecycle timing; simulation remains authoritative.
pub fn evm_game_actions(game: &Game, account: Option<Address>, now: u64, buffer: u64) -> EvmGameActions {
    let open = game.status == 1;
    let creator = account == Some(game.creator);
    let participant = account.is_some_and(|account| game.participants.contains(&account));
    let count = game.participants.len() as u128;
    let now = u128::from(now);
    let expired = now >= u128::from(game.expiresAt);
    let recoverable = open
        && expired
        && (count < u128::from(game.minPlayers) || now >= u128::from(game.expiresAt) + u128::from(buffer));
    EvmGameActions {
        creator,
        participant,
        join: open && !expired && count < u128::from(game.maxPlayers) && !participant,
        refund: recoverable && participant,
        close: open && creator && (count == 0 || (game.gameType == 1 && recoverable)),
    }
}
