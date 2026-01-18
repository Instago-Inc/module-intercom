# module/intercom - V8 module

Intercom is often the center of how teams connect with customers. This module keeps that connection lightweight so workflows can create, update, and search contacts without extra setup.

If you are building on the hgi-v8 runtime, it offers a small, predictable surface area while still allowing direct calls to Intercom endpoints when you need them. Learn more at https://instago.ai.

## Technical reference

Exports:
- `configure({ accessToken?, baseUrl?, version? })`
- `request({ path, method?, query?, body?, token?, headers?, debug? })`
- `createContact({ email?, phone?, name?, externalId?, customAttributes?, signedUpAt?, lastSeenAt?, ownerId?, token? })`
- `updateContact({ id, email?, phone?, name?, externalId?, customAttributes?, signedUpAt?, lastSeenAt?, ownerId?, token? })`
- `searchContacts({ query, token? })`
- `selfTest()`

Usage:
- `require('intercom@latest')`
- All methods return `{ ok, data, error, status? }`.
- `request` defaults to `GET` when `body` is omitted, otherwise `POST` unless `method` is provided.

Configuration:
- `configure({ accessToken, baseUrl, version })` sets defaults for subsequent calls.
- Env keys (all optional): `intercom.accessToken`, `intercom.token`, `intercom.baseUrl`, `intercom.version`.
- `token` can be passed per-call to override configured or env tokens.

Examples:

Create a contact:
```js
const intercom = require('intercom@latest');
intercom.configure({ accessToken: 'YOUR_TOKEN' });

const res = await intercom.createContact({
  email: 'customer@example.com',
  name: 'Customer One',
  externalId: 'user_123',
  customAttributes: { plan: 'pro' }
});
```

Update a contact:
```js
const intercom = require('intercom@latest');
const res = await intercom.updateContact({
  id: '123',
  phone: '+15551234567',
  lastSeenAt: '2024-01-15T12:30:00Z'
});
```

Search contacts:
```js
const intercom = require('intercom@latest');
const res = await intercom.searchContacts({
  query: { field: 'email', operator: '=', value: 'customer@example.com' }
});
```

Custom request:
```js
const intercom = require('intercom@latest');
const res = await intercom.request({
  path: '/conversations',
  method: 'POST',
  body: { from: { type: 'user', id: '123' }, body: 'Hello there' }
});
```
