## v1.0.1 - Intercom helper ready for API flows
The Intercom API helper now ships with configurable authentication, request building, and contact operations so integrations can securely talk to Intercom with minimal setup.

### Added
- Configuration helpers plus a reusable `request` wrapper that manages tokens, headers, and JSON payloads for Intercom endpoints.
- High-level contact helpers (`createContact`, `updateContact`, `searchContacts`) plus `selfTest` to verify connectivity before shipping.
