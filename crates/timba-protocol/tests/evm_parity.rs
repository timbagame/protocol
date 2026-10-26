//! Byte-for-byte parity with the package's EVM v0.1.0 client (see fixtures/README).
#![cfg(feature = "evm")]

use alloy_primitives::{aliases::U48, Address, Bytes, B256, U256};
use serde_json::{json, Value};
use timba_protocol::evm::abi::{CreateRequest, Game};
use timba_protocol::evm::actions::{evm_game_actions, EvmGameActions};
use timba_protocol::evm::client::{
    close_game_transaction, complete_game_transaction, create_game_transaction, creation_digest, game_id_for,
    invalidate_creation_nonce_transaction, join_game_transaction, private_join_digest, refund_player_transaction,
    token_approval_transaction, ContractTransaction, EvmDeployment,
};
use timba_protocol::evm::events::{decode_evm_game_event, EvmLog};
use timba_protocol::evm::randomness::{
    calculate_evm_winner, commitment_for, select_evm_winner_from_entropy, EVM_RANDOMNESS_VERSION,
};

fn fixtures() -> Value {
    serde_json::from_str(include_str!("fixtures/evm.json")).unwrap()
}

fn text(value: &Value) -> &str {
    value.as_str().unwrap()
}

fn deployment() -> EvmDeployment {
    EvmDeployment { chain_id: 31337, address: Address::repeat_byte(0x11), version: "0.1.0".into() }
}

fn creator() -> Address {
    text(&fixtures()["creator"]).parse().unwrap()
}

fn player() -> Address {
    text(&fixtures()["player"]).parse().unwrap()
}

fn request() -> CreateRequest {
    CreateRequest {
        creator: creator(),
        token: Address::repeat_byte(0x22),
        gameType: 1,
        amount: U256::from(12_345_678_901_234_567_890u128),
        minPlayers: 1,
        maxPlayers: 10,
        timeout: 3600,
        isPrivate: true,
        commitment: B256::repeat_byte(0xab),
        nonce: U256::from(7),
        deadline: U256::from(1120),
    }
}

const GAME: B256 = B256::repeat_byte(0x44);
const SECRET: B256 = B256::repeat_byte(0xc3);

#[test]
fn identifiers_and_digests_match_typescript() {
    let fixtures = fixtures();
    assert_eq!(game_id_for(&deployment(), creator(), U256::from(7)).unwrap().to_string(), text(&fixtures["gameId"]));
    assert_eq!(creation_digest(&deployment(), &request()).unwrap().to_string(), text(&fixtures["creationDigest"]));
    let join = private_join_digest(&deployment(), GAME, player(), U256::from(1060)).unwrap();
    assert_eq!(join.to_string(), text(&fixtures["joinDigest"]));
    assert_eq!(commitment_for(SECRET).to_string(), text(&fixtures["commitment"]));
}

#[test]
fn domain_rejects_unsupported_deployments() {
    let unsupported = EvmDeployment { version: "0.2.0".into(), ..deployment() };
    let error = game_id_for(&unsupported, Address::ZERO, U256::ZERO).unwrap_err();
    assert_eq!(error.to_string(), "Unsupported EVM contract version");
    for chain_id in [0, 9_007_199_254_740_992] {
        let chain = EvmDeployment { chain_id, ..deployment() };
        assert_eq!(close_game_transaction(&chain, GAME).unwrap_err().to_string(), "Invalid EVM chain ID");
    }
    let largest = EvmDeployment { chain_id: 9_007_199_254_740_991, ..deployment() };
    assert!(close_game_transaction(&largest, GAME).is_ok());
    assert!(creation_digest(&unsupported, &request()).is_err());
    assert!(private_join_digest(&unsupported, GAME, player(), U256::ZERO).is_err());
    assert!(token_approval_transaction(&unsupported, Address::ZERO, U256::ZERO).is_err());
}

