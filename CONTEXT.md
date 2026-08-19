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

## Canvas & Compilation

- **Canvas** — the editor surface where a user builds an email design as a flexbox
  layout. It is the **source of truth** for how a design looks: a compiled email is
  judged correct by whether it matches the Canvas.

- **Compile** — turning a design into finished, email-ready HTML: measure the Canvas,
  emit table-based layout that reproduces it, and wrap it in Chrome. Produces the
  **Compiled email HTML**.

- **Measurement** — reading the *actual rendered geometry* of the Canvas in a browser
  (element positions, sizes, alignment, wrapping) so the compiled tables reproduce what
  the Canvas shows, rather than inferring layout from style rules. "We measure it" is the
  canonical opposite of "we guess it from CSS."

- **Compiled email HTML** — the finished, table-based email produced by a Compile. It is
  what gets stored on the project and what **Export**, download, and email preview serve.
  There is one canonical producer of it (the Canvas side), never two.

- **Source hash** — a hash of a design's inputs, stored alongside the Compiled email HTML,
  used to tell whether that HTML is current. A mismatch means "stale — needs recompiling"
  rather than serving out-of-date HTML.

- **Chrome** — the email's outer shell around the compiled content: the container/wrapper
  tables, Outlook (MSO) conditionals, and the `<head>` (fonts, color-scheme metas). The
  parts of the email that are structure/boilerplate rather than the user's design.

- **Force light** — the exported email's stance toward dark mode: it declares itself
  light-only and reasserts its own colors, so clients leave the design's colors alone
  instead of recoloring them. Not a dark *theme* — the deliberate absence of one.
