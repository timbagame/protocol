//! Parity with the package's amount and game workflow rules (see fixtures/README).

use serde_json::Value;
use timba_protocol::amounts::parse_token_amount;
use timba_protocol::games::{
    game_capabilities, game_path, game_reference_key, validate_game_draft, Chain, GameDraft, GameReference, GameType,
};

fn fixtures() -> Value {
    serde_json::from_str(include_str!("fixtures/games.json")).unwrap()
}

fn text(value: &Value) -> String {
    value.as_str().unwrap().to_string()
}

#[test]
fn amounts_match_typescript() {
    for case in fixtures()["amounts"].as_array().unwrap() {
        let value = case["value"].as_str().unwrap();
        let result = parse_token_amount(value, case["decimals"].as_u64().unwrap() as u32);
        match result {
            Ok(amount) => assert_eq!(amount.to_string(), text(&case["ok"]), "{value:?}"),
            Err(error) => {
                assert_eq!(error.to_string(), text(&case["error"]), "{value:?}");
                assert_eq!(error.code, text(&case["code"]), "{value:?}");
            }
        }
    }
}

#[test]
fn reference_keys_and_paths_match_typescript() {
    for case in fixtures()["references"].as_array().unwrap() {
        let reference = &case["reference"];
        let reference = match reference["chain"].as_str().unwrap() {
            "evm" => GameReference::Evm {
                chain_id: text(&reference["chainId"]).parse().unwrap(),
                deployment: text(&reference["deployment"]),
                game_id: text(&reference["gameId"]),
            },
            _ => GameReference::Solana {
                network: text(&reference["network"]),
                deployment: text(&reference["deployment"]),
                game_id: text(&reference["gameId"]),
            },
        };
        assert_eq!(game_reference_key(&reference), text(&case["key"]));
        assert_eq!(game_path(&reference), text(&case["path"]));
    }
}

#[test]
fn draft_validation_matches_typescript() {
    for case in fixtures()["drafts"].as_array().unwrap() {
        let draft = &case["draft"];
        let draft = GameDraft {
            game_type: if draft["type"] == "coinflip" { GameType::Coinflip } else { GameType::Giveaway },
            token_mint: text(&draft["tokenMint"]),
            amount: text(&draft["amount"]),
            min_players: draft["minPlayers"].as_f64().unwrap(),
            max_players: draft["maxPlayers"].as_f64().unwrap(),
            timeout_minutes: draft["timeoutMinutes"].as_f64().unwrap_or(f64::INFINITY),
            is_private: draft["isPrivate"].as_bool().unwrap_or(false),
        };
        let chain = if case["chain"] == "evm" { Chain::Evm } else { Chain::Solana };
        let name = format!("{} {}", case["chain"], case["name"]);
        match validate_game_draft(&draft, 6, "1", &game_capabilities(chain)) {
            Ok(amount) => assert_eq!(amount.to_string(), text(&case["ok"]), "{name}"),
            Err(error) => assert_eq!(error.to_string(), text(&case["error"]), "{name}"),
        }
    }
}

#[test]
fn draft_validation_reports_a_bad_minimum() {
    let draft = GameDraft {
        game_type: GameType::Giveaway,
        token_mint: String::new(),
        amount: "1".into(),
        min_players: 1.0,
        max_players: 1.0,
        timeout_minutes: 60.0,
        is_private: false,
    };
    let error = validate_game_draft(&draft, 6, "x", &game_capabilities(Chain::Solana)).unwrap_err();
    assert_eq!(error.to_string(), "Invalid amount format");
}
