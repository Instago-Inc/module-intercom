// intercom@latest - minimal Intercom API helper
// API:
// - configure({ accessToken?, baseUrl?, version? })
// - request({ path, method?, query?, body?, token?, headers?, debug? })
// - createContact({ email?, phone?, name?, externalId?, customAttributes?, signedUpAt?, lastSeenAt?, ownerId?, token? })
// - updateContact({ id, email?, phone?, name?, externalId?, customAttributes?, signedUpAt?, lastSeenAt?, ownerId?, token? })
// - searchContacts({ query, token? })

(function () {
  const http = require('http@latest');
  const auth = require('auth@latest');
  const json = require('json@latest');
  const qs = require('qs@latest');
  const log = require('log@latest').create('intercom');

  const DEFAULT_BASE_URL = 'https://api.intercom.io';
  const DEFAULT_VERSION = '2.9';

  const cfg = {
    accessToken: null,
    baseUrl: null,
    version: null
  };

  function configure(opts) {
    if (!opts || typeof opts !== 'object') return;
    if (opts.accessToken) cfg.accessToken = String(opts.accessToken).trim();
    if (opts.baseUrl) cfg.baseUrl = String(opts.baseUrl).replace(/\/$/, '');
    if (opts.version) cfg.version = String(opts.version).trim();
  }

  function pickToken(override) {
    return (override && String(override).trim()) ||
      cfg.accessToken ||
      sys.env.get('intercom.accessToken') ||
      sys.env.get('intercom.token') ||
      null;
  }

  function pickBaseUrl() {
    return (cfg.baseUrl || sys.env.get('intercom.baseUrl') || DEFAULT_BASE_URL).replace(/\/$/, '');
  }

  function pickVersion() {
    return cfg.version || sys.env.get('intercom.version') || DEFAULT_VERSION;
  }

  function normalizePath(path) {
    const str = String(path || '').trim();
    if (!str) return '';
    return str[0] === '/' ? str : '/' + str;
  }

  function buildHeaders(token, extraHeaders, hasBody) {
    const headers = { 'Accept': 'application/json' };
    const version = pickVersion();
    if (version) headers['Intercom-Version'] = version;
    if (token) {
      const authHeader = auth.bearer(token);
      if (authHeader && authHeader.Authorization) headers.Authorization = authHeader.Authorization;
    }
    if (hasBody) headers['Content-Type'] = 'application/json';
    if (extraHeaders && typeof extraHeaders === 'object') {
      Object.keys(extraHeaders).forEach((key) => {
        if (extraHeaders[key] !== undefined) headers[key] = extraHeaders[key];
      });
    }
    return headers;
  }

  function toEpochSeconds(value) {
    if (value === undefined || value === null || value === '') return undefined;
    if (typeof value === 'number' && Number.isFinite(value)) return Math.floor(value);
    if (value instanceof Date) return Math.floor(value.getTime() / 1000);
    if (typeof value === 'string') {
      const parsed = new Date(value);
      if (!Number.isNaN(parsed.getTime())) return Math.floor(parsed.getTime() / 1000);
    }
    return undefined;
  }

  function buildContactPayload({
    email,
    phone,
    name,
    externalId,
    customAttributes,
    signedUpAt,
    lastSeenAt,
    ownerId
  }) {
    const payload = {};
    if (email) payload.email = String(email);
    if (phone) payload.phone = String(phone);
    if (name) payload.name = String(name);
    if (externalId) payload.external_id = String(externalId);
    const signed = toEpochSeconds(signedUpAt);
    const lastSeen = toEpochSeconds(lastSeenAt);
    if (signed !== undefined) payload.signed_up_at = signed;
    if (lastSeen !== undefined) payload.last_seen_at = lastSeen;
    if (ownerId !== undefined && ownerId !== null && ownerId !== '') payload.owner_id = String(ownerId);
    if (customAttributes && typeof customAttributes === 'object') payload.custom_attributes = customAttributes;
    return payload;
  }

  async function request({ path, method, query, body, token, headers, debug } = {}) {
    const authToken = pickToken(token);
    if (!authToken) return { ok: false, error: 'intercom.request: missing access token' };
    const normalizedPath = normalizePath(path);
    if (!normalizedPath) return { ok: false, error: 'intercom.request: missing path' };

    const baseUrl = pickBaseUrl();
    let url = baseUrl + normalizedPath;
    if (query && typeof query === 'object') {
      const qsValue = qs.encode(query);
      if (qsValue) url += (url.indexOf('?') === -1 ? '?' : '&') + qsValue;
    }

    const hasBody = body !== undefined;
    const reqHeaders = buildHeaders(authToken, headers, hasBody);
    const httpMethod = method ? String(method).toUpperCase() : (hasBody ? 'POST' : 'GET');
    if (debug) log.debug('request', { method: httpMethod, path: normalizedPath });
    const res = await http.json({ url, method: httpMethod, headers: reqHeaders, bodyObj: body });
    const status = res && res.status;
    const data = res && (res.json !== undefined ? res.json : res.raw);
    if (status >= 200 && status < 300) return { ok: true, data, status };
    const errorText = typeof res.raw === 'string' ? res.raw : json.stringify(data);
    log.error('request:fail', { status, path: normalizedPath });
    return { ok: false, error: errorText || ('intercom.request: unexpected status ' + status), status, data };
  }

  async function createContact({
    email,
    phone,
    name,
    externalId,
    customAttributes,
    signedUpAt,
    lastSeenAt,
    ownerId,
    token
  } = {}) {
    const payload = buildContactPayload({
      email,
      phone,
      name,
      externalId,
      customAttributes,
      signedUpAt,
      lastSeenAt,
      ownerId
    });
    if (!payload.email && !payload.phone && !payload.external_id) {
      return { ok: false, error: 'intercom.createContact: email, phone, or externalId required' };
    }
    return request({ path: '/contacts', method: 'POST', body: payload, token });
  }

  async function updateContact({
    id,
    email,
    phone,
    name,
    externalId,
    customAttributes,
    signedUpAt,
    lastSeenAt,
    ownerId,
    token
  } = {}) {
    if (!id) return { ok: false, error: 'intercom.updateContact: missing id' };
    const payload = buildContactPayload({
      email,
      phone,
      name,
      externalId,
      customAttributes,
      signedUpAt,
      lastSeenAt,
      ownerId
    });
    return request({ path: '/contacts/' + encodeURIComponent(String(id)), method: 'PUT', body: payload, token });
  }

  async function searchContacts({ query, token } = {}) {
    if (!query || typeof query !== 'object') return { ok: false, error: 'intercom.searchContacts: missing query' };
    return request({ path: '/contacts/search', method: 'POST', body: { query }, token });
  }

  async function selfTest() {
    const token = pickToken();
    if (!token) return 'skipped: missing accessToken';
    const res = await request({ path: '/me', method: 'GET' });
    if (!res || res.ok !== true) throw new Error('selfTest failed');
    return 'ok';
  }

  module.exports = {
    configure,
    request,
    createContact,
    updateContact,
    searchContacts,
    selfTest
  };
})();
