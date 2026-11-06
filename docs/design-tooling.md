# Appiex: premium UI, animation and 3D development tooling

This branch makes repository-local design skills available to supported coding agents. It deliberately leaves production website pages and the runtime dependency lockfile unchanged.

## Project-scoped agent skills
- Anthropic Frontend Design (Apache 2.0), installed under .agents/skills/frontend-design
- UI UX Pro Max (MIT), installed under .agents/skills/ui-ux-pro-max with searchable design data and Python tools
- Vercel Web Design Guidelines, installed under .agents/skills/web-design-guidelines
- Vercel React Best Practices, installed under .agents/skills/vercel-react-best-practices

Sources: https://github.com/anthropics/skills , https://github.com/nextlevelbuilder/ui-ux-pro-max-skill , https://github.com/vercel-labs/agent-skills . Respect upstream licenses and update separately after review.

The UI UX Pro Max search entry point is:
`python .agents/skills/ui-ux-pro-max/scripts/search.py "agency premium portfolio" --design-system -p Appiex`

## Runtime libraries — optional installation in a local development checkout
GSAP and framer-motion already appear in Appiex package.json. Do not reinstall them.

Run `bash scripts/install-design-runtime.sh` on macOS/Linux or `.\scripts\install-design-runtime.ps1` in Windows PowerShell.

This installs compatible React Three Fiber v8 (React 18), Three.js, Drei, Spline React+runtime and Theatre.js core+studio and checks `npm run build`. Review the lockfile and peer dependencies and test affected pages before committing. No 3D library will appear on a page until you actually implement a component and import it.

## Motion AI Kit — local coding-agent installation
Run `npx motion-ai` in the development checkout with the target coding agent installed. It sets up Motion skills/MCP locally. Motion+ features like MotionScore require separate access. Source: https://github.com/motiondivision/ai-kit

## Blender MCP — local Blender application installation
For Windows, install uv through `winget install --id=astral-sh.uv -e`, then run `uvx mcp-for-blender setup`, choose the coding agent, open Blender, check its addon and restart the client. Do not execute arbitrary remote installer scripts. Source: https://github.com/ahujasid/mcp-for-blender . This requires a real Blender instance on the user's PC and cannot be activated by a GitHub commit.

## Safety and performance
- Lazy-load large client-only scenes; don't import them into global layouts or server-render WebGL.
- Compress 3D assets, cap pixel ratio and check mobile memory/performance.
- Add fallbacks and prefers-reduced-motion handling.
- Run build and a Lighthouse/accessibility review before deploying.
