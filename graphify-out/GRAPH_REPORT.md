# Graph Report - personal-projects  (2026-10-20)

## Corpus Check
- 157 files · ~59,037 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 4 file(s) not represented in the graph (top: (none) 2, .ico 1, .css 1)

## Summary
- 645 nodes · 1071 edges · 39 communities (23 shown, 16 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 13 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- AI Text Generation
- Authentication Pages & i18n
- Development Tooling & Linting
- CI/CD Pipelines & Integrations
- Dashboard & Marketing Pages
- Database & Form Validation
- Package Manifest & Dependencies
- Server-Side Rendering & CSP
- Invitation Form Logic
- Build & Dev Scripts
- Runtime Dependencies
- Analytics & Root Layout
- Invitation Runtime Effects
- Observability & Next Config
- End-to-End Testing
- Arcjet Security & Proxying
- ESLint Configuration
- Storybook & Vitest
- Checkly Monitoring Config
- Dependabot Updates
- Sponsors & Funding
- Commitlint Config
- Knip Config
- Release Configuration
- PostCSS Config
- Auth UI Screenshots
- Drizzle Config
- Node Engine Requirements
- Site Icons & Favicons
- Arcjet Logo
- Better Stack Logo
- Checkly Logo
- Codecov Logo
- Coderabbit Logo
- Crowdin Logo
- SaaS Dashboard Screenshot
- Starter Banner
- Sentry Logo
- Sevalla Logo

## God Nodes (most connected - your core abstractions)
1. `next-intl` - 30 edges
2. `scripts` - 28 edges
3. `next` - 26 edges
4. `Next.js Boilerplate Starter` - 21 edges
5. `vitest` - 14 edges
6. `UndanganAI (AI Wedding Invitation)` - 14 edges
7. `server-only` - 13 edges
8. `routing` - 12 edges
9. `generateInvitation()` - 12 edges
10. `validateTemplate()` - 11 edges

## Surprising Connections (you probably didn't know these)
- `CodeRabbit (AI code review)` --semantically_similar_to--> `CI static checks job`  [INFERRED] [semantically similar]
  .coderabbit.yaml → .github/workflows/CI.yml
- `Lefthook git hooks` --semantically_similar_to--> `CI static checks job`  [INFERRED] [semantically similar]
  lefthook.yml → .github/workflows/CI.yml
- `CI static checks job` --calls--> `ESLint`  [INFERRED]
  .github/workflows/CI.yml → lefthook.yml
- `CI unit tests job` --calls--> `Vitest`  [INFERRED]
  .github/workflows/CI.yml → README.md
- `Next.js Boilerplate Starter` --references--> `Checkly monitoring service`  [EXTRACTED]
  README.md → .github/workflows/checkly.yml

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **CI workflow job pipeline** — _github_workflows_ci_build, _github_workflows_ci_static, _github_workflows_ci_unit, _github_workflows_ci_storybook, _github_workflows_ci_e2e, _github_workflows_ci_synchronize_with_crowdin [EXTRACTED 1.00]
- **Next.js Boilerplate sponsor ecosystem** — readme_clerk, _coderabbit_coderabbit, readme_sentry, codecov_codecov, readme_arcjet, readme_sevalla, crowdin_crowdin, readme_better_stack, readme_posthog, _github_workflows_checkly_checkly [EXTRACTED 1.00]
- **UndanganAI template+vars+theme data model** — initprompt_html_template_vars_theme, initprompt_rendering_pipeline, initprompt_template_validator [INFERRED 0.85]
- **Integrated service brand logos showcased in boilerplate** — public_assets_images_arcjet_dark_arcjet, public_assets_images_better_stack_dark_better_stack, public_assets_images_checkly_logo_dark_checkly, public_assets_images_clerk_logo_dark_clerk, public_assets_images_codecov_dark_codecov, public_assets_images_coderabbit_logo_dark_coderabbit, public_assets_images_crowdin_dark_crowdin, public_assets_images_sentry_dark_sentry, public_assets_images_sevalla_dark_sevalla [INFERRED 0.85]
- **Boilerplate UI screenshots (dashboard and auth pages)** — public_assets_images_nextjs_boilerplate_saas_nextjs_boilerplate_saas, public_assets_images_nextjs_boilerplate_sign_in_nextjs_boilerplate_sign_in, public_assets_images_nextjs_boilerplate_sign_up_nextjs_boilerplate_sign_up, public_assets_images_nextjs_starter_banner_nextjs_starter_banner [INFERRED 0.85]

## Communities (39 total, 16 thin omitted)

### Community 0 - "AI Text Generation"
Cohesion: 0.06
Nodes (58): @anthropic-ai/sdk, sanitize-html, server-only, vitest, AttemptResult, extractJson(), generateStepA(), generateStepB() (+50 more)

### Community 1 - "Authentication Pages & i18n"
Cohesion: 0.06
Nodes (31): @clerk/localizations, next-intl, vitest-browser-react, ISignInPageProps, SignInPage(), ISignUpPageProps, SignUpPage(), DashboardLayout() (+23 more)

### Community 2 - "Development Tooling & Linting"
Cohesion: 0.03
Nodes (59): devDependencies, @antfu/eslint-config, babel-plugin-react-compiler, checkly, @chromatic-com/playwright, @commitlint/cli, @commitlint/config-conventional, @commitlint/prompt-cli (+51 more)

### Community 3 - "CI/CD Pipelines & Integrations"
Cohesion: 0.05
Nodes (49): CodeRabbit (AI code review), Setup Node.js and dependencies (composite action), actions/cache, actions/setup-node, Checkly workflow, Checkly monitoring service, Vercel, CI workflow (+41 more)

### Community 4 - "Dashboard & Marketing Pages"
Cohesion: 0.08
Nodes (32): @clerk/nextjs, Dashboard(), IIndexProps, CopyLinkButton(), EmptyState(), formatDate(), InvitationCard(), InvitationGrid() (+24 more)

### Community 5 - "Database & Form Validation"
Cohesion: 0.07
Nodes (30): drizzle-orm, @hookform/resolvers, isomorphic-dompurify, @logtape/logtape, next, pg, react-hook-form, @t3-oss/env-nextjs (+22 more)

### Community 6 - "Package Manifest & Dependencies"
Cohesion: 0.05
Nodes (43): author, name, babel-plugin-react-compiler, @commitlint/cli, @commitlint/config-conventional, @commitlint/prompt-cli, conventional-changelog-conventionalcommits, cross-env (+35 more)

### Community 7 - "Server-Side Rendering & CSP"
Cohesion: 0.08
Nodes (32): mustache, MAX_GUEST_NAME_LENGTH, FormVars, buildCspHeader(), buildFontLinks(), buildMetaTags(), buildRootStyle(), cacheKey() (+24 more)

### Community 8 - "Invitation Form Logic"
Cohesion: 0.09
Nodes (29): buildCountdownTarget(), buildMeta(), buildVarsFromForm(), DAY_NAMES, formatDateLabel(), formatDateShort(), formatTimeLabel(), MONTH_NAMES (+21 more)

### Community 9 - "Build & Dev Scripts"
Cohesion: 0.07
Nodes (28): scripts, build, build-local, build:next, build-stats, build-storybook, check:deps, check:i18n (+20 more)

### Community 10 - "Runtime Dependencies"
Cohesion: 0.08
Nodes (25): dependencies, @anthropic-ai/sdk, @arcjet/next, @clerk/localizations, @clerk/nextjs, drizzle-orm, @hookform/resolvers, isomorphic-dompurify (+17 more)

### Community 11 - "Analytics & Root Layout"
Cohesion: 0.12
Nodes (14): posthog-js, react, @storybook/addon-a11y, @storybook/nextjs-vite, cormorantGaramond, metadata, plusJakartaSans, RootLayout() (+6 more)

### Community 12 - "Invitation Runtime Effects"
Cohesion: 0.21
Nodes (7): copyText(), fallbackCopy(), maybeStartMusic(), setupCopyButtons(), setupMusic(), setupOpenInvitation(), setupRsvp()

### Community 13 - "Observability & Next Config"
Cohesion: 0.18
Nodes (7): baseConfig, configWithPlugins, @next/bundle-analyzer, @sentry/nextjs, onRouterTransitionStart, onRequestError, sentryOptions

### Community 14 - "End-to-End Testing"
Cohesion: 0.22
Nodes (3): @chromatic-com/playwright, @faker-js/faker, @playwright/test

### Community 15 - "Arcjet Security & Proxying"
Cohesion: 0.33
Nodes (7): @arcjet/next, aj, config, handleI18nRouting, isAuthPage, isProtectedRoute, proxy()

### Community 16 - "ESLint Configuration"
Cohesion: 0.25
Nodes (5): @antfu/eslint-config, eslint-plugin-jsx-a11y, eslint-plugin-playwright, eslint-plugin-storybook, eslint-plugin-tailwindcss

### Community 17 - "Storybook & Vitest"
Cohesion: 0.29
Nodes (5): @storybook/addon-vitest, vite, vite-tsconfig-paths, @vitejs/plugin-react, @vitest/browser-playwright

### Community 18 - "Checkly Monitoring Config"
Cohesion: 0.40
Nodes (4): config, emailChannel, sendDefaults, checkly

### Community 19 - "Dependabot Updates"
Cohesion: 0.67
Nodes (3): Dependabot version updates, GitHub Actions updates, npm dependency updates

### Community 20 - "Sponsors & Funding"
Cohesion: 0.67
Nodes (3): ixartz (GitHub sponsor), Next.js Boilerplate Pro SaaS Starter Kit (funding), Nextless.js (funding)

### Community 23 - "Release Configuration"
Cohesion: 0.67
Nodes (3): release, branches, plugins

### Community 25 - "Auth UI Screenshots"
Cohesion: 0.67
Nodes (3): Clerk logo (dark), Sign-in page screenshot, Sign-up page screenshot

## Knowledge Gaps
- **76 isolated node(s):** `@supabase/supabase-js`, `nanoid`, `papaparse`, `react-dom`, `@commitlint/cli` (+71 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 319 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **16 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `devDependencies` connect `Development Tooling & Linting` to `Package Manifest & Dependencies`?**
  _High betweenness centrality (0.146) - this node is a cross-community bridge._
- **What connects `@supabase/supabase-js`, `nanoid`, `papaparse` to the rest of the system?**
  _76 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `AI Text Generation` be split into smaller, more focused modules?**
  _Cohesion score 0.05639097744360902 - nodes in this community are weakly interconnected._
- **Why does `server-only` connect `AI Text Generation` to `Invitation Form Logic`, `Dashboard & Marketing Pages`, `Package Manifest & Dependencies`, `Server-Side Rendering & CSP`?**
  _High betweenness centrality (0.128) - this node is a cross-community bridge._
- **Should `Authentication Pages & i18n` be split into smaller, more focused modules?**
  _Cohesion score 0.05641025641025641 - nodes in this community are weakly interconnected._
- **Why does `next-intl` connect `Authentication Pages & i18n` to `Dashboard & Marketing Pages`, `Database & Form Validation`, `Package Manifest & Dependencies`, `Analytics & Root Layout`, `Observability & Next Config`, `Arcjet Security & Proxying`?**
  _High betweenness centrality (0.116) - this node is a cross-community bridge._
- **Should `Development Tooling & Linting` be split into smaller, more focused modules?**
  _Cohesion score 0.03389830508474576 - nodes in this community are weakly interconnected._