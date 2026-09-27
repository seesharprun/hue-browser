# Project development preferences

This repository is a web-based React application for managing residential Philips Hue deployments.

## Preferred stack

- Use Next.js as the React framework.
- Use TypeScript for application and tooling code.
- Use Tailwind CSS for styling.
- Use daisyUI for UI components and design primitives.
- Follow the [lo-fi art](https://trends.daisyui.com/trend/lo-fi-art/) visual style. Balance dusty indigo, muted blue, mauve, and soft teal night tones against localized amber, peach, or pink light from lamps, screens, and windows. Use warm lamp amber or peach for `primary`, dusty indigo or soft teal for `secondary`, and step `base-100`, `base-200`, and `base-300` through muted night blue, deep mauve-blue, and dark indigo. This style is not monochrome, and it is distinct from the daisyUI theme that happens to be named `lofi`.
- Match documentation images and other artwork to the lo-fi art palette rather than drawing them in black and white.
- Use Biome for linting and formatting, configured through CLI flags in `package.json` scripts so no Biome configuration file is needed. Do not use ESLint, which cannot lint TypeScript without a configuration file.
- Use Playwright to capture screenshots for documentation.
- Prefer established components and libraries over custom implementations.
- Use the latest stable language versions and toolchains by default.

## Design and implementation

- Keep the architecture modular, with focused components, modules, and responsibilities.
- Keep source code under `src`.
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
- Add explanatory comments to infrastructure files such as Dockerfiles and workflows, where the reasoning behind each step is not obvious.
- Include an attribution section in `readme.md` that links every toolchain, library, and package used to build the project, presented as a table. Link to each project's home page first, its documentation page if it has no home page, its package manager page if it has neither, and its GitHub repository as a last resort.
- Update the readme and documentation at the end of every increment, before suggesting a commit message. Treat documentation as part of the increment rather than a follow-up task.

## Writing style

- Write prose in a positive and constructive voice. Describe what this project makes easier rather than what is painful, and never speak negatively about other applications or products.
- Do not use em-dashes. Use commas, colons, or separate sentences instead.
- Do not hard wrap Markdown prose at a fixed column. Write each paragraph as a single continuous line and let the editor soft wrap it.

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

## Conflicting requests

If a request conflicts with these preferences, ask whether these instructions should be replaced or updated before implementing the conflicting request. Whenever new guidance is given that these instructions do not already cover, or that conflicts with them, update this file so future sessions inherit it.
