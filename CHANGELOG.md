## v1.0.2 - Docs clarify request defaults
Documentation now frames Intercom as the core integration and clarifies how request defaults and token configuration work so teams can connect with confidence.

### Changed
- Updated the README and `docs/index.html` copy to highlight Intercom as the center of customer tooling and to explain how request configuration works.
- Reworded the request guidance and configuration example so the default GET/POST logic and token overrides are directly spelled out.

## v1.0.1 - Intercom helper ready for API flows
The Intercom API helper now ships with configurable authentication, request building, and contact operations so integrations can securely talk to Intercom with minimal setup.

### Added
- Configuration helpers plus a reusable `request` wrapper that manages tokens, headers, and JSON payloads for Intercom endpoints.
- High-level contact helpers (`createContact`, `updateContact`, `searchContacts`) plus `selfTest` to verify connectivity before shipping.
