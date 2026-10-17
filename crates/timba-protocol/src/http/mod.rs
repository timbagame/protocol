//! The services' HTTP contracts (`common`, `oracle`, `indexer`, `web` and `bot` in the
//! TypeScript package), as [`Schema`]s and endpoint tables.
//!
//! Every exported zod schema has a static here with the same name in upper snake case
//! (`IndexerGameSchema` is [`indexer::INDEXER_GAME`]). `tests/fixtures/http.json`, generated
//! with zod, checks that each one accepts, rejects and outputs exactly what zod does.

use crate::schema::Schema;

pub mod bot;
pub mod common;
pub mod indexer;
pub mod oracle;
pub mod web;

/// `defineEndpoint({...})`.
#[derive(Debug)]
pub struct Endpoint {
    pub method: &'static str,
    pub path: &'static str,
    pub authenticated: bool,
    pub params: Option<&'static Schema>,
    pub query: Option<&'static Schema>,
    pub body: Option<&'static Schema>,
    /// Response schema per HTTP status.
    pub responses: &'static [(u16, &'static Schema)],
}

impl Endpoint {
    const fn new(method: &'static str, path: &'static str, authenticated: bool) -> Self {
        Self { method, path, authenticated, params: None, query: None, body: None, responses: &[] }
    }

    pub const fn get(path: &'static str, authenticated: bool) -> Self {
        Self::new("GET", path, authenticated)
    }

    pub const fn post(path: &'static str, authenticated: bool) -> Self {
        Self::new("POST", path, authenticated)
    }

    pub const fn params(self, schema: &'static Schema) -> Self {
        Self { params: Some(schema), ..self }
    }

    pub const fn query(self, schema: &'static Schema) -> Self {
        Self { query: Some(schema), ..self }
    }

    pub const fn body(self, schema: &'static Schema) -> Self {
        Self { body: Some(schema), ..self }
    }

    pub const fn responses(self, responses: &'static [(u16, &'static Schema)]) -> Self {
        Self { responses, ..self }
    }

    /// The schema a response with `status` must match, if the contract lists it.
    pub fn response(&self, status: u16) -> Option<&'static Schema> {
        self.responses.iter().find(|(code, _)| *code == status).map(|(_, schema)| *schema)
    }
}

/// Looks an endpoint up by its name in the TypeScript contract object.
pub fn endpoint(contract: &'static [(&'static str, Endpoint)], name: &str) -> Option<&'static Endpoint> {
    contract.iter().find(|(key, _)| *key == name).map(|(_, endpoint)| endpoint)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::schema::array;

    static BODY: Schema = Schema::Bool;
    static RESPONSES: [(u16, &Schema); 2] = [(200, &BODY), (404, &BODY)];

    #[test]
    fn builders_fill_the_endpoint_at_runtime_too() {
        // The contract tables run these in const context, which coverage cannot see.
        let path = std::hint::black_box("/games/{address}");
        let endpoint = Endpoint::post(path, true).params(&BODY).query(&BODY).body(&BODY).responses(&RESPONSES);
        assert_eq!((endpoint.method, endpoint.path, endpoint.authenticated), ("POST", path, true));
        assert!([endpoint.params, endpoint.query, endpoint.body].iter().all(|slot| slot.is_some()));
        assert!(std::ptr::eq(endpoint.response(404).unwrap(), &BODY));
        assert!(endpoint.response(500).is_none());
        let endpoint = Endpoint::get(path, false);
        assert_eq!((endpoint.method, endpoint.authenticated), ("GET", false));
        assert!(endpoint.params.is_none() && endpoint.responses.is_empty());
        assert!(matches!(array(std::hint::black_box(&BODY)), Schema::Array { min: 0, max: usize::MAX, .. }));
    }
}
