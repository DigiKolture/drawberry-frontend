# Context / Glossary

The shared domain language for Drawberry. This is a glossary only — no implementation
details, no specs. When a term here conflicts with how code or conversation uses a word,
the conflict gets resolved here.

## Connectors & Export

- **Connector** — an external service Drawberry can push an email design to
  (e.g. Mailchimp, SendGrid, Gmail). The provider/integration itself, as a *type*.
  This is the canonical term across the whole codebase.

- **ESP** *(retired)* — "Email Service Provider", the original name for a Connector.
  Deliberately retired: it's too narrow (Gmail isn't an ESP, and connectors needn't be
  email-specific at all). All `esp` code — the module, `/esp` routes, `ESPConstant`,
  store, components — is being renamed to `connector(s)`. Do not introduce "ESP" in new code.

- **Connection** — a specific user's/company's *authorised link* to one Connector.
  One user may have many Connections (one per Connector they've linked). Holds that
  user's credentials for that Connector.

- **Auth kind** — how a Connection is established. Two kinds:
  - **OAuth** — redirect the user to the provider, provider redirects back with a code
    Drawberry exchanges for tokens. Uses **Drawberry's own app credentials**
    (client id/secret in env). Existing: Google, Mailchimp, HubSpot.
  - **API key** — the user pastes **their own** credential(s) into a form
    (one or more fields, provider-specific, e.g. SendGrid = API key;
    Mailjet = key + secret; Customer.io = key + site id). Drawberry validates and stores them.
    The majority of the 24 target providers are this kind.

- **Credentials** — the secret(s) that authorise a Connection. For OAuth, tokens Drawberry
  obtained; for API-key, the value(s) the user supplied. Stored per Connection.

- **Export** — pushing a project's rendered email HTML into a connected provider.
  Canonically **non-sending**: Export creates a reusable template or draft in the user's
  account (Mailchimp/SendGrid/Postmark template, Gmail draft) and never sends the email
  itself — the user sends it from inside their provider. (This is a behaviour change for
  Gmail, which currently drafts *and* sends.)

- **Connected apps** — the user-facing label (in the UI) for a user's Connections.
