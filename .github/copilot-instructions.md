# Project development preferences

This repository is a web-based React application for managing residential Philips Hue deployments.

## Preferred stack

- Use Next.js as the React framework.
- Use TypeScript for application and tooling code.
- Use Tailwind CSS for styling.
- Use daisyUI for UI components and design primitives.
- Follow the [lo-fi art](https://trends.daisyui.com/trend/lo-fi-art/) visual style. Balance dusty indigo, muted blue, mauve, and soft teal night tones against localized amber, peach, or pink light from lamps, screens, and windows. Use warm lamp amber or peach for `primary`, dusty indigo or soft teal for `secondary`, and step `base-100`, `base-200`, and `base-300` through muted night blue, deep mauve-blue, and dark indigo. This style is not monochrome, and it is distinct from the daisyUI theme that happens to be named `lofi`.
- Keep texture subtle: daisyUI's `--noise: 1` provides the analog grain associated with the style without adding a separate texture asset.
- Match documentation images and other artwork to the lo-fi art palette rather than drawing them in black and white.
- Match the app's header theme-toggle icons to Blume's light/dark control: use 18px outline sun and moon glyphs with a 2px stroke, not solid filled icons.
- Keep the app's favicon in `src/app/icon.svg` as the source of truth. Copy it to Blume's ignored `public/favicon.svg` before local docs development, docs builds, and in the documentation build job rather than maintaining a second icon by hand. Do not copy it to `public/icon.svg`, which collides with Next.js's `/icon.svg` route.
- Use Nunito Sans as the first font for both app and docs text, including headings; use its local family name second and the other suggested lo-fi art fonts from position three onward as fallback faces rather than downloading them all. Keep headings modest so the illustration sets the mood.
- Let a single familiar room or window illustration carry environmental detail while the task controls and copy stay quiet and concise. Draw from lived-in interiors, plants, books, pets, rain, and distant city lights as appropriate to the scene, rather than putting every detail on one screen. Favor ordinary window frames and restrained overlays over decorative card systems or futuristic chrome; keep corner radii between `0.25rem` and `1rem`.
- When adding ambient motion, use seamless, low-amplitude environmental loops such as falling rain, drifting steam, turning pages, blinking screens, breathing figures, or occasional pet movement. Keep task controls stable, avoid distracting motion, and honor `prefers-reduced-motion` by removing the ambient animation without hiding content.
- Use Biome for linting and formatting, configured through CLI flags in `package.json` scripts so no Biome configuration file is needed. Do not use ESLint, which cannot lint TypeScript without a configuration file.
- Capture documentation screenshots with the Playwright MCP server available in the agent session. Do not add Playwright, or any other browser automation tool, to the project's dependencies; screenshot capture is an authoring activity rather than a project capability.
- Prefer established components and libraries over custom implementations.
- Use the latest stable language versions and toolchains by default.

## Design and implementation

- Keep the architecture modular, with focused components, modules, and responsibilities.
- Keep source code under `src`.
- Keep the Philips Hue bridge root certificate as a PEM file under `src` and read it in the server-side TypeScript transport; include it in the standalone Docker image rather than embedding PEM text in code or disabling TLS verification.
- Use a dedicated HTTPS agent with TLS session caching disabled when checking Philips Hue bridge certificate identities. Node can return an empty peer certificate on a resumed session even when its CA verification succeeds; never bypass verification to work around this.
- For bridge pairing, use Philips Hue online discovery with manual local IPv4 entry as the offline fallback; do not add mDNS networking or UPnP. Keep each browser's paired bridges and application keys in its own localStorage rather than requiring a shared Docker volume. Send keys only to the server-side API when needed, and never log them.
- Discovery cards show a bridge ID and IP immediately. Resolve friendly names separately through verified local bridge requests, show an indicator beside each IP until its name lookup finishes, and highlight the name when available. Label the 16-character discovery identifier "Bridge ID", not "serial number".
- The read-only dashboard lists physical devices of all types across paired bridges. Show bridge, room, archetype/type, product, model, and services in columns; provide search, bridge/room/type filters, grouping, refresh, and per-bridge errors without concealing healthy bridges.
- If Philips Hue's online discovery service returns HTTP 429, report the rate limit explicitly and direct the user to manual IP entry; do not present it as an empty discovery result or a generic gateway error. Show a wait time from a valid Retry-After header on 429 or other errors such as 520, but do not assume 520 is throttling when no such header is present.
- Pin `turbopack.root` to the repository working directory in the existing Next.js config when ancestor lockfiles confuse root detection. Never alter a lockfile outside this repository to suppress the warning.
- Keep each source file at or below 150 lines. When a file approaches this limit, split it along clear responsibility boundaries.
- Prefer convention-based defaults over custom configuration, even when a default is slightly less convenient. Keep configuration files out of the repository root unless a tool genuinely cannot work without one. Verify that a configuration file is required before adding it, rather than assuming.
- Minimize configuration files and avoid boilerplate unless it is required.
- Let generated files stay generated. Add files such as `tsconfig.json` and `next-env.d.ts` to `.gitignore` rather than committing them.
- Add a focused `.gitignore` file when generated files make it useful.
- Keep `package.json` minimal: include only necessary scripts, dependencies, and metadata.
- Prefer structured GitHub issue templates over allowing blank issues.
- Prefer library or framework components over rebuilding common behavior from scratch.
- Prefer the simplest UX implementation and the fewest practical utility classes. Use daisyUI abstractions when they reduce Tailwind class lists.
- Keep the overall project and dependency footprint small, even when that means accepting less customization or a less unique design.
- Avoid adding abstractions, dependencies, files, or configuration for hypothetical future needs.

## Documentation

- Name the repository README file `readme.md` using lowercase letters.
- Write `readme.md` for contributors who want to start developing within thirty seconds. Open it with a few sentences explaining what the project is and why it exists, and refer to the project by its title case name in prose while reserving the lowercase name for the package and container.
- Write at least one sentence of explanation under every heading before any list, table, or code block. Never leave a heading bare.
- Express the project's architecture or stack as a Mermaid diagram rather than a plain list.
- Write documentation under `docs` for users who may not be technically savvy beyond downloading a Docker container and using the app.
- The documentation site is published to a project subpath on GitHub Pages, so its assets are linked with a base path prefix. Preview a build with the documentation tool's own preview command, which applies that base path. Serving the build output directly from a static file server requests assets at the wrong location and makes the site appear unstyled.
- Write documentation pages as Markdown (`.md`) rather than MDX, since the documentation does not use component features.
- Store documentation images and other media under `docs/media`.
- Capture documentation screenshots at a 16:9 aspect ratio, such as a 1280x720 viewport, so they crop and scale consistently.
- Capture documentation screenshots in the dark theme by seeding the theme preference in browser storage before loading the page.
- Populate screenshots with fictional sample bridges and devices supplied through the browser automation session. Never publish a real home's bridge identifiers, addresses, application keys, or device names.
- Treat screenshots as part of the interface. When a user interface control changes, update every screenshot that shows that control in the same increment.
- Add explanatory comments to infrastructure files such as Dockerfiles and workflows, where the reasoning behind each step is not obvious.
- Include an attribution section in `readme.md` that links every toolchain, library, and package used to build the project, presented as a table. Link to each project's home page first, its documentation page if it has no home page, its package manager page if it has neither, and its GitHub repository as a last resort.
- Update the readme and documentation at the end of every increment, before suggesting a commit message. Treat documentation as part of the increment rather than a follow-up task.
- Keep the README's bridge-connection guidance brief and link to the usage guide for both connection methods, pairing steps, expected results, and troubleshooting. Place how-to guides in `docs/usage` so Blume generates a Usage section in the sidebar; leave installation guidance on `docs/installation.md`.
- Order documentation pages in reading order with Blume's numeric file prefixes, such as `01-connect-bridges.md` and `02-browse-devices.md`. Blume strips the prefix from the published URL, so prefer this over sidebar frontmatter or folder meta files.
- Optimize the documentation site for search engines, social previews, and AI agents alike. Rely on Blume's defaults, which cover metadata, canonicals, Open Graph images, structured data, `sitemap.xml`, `robots.txt`, content signals, `llms.txt`, Markdown mirrors, and agent discovery manifests. Configure only what a default cannot infer: the source repository, the Open Graph palette, the software product description, and the `llms.txt` details block that tells an agent when to reach for this project and how to run it.
- Do not enable Blume's MCP server. It needs a live endpoint and server output, which the static GitHub Pages deployment cannot provide.
- Give every documentation page a `title` and a `description`, since both feed the page metadata, its Open Graph card, and `llms.txt`.
- Blume's `--isolated` build verifies pages, routes, and Open Graph cards, but omits publish-only artifacts such as `robots.txt`, `sitemap.xml`, `llms.txt`, and `agent-readability.json`. Those come from the real build in the deployment workflow.

## Writing style

- Write prose in a positive and constructive voice. Describe what this project makes easier rather than what is painful, and never speak negatively about other applications or products.
- Do not use em-dashes. Use commas, colons, or separate sentences instead.
- Do not hard wrap Markdown prose at a fixed column. Write each paragraph as a single continuous line and let the editor soft wrap it.
- Always write "Philips Hue" rather than a bare "Hue" when referring to the product, its bridges, its devices, or its API. The only exception is the name of this project, "Hue Browser", and identifiers derived from it such as `hue-browser`.
- Keep interface copy plain and literal. Do not add conversational flourishes such as time-of-day greetings; state what the screen is for instead.

## Conventions and contributor experience

- Prefer conventions that tooling validates automatically over conventions enforced by human reviewers.
- Define conventions in `.editorconfig` and `.vscode/settings.json` whenever those files support them; use focused linting or formatting tools for the remaining rules.
- Provide focused agent instruction files for contributors whenever possible.
- Recommend a specific editor extension only when it provides substantial project-specific value; keep the bar for recommendations high.
- License the project under the MIT License.

## Automation and distribution

- Build a GitHub Actions continuous integration workflow that automatically validates pull requests and installs Node dependencies with `npm ci`.
- Name workflow files with their role fully spelled out in kebab case, using `continuous-integration.yml` for continuous integration and a `continuous-deployment-` prefix for each deployment target, such as `continuous-deployment-container.yml` and `continuous-deployment-docs.yml`. Use the word "deployment" rather than "delivery", and never abbreviate to `ci` or `cd` in either the file name or the workflow `name` field.
- Reference every GitHub Action by its latest major version tag, such as `v7`, rather than pinning to a commit SHA or a full version. Check the action's current latest release before writing or updating a workflow rather than assuming a version.
- Split a continuous deployment workflow that targets an environment into two jobs: one that builds and uploads the artifact, and one that deploys it to the environment.
- Do not put blank lines inside workflow files. Keep each workflow as a single unbroken block of YAML, using comments rather than blank lines to separate sections.
- Give every workflow, job, and step an explicit, fully spelled out `name`. Never leave a step unnamed or rely on an abbreviation.
- Keep deeper project documentation under `docs`, using Blume when practical to keep the documentation setup simple.
- Deploy `docs` automatically from the default branch to a GitHub Pages environment.
- For containerized applications, automatically publish public container packages through GitHub Packages and make releases available through GitHub Releases.

## Working together

- Build the project in increments. Do not start a new increment without checking in first.
- Explain what you plan to do before doing it, and ask refining questions when a decision is ambiguous.
- Suggest a commit message at the end of each increment so the work can be committed incrementally. Write it as a single sentence, with no body and no attribution or co-author trailer.
- Never assume files are unchanged between turns. Read them from disk before acting on them.
- Assume the project is open in Visual Studio Code.
- Leave `npm run dev` to the developer. Start a development server only to verify something, then stop it.
- Do not open previews of the application or the documentation site in the app, and do not start servers to show the developer a result. The developer runs and watches these themselves. Verify work through builds, linting, and command line requests instead, and simply report what changed.
- Pin a fixed port in every script that serves something, rather than letting the tool pick a port or fall forward to the next free one. The application development server uses port 3000, the documentation preview server uses port 4000, and the documentation development server uses port 4001. Use those ports when verifying, and keep any new serving script on its own fixed port.

## Conflicting requests

If a request conflicts with these preferences, ask whether these instructions should be replaced or updated before implementing the conflicting request. Whenever new guidance is given that these instructions do not already cover, or that conflicts with them, update this file so future sessions inherit it.
