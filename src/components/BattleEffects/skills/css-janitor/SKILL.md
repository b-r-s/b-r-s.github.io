---
name: css-janitor
description: Audits unused Vanilla CSS within React component folders located in /src/components. Use this when the user wants to find dead styles or clean up component CSS.
---
# CSS Janitor
This skill is strictly for a React + TypeScript project where components live in `/src/components/[ComponentName]/`.

## Protocol
1. **Scope:** Only scan files inside the `/src/components` directory.
2. **Logic:** For every `Folder/Component.css`, verify usage against `Folder/Component.tsx`.
3. **Execution:** Run `scripts/extract_classes.sh`.
4. **Output:** The script generates `unused_css_report.txt`. Read this file to summarize findings for the user.

## Constraints
- **Vanilla CSS:** No utility frameworks (Tailwind/Bootstrap) are used.
- **Strict Isolation:** Styles in a component folder are intended only for that component.