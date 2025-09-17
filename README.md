# rxjs-collection

[![main][github-workflow-main-src]][github-workflow-main-href]
[![next][github-workflow-next-src]][github-workflow-next-href]
[![Sonarcloud Status][sonarcloud-src]][sonarcloud-href]

[![npm version][npm-version-latest-src]][npm-version-latest-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]

[![Renovate - Status][renovate-status-src]][renovate-status-href]
[![License][license-src]][license-href]

[![Open in StackBlitz][stackblitz-src]][stackblitz-href]
[![Coverage Report][vitest-coverage-src]][vitest-coverage-href]

---

## Installation

```bash
# npm
npm install fast-equals github:basics/rxjs-collection

# pnpm
pnpm add fast-equals github:basics/rxjs-collection
```

> ⚠️ The dependency “fast-equals” must be installed separately. Temporarily, until the packages are published on npmjs.com.

### Temporary adjustments as not published

As these packages have not yet been published on npmjs.com, adjustments may need to be made locally in the project.

#### Example Vite

This resolve is required for the Vite bundler so that the packages can be resolved correctly.

**vite.config.ts**

```js
export default defineConfig({
  resolve: {
    alias: {
      'rxjs-collection/operators': resolve(__dirname, '../node_modules/rxjs-collection/packages/operators/dist/index.mjs'),
      'rxjs-collection/observables': resolve(__dirname, '../node_modules/rxjs-collection/packages/observables/dist/index.mjs')
    }
  }
});

```

## Usage

## Observables

```typescript
import { connectionObservable } from 'rxjs-collection/observables';
```

## Operators

```typescript
import { autoPagination } from 'rxjs-collection/operators';
```

> ⚠️ Please note: The packages are still under development and may be subject to change. Integration via `@rxjs-collection/observables` or `@rxjs-collection/operators` is currently not possible.

[renovate-status-src]: <https://img.shields.io/badge/renovate-enabled-brightgreen>
[renovate-status-href]: <https://renovate.whitesourcesoftware.com/>

[github-workflow-main-src]: <https://github.com/basics/rxjs-collection/actions/workflows/main.yml/badge.svg>
[github-workflow-main-href]: <https://github.com/basics/rxjs-collection/actions?query=workflow%3Amain>
[github-workflow-next-src]: <https://github.com/basics/rxjs-collection/actions/workflows/beta.yml/badge.svg>
[github-workflow-next-href]: <https://github.com/basics/rxjs-collection/actions?query=workflow%3Abeta>

[sonarcloud-src]: <https://sonarcloud.io/api/project_badges/measure?project=basics_rxjs-collection&metric=alert_status>
[sonarcloud-href]: <https://sonarcloud.io/dashboard?id=basics_rxjs-collection>

[license-src]: https://img.shields.io/github/license/basics/rxjs-collection
[license-href]: https://github.com/basics/rxjs-collection

[npm-version-latest-src]: https://img.shields.io/npm/v/nuxt-booster/latest.svg?
[npm-version-latest-href]: https://npmjs.com/package/nuxt-booster/v/latest

[npm-downloads-src]: https://img.shields.io/npm/dt/nuxt-booster.svg?style=flat-square
[npm-downloads-href]: https://npmjs.com/package/nuxt-booster

[stackblitz-src]: https://developer.stackblitz.com/img/open_in_stackblitz.svg
[stackblitz-href]: https://stackblitz.com/~/github.com/basics/rxjs-collection?workspace=vscode-remote%3A%2F%2Fwebcontainer%2Fhome%2Fbasics%2Frxjs-collection%2Frxjs-collection.code-workspace

[vitest-coverage-src]: https://img.shields.io/badge/Coverage_Report-2ea44f?logo=vitest&logoColor=%23fff
[vitest-coverage-href]: https://basics.github.io/rxjs-collection/
