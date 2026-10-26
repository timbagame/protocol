//! Commit-reveal winner selection for EVM contract v0.1.0 (`evm/v0.1.0/randomness.ts`).

use alloy_primitives::{keccak256, B256, U256};
use alloy_sol_types::SolValue;
use sha2::{Digest, Sha256};

use super::client::{evm_domain, EvmDeployment};

pub const EVM_RANDOMNESS_VERSION: &str = "keccak256-domain-block-u256-v1";

/// `sha256(secret)`, the commitment revealed by `completeGame`.
pub fn commitment_for(secret: B256) -> B256 {
    B256::from_slice(&Sha256::digest(secret.as_slice()))
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct EvmWinner {
    pub random_value: U256,
    pub winner_index: u32,
}

/// Rejection sampling over `uint256`, rehashing `(entropy, round)` for up to 32 rounds.
pub fn select_evm_winner_from_entropy(initial_entropy: B256, participants: u32) -> anyhow::Result<EvmWinner> {
    select_with(initial_entropy, participants, |entropy, round| keccak256((entropy, U256::from(round)).abi_encode()))
}

fn select_with(
    initial_entropy: B256,
    participants: u32,
    rehash: impl Fn(B256, u8) -> B256,
) -> anyhow::Result<EvmWinner> {
    if !(1..=315).contains(&participants) {
        anyhow::bail!("Participant count must be between 1 and 315");
    }
    let n = U256::from(participants);
    // (2^256) % n, computed as (2^256 - n) % n.
    let threshold = U256::ZERO.wrapping_sub(n) % n;
    let mut entropy = initial_entropy;
    for round in 0..32u8 {
        let random_value = U256::from_be_bytes(entropy.0);
        if random_value >= threshold {
            return Ok(EvmWinner { random_value, winner_index: (random_value % n).to::<u32>() });
        }
        entropy = rehash(entropy, round);
    }
    anyhow::bail!("Unable to generate unbiased randomness")
}

pub fn calculate_evm_winner(
    deployment: &EvmDeployment,
    game_id: B256,
    secret: B256,
    commitment: B256,
    last_entry_block: U256,
    participants: u32,
) -> anyhow::Result<EvmWinner> {
    if commitment_for(secret) != commitment {
        anyhow::bail!("Invalid reveal");
    }
    evm_domain(deployment)?;
    let encoded = (U256::from(deployment.chain_id), deployment.address, game_id, secret, last_entry_block).abi_encode();
    select_evm_winner_from_entropy(keccak256(encoded), participants)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn accepts_entropy_at_the_threshold() {
        // 2^256 % 3 == 1: entropy 1 is the smallest unbiased value.
        let one = B256::with_last_byte(1);
        let winner = select_with(one, 3, |_, _| unreachable!()).unwrap();
        assert_eq!((winner.random_value, winner.winner_index), (U256::from(1), 1));
    }

    #[test]
    fn gives_up_after_32_biased_rounds() {
        // 2^256 % 3 == 1, so zero entropy is always rejected.
        let error = select_with(B256::ZERO, 3, |_, _| B256::ZERO).unwrap_err();
        assert_eq!(error.to_string(), "Unable to generate unbiased randomness");
    }
}
