# Developer documentation for desdeo-webui

Please see [desdeo-webui](https://github.com/industrial-optimization-group/desdeo-webui)
for an up-to-date version of this document.

This repository contains what is to become a new web-based user interface
for the [DESDEO](https://desdeo.misitano.xyz/) framework through the
[desdeo-webapi](https://github.com/industrial-optimization-group/desdeo-webapi)
server.

The project is at an early stage and is not yet very useful to potential
users.
Only the reference point method is currently implemented.
There is also a preliminary version of a user interface for entering
multiobjective optimization problems and saving them to a file in a JSON
format.

You are welcomed to test the application and contribute to it.

## Getting started with development

The project uses [Svelte](https://svelte.dev/) as the UI framework
and [SvelteKit](https://kit.svelte.dev) as the application framework.
See the [tutorial](https://learn.svelte.dev) to start learning.
The [Skeleton](https://v1.skeleton.dev/) UI toolkit is used for overall
theming and many components.

### Prerequisites

You will need to have
[desdeo-webapi](https://github.com/industrial-optimization-group/desdeo-webapi)
installed (or available over the network) to use `desdeo-webui`.

Please make sure you have the prerequisites installed before continuing.

### Node.js and package management

The project uses [Node.js](https://nodejs.org/en) version 18
and a compatible npm version as the package manager.
The recommended way to install Node.js and npm is to use
[Node Version Manager (nvm)](https://github.com/nvm-sh/nvm).
After installing nvm, you can install Node.js and npm by running

```
nvm install 18
```

See the nvm documentation for how to switch Node.js versions
when working with multiple projects.

(Note that running `git status` after `npm install` (explained below)
should indicate a clean working tree.
If it doesn't, your package manager is incompatible.)

### Cloning and installing

Clone the repository and install the dependencies with

```
git clone https://github.com/industrial-optimization-group/desdeo-webui.git
cd desdeo-webui
npm install
```

You can then run the development server and direct your web browser
at it by running

```
npm run dev -- --open
```

## TypeScript

The project is configured with [TypeScript](https://www.typescriptlang.org/)
enabled.
To use TypeScript in a Svelte component, the start tag should be
`<script lang="ts">`.

## Code formatting and linting

To support code maintainability, the project is configured with
[Prettier](https://prettier.io/) and [ESLint](https://eslint.org/) enabled.

To check the formatting and run the linter, run `npm run lint`.
To let Prettier format all (except ignored) files under the repository,
run `npm run format`.

A pre-commit hook has been configured to run Prettier, ESLint and svelte-check.
Please don't circumvent the hook.

You should probably configure your editor to use Prettier and ESLint.

## API documentation

Modules, types, functions, etc. should be documented in the
[TSDoc](https://tsdoc.org/) format.
Svelte components should be documented using the format suggested at
[How do I document my components?](https://svelte.dev/faq#how-do-i-document-my-components).

## Tests

The project is configured with [Playwright](https://playwright.dev)
and [Vitest](https://vitest.dev) enabled.
See also [How do I test Svelte apps?](https://svelte.dev/faq#how-do-i-test-svelte-apps).

## Other tools

[Husky](https://typicode.github.io/husky/#/) is used for managing
Git hooks, and [lint-staged](https://github.com/okonet/lint-staged)
is used in a pre-commit hook.

## Building

Run `npm run build` to build the project for production.
This is configured to build a prerendered static site.
You might want to also try other configurations.
You can preview the build with `npm run preview`.

See [Building your app](https://kit.svelte.dev/docs/building-your-app) for more.

## Version control and contributing

A commit should not make several unrelated changes.

The project doesn't enforce any particular style for commit messages,
but please try to roughly follow the format suggested at
[A note about Git commit messages](https://tbaggery.com/2008/04/19/a-note-about-git-commit-messages.html).

Potential collaborators should use a fork-based workflow.
See "Forked Public Project" at
[Contributing to a Project](https://git-scm.com/book/en/v2/Distributed-Git-Contributing-to-a-Project)
for instructions.
You should make sure that your pull request can be cleanly fast-forwarded
on top of the `master` branch (use rebasing if necessary).

See also [GitHub documentation](https://docs.github.com/en),
especially the topics under the label "Collaborative coding".

## Project structure

The core components of the application are the backend client at
`src/lib/api.ts`, the method control modules under `/src/lib/methods/` and the
method UI components under `src/lib/components/methods/`.

The backend client includes functions for logging in to the `desdeo-webapi`
server, logging out, querying problems, etc.

The method control modules handle forming and sending method specific commands
to the backend and maintaining the method state.
The control modules take as parameter a backend client, which can be imported
as `backend` from the backend client module after logging in.

The method UI components draw the user interfaces for the methods and use
the method control components to do the hard work.
