# desdeo-webui

This repository contains what is to become a new web-based user interface
for the [DESDEO](https://desdeo.misitano.xyz/) framework.
The project is in its infancy, so this README file is currently directed
at developers only.

**There is nothing for potential users to install yet.**

The project uses [Svelte](https://svelte.dev/) as the UI framework
and [SvelteKit](https://kit.svelte.dev) as the application framework.
See the [tutorial](https://learn.svelte.dev) to start learning.

## Getting started

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
You are encouraged to make use of it.
To use TypeScript in a Svelte component, the start tag should be
`<script lang="ts">`.

## Code formatting and linting

To support code maintainability, the project is configured with
[Prettier](https://prettier.io/) and [ESLint](https://eslint.org/) enabled.
The ESLint configuration is the default one from the SvelteKit template.
Prettier is configured to use vanilla formatting rules.

To check the formatting and run the linter, run`npm run lint`.
To let Prettier format all (except ignored) files under the repository,
run `npm run format`.

A pre-commit hook has been configured to check the formatting
and run the linter.
Please don't circumvent the hook.

You should probably configure your editor to use Prettier and ESLint
(see below for VS Code instructions).

## Documentation

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
You can preview the build with `npm run preview`.

See [Building your app](https://kit.svelte.dev/docs/building-your-app) for more.

## Version control and contributing

Please don't create new branches in the repository.
Any branches other than `master` should only exist in your fork
or in your local copy of the repository.

A commit should not make several unrelated changes.

The project doesn't enforce any particular style for commit messages,
but please try to roughly follow the format suggested at
[A note about Git commit messages](https://tbaggery.com/2008/04/19/a-note-about-git-commit-messages.html).
(This is also the format [suggested in the Git Book](https://git-scm.com/book/en/v2/Distributed-Git-Contributing-to-a-Project).)

The core developers ([rmojala](https://github.com/rmojala) and [edciriac](https://github.com/edciriac))
will be pushing directly to the `master` branch.

Other potential collaborators should use a fork-based workflow.
See "Forked Public Project" at [Contributing to a Project](https://git-scm.com/book/en/v2/Distributed-Git-Contributing-to-a-Project)
for instructions.
You should make sure that your pull request can be cleanly fast-forwarded
on top of the `master` branch (use rebasing if necessary).

Please understand that the project is in early development
and changes are happening rapidly.
If you are considering making changes to existing code,
you should discuss with the core developers in advance.

See also the [GitHub documentation](https://docs.github.com/en),
especially the topics under the label "Collaborative coding".

## Setting up VS Code

TODO