#[test]
fn transactions_match_typescript() {
    let fixtures = fixtures();
    let deployment = deployment();
    let transactions = [
        ("create", create_game_transaction(&deployment, request(), Bytes::from(vec![0x12, 0x34]), true)),
        ("joinPublic", join_game_transaction(&deployment, GAME, None)),
        (
            "joinPrivate",
            join_game_transaction(&deployment, GAME, Some((U256::from(1060), Bytes::from(vec![0xab, 0xcd, 0xef])))),
        ),
        ("refund", refund_player_transaction(&deployment, GAME, player())),
        ("complete", complete_game_transaction(&deployment, GAME, SECRET)),
        ("close", close_game_transaction(&deployment, GAME)),
        ("invalidateNonce", invalidate_creation_nonce_transaction(&deployment, U256::from(8))),
        ("approve", token_approval_transaction(&deployment, Address::repeat_byte(0x22), U256::from(500))),
    ];
    for (name, transaction) in transactions {
        let ContractTransaction { chain_id, to, data, value } = transaction.unwrap();
        let actual = json!({
            "chainId": chain_id,
            "to": to.to_checksum(None),
            "data": data.to_string(),
            "value": value.to_string(),
        });
        let expected = &fixtures["transactions"][name];
        for key in ["chainId", "to", "data", "value"] {
            assert_eq!(actual[key], expected[key], "{name}.{key}");
        }
    }
}

#[test]
fn winner_selection_matches_typescript() {
    let fixtures = fixtures();
    assert_eq!(EVM_RANDOMNESS_VERSION, "keccak256-domain-block-u256-v1");
    for case in fixtures["winners"].as_array().unwrap() {
        let participants = case["participants"].as_u64().unwrap() as u32;
        let winner = select_evm_winner_from_entropy(text(&case["entropy"]).parse().unwrap(), participants).unwrap();
        assert_eq!(winner.random_value.to_string(), text(&case["randomValue"]));
        assert_eq!(u64::from(winner.winner_index), case["winnerIndex"].as_u64().unwrap());
    }
    let commitment = commitment_for(SECRET);
    let winner = calculate_evm_winner(&deployment(), GAME, SECRET, commitment, U256::from(77), 5).unwrap();
    assert_eq!(winner.random_value.to_string(), text(&fixtures["winner"]["randomValue"]));
    assert_eq!(u64::from(winner.winner_index), fixtures["winner"]["winnerIndex"].as_u64().unwrap());
}

#[test]
fn winner_selection_rejects_bad_input() {
    let message = |result: anyhow::Result<_>| result.map(|_| ()).unwrap_err().to_string();
    for participants in [0, 316] {
        assert_eq!(
            message(select_evm_winner_from_entropy(B256::ZERO, participants)),
            "Participant count must be between 1 and 315"
        );
    }
    assert_eq!(message(calculate_evm_winner(&deployment(), GAME, SECRET, B256::ZERO, U256::ZERO, 2)), "Invalid reveal");
    let unsupported = EvmDeployment { version: "0.2.0".into(), ..deployment() };
    let commitment = commitment_for(SECRET);
    assert!(calculate_evm_winner(&unsupported, GAME, SECRET, commitment, U256::ZERO, 2).is_err());
}

fn log(entry: &Value) -> EvmLog {
    EvmLog {
        chain_id: 31337,
        address: text(&entry["address"]).parse().unwrap(),
        data: text(&entry["data"]).parse().unwrap(),
        topics: entry["topics"].as_array().unwrap().iter().map(|topic| text(topic).parse().unwrap()).collect(),
        removed: false,
    }
}

#[test]
fn decoded_events_match_typescript() {
    for entry in fixtures()["logs"].as_array().unwrap() {
        let decoded = decode_evm_game_event(&deployment(), &log(entry)).unwrap();
        let json = decoded.map_or(Value::Null, |event| event.to_json());
        // Compare serialized text so key order is checked too.
        assert_eq!(json.to_string(), entry["decoded"].to_string(), "{}", entry["eventName"]);
    }
}

