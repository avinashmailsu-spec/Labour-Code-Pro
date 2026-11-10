# Security — LabourCode Pro Web

The GitHub Pages deployment is static: it has no server-side account database, no built-in credentials and no default remote API endpoint. Legal document contents ship as local public assets.

- Do not store private credentials in the repository, browser source or GitHub Pages settings that expose them to the client.
- The optional AI feature accepts a user-supplied HTTPS backend URL and bearer token during a session. Use a backend with proper authentication, rate limits, CORS configuration, data retention rules and origin validation.
- Only import trustworthy supplementary documents. User-imported sources are not authenticated legal texts and should be verified separately.
- The local document keyword scanner does not determine statutory compliance.
- The app's original Gazette PDFs are compared against known source hashes by `npm test`.
- Security issues can be reported through GitHub's private vulnerability-reporting feature when enabled by the repository owner.

Keep GitHub Actions dependencies and browser versions up to date. Do not expose internal HR documents in a public issue.
