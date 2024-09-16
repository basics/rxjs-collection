# rxjs-collection

[![main][github-workflow-main-src]][github-workflow-main-href]
[![next][github-workflow-next-src]][github-workflow-next-href]
[![Sonarcloud Status][sonarcloud-src]][sonarcloud-href]

[![npm version][npm-version-latest-src]][npm-version-latest-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]

[![Renovate - Status][renovate-status-src]][renovate-status-href]
[![License][license-src]][license-href]

---

## ToDo
- evaluation
    - [ ] BranchNameLint alternative (https://www.npmjs.com/package/branch-name-lint)
    - [ ] SonarLint (https://docs.sonarsource.com/sonarcloud/improving/sonarlint/)
    - [ ] ...
- observables + test
    - [ ] default fetch
    - [ ] window dom (resize, scroll)?
    - [ ] ...
- operators + test
    - [ ] finalize network retry
    - [ ] request paginator (full, lazy)
    - [ ] ...
- git actions
    - [ ] implemented merge strategy
        - only beta-branch can be merged into main
        - only feature-branches can be merged into beta
        - hotfixes can be merged directly into main, but beta will also be updated
    - [ ] ...
- sonarcloud
    - [ ] finalized config
    - [ ] ...
- additional git action services
    - [ ] evaluate pr agent
    - [ ] ...


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
