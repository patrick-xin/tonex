# Security

Tonex runs entirely in the browser — no backend, no auth, no server-side colour math. The two surfaces worth calling out:

- **Image upload** (logo → seed extraction). Files are read client-side; nothing is uploaded.
- **Clipboard** (export-to-clipboard). The browser's clipboard API is used directly; tonex does not retain or transmit the copied content.

If you find a vulnerability, please do **not** open a public issue. Use GitHub's [private vulnerability reporting](https://github.com/patrick-xin/tonex/security/advisories/new) with:

- a description of the issue,
- steps to reproduce,
- the affected version / commit if known.

You'll get an acknowledgement within a reasonable window. Coordinated disclosure preferred.