#[test]
fn event_decoding_guards_chain_address_and_removal() {
    let fixtures = fixtures();
    let log = log(&fixtures["logs"][2]);
    let error = decode_evm_game_event(&deployment(), &EvmLog { chain_id: 1, ..log.clone() }).unwrap_err();
    assert_eq!(error.to_string(), "Log belongs to another chain");
    let foreign = EvmLog { address: Address::repeat_byte(0x44), ..log.clone() };
    assert_eq!(decode_evm_game_event(&deployment(), &foreign).unwrap(), None);
    let error = decode_evm_game_event(&deployment(), &EvmLog { removed: true, ..log.clone() }).unwrap_err();
    assert_eq!(error.to_string(), "Removed log requires rollback");
    let unknown = EvmLog { topics: vec![B256::repeat_byte(0x99)], ..log.clone() };
    assert_eq!(decode_evm_game_event(&deployment(), &unknown).unwrap(), None);
    assert_eq!(decode_evm_game_event(&deployment(), &EvmLog { topics: vec![], ..log.clone() }).unwrap(), None);
    let truncated = EvmLog { data: Bytes::from(vec![0u8; 32]), ..log.clone() };
    assert!(decode_evm_game_event(&deployment(), &truncated).is_err());
    let missing_topic = EvmLog { topics: log.topics[..2].to_vec(), ..log.clone() };
    assert!(decode_evm_game_event(&deployment(), &missing_topic).is_err());
    let unsupported = EvmDeployment { version: "0.2.0".into(), ..deployment() };
    assert!(decode_evm_game_event(&unsupported, &log).is_err());
    // A created event whose request carries a game type the contract never emits.
    let mut created = self::log(&fixtures["logs"][0]);
    let mut data = created.data.to_vec();
    data[95] = 2;
    created.data = data.into();
    assert_eq!(decode_evm_game_event(&deployment(), &created).unwrap_err().to_string(), "Unknown game type");
}

fn game(status: u8, game_type: u8, participants: Vec<Address>) -> Game {
    Game {
        creator: creator(),
        token: Address::ZERO,
        gameType: game_type,
        status,
        isPrivate: false,
        minPlayers: 2,
        maxPlayers: 3,
        expiresAt: U48::from(100),
        ticketAmount: U256::ZERO,
        totalAmount: U256::ZERO,
        commitment: B256::ZERO,
        lastEntryBlock: U48::ZERO,
        participants,
    }
}

#[test]
fn game_actions_follow_permissions_and_timing() {
    let actions = |game: &Game, account, now| evm_game_actions(game, account, now, 10);
    let empty = game(1, 0, vec![]);
    let all = |creator, participant, join, refund, close| EvmGameActions { creator, participant, join, refund, close };
    assert_eq!(actions(&empty, Some(creator()), 50), all(true, false, true, false, true));
    assert_eq!(actions(&empty, None, 50), all(false, false, true, false, false));
    let joined = game(1, 0, vec![player()]);
    assert_eq!(actions(&joined, Some(player()), 50), all(false, true, false, false, false));
    // Expired below the minimum: refundable at once, and a giveaway creator may close.
    assert_eq!(actions(&joined, Some(player()), 100), all(false, true, false, true, false));
    let giveaway = game(1, 1, vec![player()]);
    assert_eq!(actions(&giveaway, Some(creator()), 100), all(true, false, false, false, true));
    // Ready games wait for the recovery buffer.
    let ready = game(1, 1, vec![player(), creator()]);
    assert_eq!(actions(&ready, Some(player()), 105), all(false, true, false, false, false));
    assert_eq!(actions(&ready, Some(player()), 110), all(false, true, false, true, false));
    // An open giveaway with players cannot be closed before it is recoverable.
    assert!(!actions(&giveaway, Some(creator()), 50).close);
    let full = game(1, 0, vec![player(), creator(), Address::ZERO]);
    assert!(!actions(&full, None, 50).join);
    let closed = game(3, 0, vec![]);
    assert_eq!(actions(&closed, Some(creator()), 50), all(true, false, false, false, false));
}
