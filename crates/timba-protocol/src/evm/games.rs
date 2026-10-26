//! EVM game observation and membership (`games/index.ts`: `observeEvmGame`,
//! `normalizeEvmMembership`).

use alloy_primitives::{Address, B256, U256};
use serde_json::{json, Value};

use super::abi::Game;
use super::schema::MAX_SAFE_INTEGER;
use crate::games::{GameReference, GameStatus, GameType, NormalizedGame};

/// `{ chain: "evm", chainId, deployment, gameId }`.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct EvmGameReference {
    pub chain_id: u64,
    pub deployment: Address,
    pub game_id: B256,
}

impl EvmGameReference {
    /// JSON form with bigint values as decimal strings.
    pub fn to_json(&self) -> Value {
        json!({
            "chain": "evm",
            "chainId": self.chain_id.to_string(),
            "deployment": self.deployment.to_checksum(None),
            "gameId": self.game_id.to_string(),
        })
    }
}

impl From<&EvmGameReference> for GameReference {
    fn from(reference: &EvmGameReference) -> Self {
        GameReference::Evm {
            chain_id: reference.chain_id,
            deployment: reference.deployment.to_checksum(None),
            game_id: reference.game_id.to_string(),
        }
    }
}

pub type EvmNormalizedGame = NormalizedGame<EvmGameReference>;

/// Unknown (never created) games observe as `None`.
pub fn observe_evm_game(reference: EvmGameReference, account: &Game) -> anyhow::Result<Option<EvmNormalizedGame>> {
    let status = match account.status {
        0 => return Ok(None),
        1 => GameStatus::Open,
        2 => GameStatus::Completed,
        3 => GameStatus::Closed,
        _ => anyhow::bail!("Unknown game status"),
    };
    Ok(Some(NormalizedGame {
        reference,
        status,
        game_type: GameType::from_code(account.gameType)?,
        minimum_participants: account.minPlayers,
        maximum_participants: account.maxPlayers,
        participant_count: account.participants.len(),
        expires_at: account.expiresAt.to(),
    }))
}

/// Joined or refunded participant, as normalized by `normalizeEvmMembership`.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct MembershipChange {
    pub reference: EvmGameReference,
    pub joined: bool,
    pub player: Address,
    pub index: u64,
    pub moved_participant: Option<Address>,
}

pub(crate) fn safe_index(value: U256) -> anyhow::Result<u64> {
    if value > U256::from(MAX_SAFE_INTEGER) {
        anyhow::bail!("Invalid participant index");
    }
    Ok(value.to::<u64>())
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::games::{game_path, game_reference_key};
    use alloy_primitives::aliases::U48;

    fn reference() -> EvmGameReference {
        EvmGameReference { chain_id: 1, deployment: Address::repeat_byte(0xaa), game_id: B256::repeat_byte(0xAB) }
    }

    #[test]
    fn rejects_codes_and_indexes_the_contract_never_produces() {
        let account = |status: u8, game_type: u8| Game {
            creator: Address::ZERO,
            token: Address::ZERO,
            gameType: game_type,
            status,
            isPrivate: false,
            minPlayers: 2,
            maxPlayers: 2,
            expiresAt: U48::ZERO,
            ticketAmount: U256::ZERO,
            totalAmount: U256::ZERO,
            commitment: B256::ZERO,
            lastEntryBlock: U48::ZERO,
            participants: vec![Address::ZERO],
        };
        assert_eq!(observe_evm_game(reference(), &account(0, 0)).unwrap(), None);
        for (status, expected) in [(1, GameStatus::Open), (2, GameStatus::Completed), (3, GameStatus::Closed)] {
            let game = observe_evm_game(reference(), &account(status, 1)).unwrap().unwrap();
            assert_eq!((game.status, game.game_type, game.participant_count), (expected, GameType::Giveaway, 1));
        }
        let error = observe_evm_game(reference(), &account(4, 0)).unwrap_err();
        assert_eq!(error.to_string(), "Unknown game status");
        let error = observe_evm_game(reference(), &account(1, 2)).unwrap_err();
        assert_eq!(error.to_string(), "Unknown game type");
        let max = U256::from(MAX_SAFE_INTEGER);
        assert_eq!(safe_index(max).unwrap(), MAX_SAFE_INTEGER as u64);
        assert_eq!(safe_index(max + U256::from(1)).unwrap_err().to_string(), "Invalid participant index");
    }

    #[test]
    fn converts_to_the_chain_neutral_reference() {
        let neutral = GameReference::from(&reference());
        let game_id = format!("0x{}", "ab".repeat(32));
        assert_eq!(game_reference_key(&neutral), format!(r#"["evm","1","0x{}","{game_id}"]"#, "aa".repeat(20)));
        let deployment = reference().deployment.to_checksum(None);
        assert_eq!(game_path(&neutral), format!("/play/games/{game_id}?chainId=1&deployment={deployment}"));
        assert_eq!(reference().to_json()["deployment"], deployment);
    }
}
