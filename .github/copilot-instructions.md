# Project development preferences

This repository is a web-based React application for managing residential
Philips Hue deployments.

## Preferred stack

- Use Next.js as the React framework.
- Use TypeScript for application and tooling code.
- Use Tailwind CSS for styling.
- Use daisyUI for UI components and design primitives.
- Prefer established components and libraries over custom implementations.
- Use the latest stable language versions and toolchains by default.

## Design and implementation

- Keep the architecture modular, with focused components, modules, and
  responsibilities.
- Keep source code under `src`.
- Keep each source file at or below 150 lines. When a file approaches this
  limit, split it along clear responsibility boundaries.
- Prefer convention-based defaults over custom configuration.
- Minimize configuration files and avoid boilerplate unless it is required.
- Add focused `.gitignore` and `.gitattributes` files when the project's
  generated files, tooling, or cross-platform behavior make them useful.
- Keep `package.json` minimal: include only necessary scripts, dependencies,
  and metadata.
- Name the repository README file `readme.md` using lowercase letters.
- Keep `readme.md` concise while documenting primary prerequisites, commands,
  and common usage. Deeper documentation may repeat and expand on this
  information.
- Prefer structured GitHub issue templates over allowing blank issues.
- Prefer library or framework components over rebuilding common behavior from
  scratch.
- Prefer the simplest UX implementation and the fewest practical utility
  classes. Use daisyUI abstractions when they reduce Tailwind class lists.
- Keep the overall project and dependency footprint small, even when that
  means accepting less customization or a less unique design.
- Avoid adding abstractions, dependencies, files, or configuration for
  hypothetical future needs.

## Conventions and contributor experience

- Prefer conventions that tooling validates automatically over conventions
  enforced by human reviewers.
- Define conventions in `.editorconfig` and `.vscode/settings.json` whenever
  those files support them; use focused linting or formatting tools for the
  remaining rules.
- Provide focused agent instruction files for contributors whenever possible.
- Recommend a specific editor extension only when it provides substantial
  project-specific value; keep the bar for recommendations high.
- License the project under the MIT License.

## Automation and distribution

- Build a GitHub Actions continuous integration workflow that automatically
  validates pull requests and installs Node dependencies with `npm ci`.
- Keep deeper project documentation under `docs`, using Blume when practical
  to keep the documentation setup simple.
- Deploy `docs` automatically from the default branch to a GitHub Pages
  environment.
- For containerized applications, automatically publish public container
  packages through GitHub Packages and make releases available through GitHub
  Releases.

## Conflicting requests

If a request conflicts with these preferences, ask whether these instructions
should be replaced or updated before implementing the conflicting request.
