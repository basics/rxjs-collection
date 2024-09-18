# rxjs-collection

[![main][github-workflow-main-src]][github-workflow-main-href]
[![next][github-workflow-next-src]][github-workflow-next-href]
[![Sonarcloud Status][sonarcloud-src]][sonarcloud-href]

[![npm version][npm-version-latest-src]][npm-version-latest-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]

[![Renovate - Status][renovate-status-src]][renovate-status-href]
[![License][license-src]][license-href]

[![Coverage Report][vitest-coverage-src]][vitest-coverage-href]

---

## ToDo


- project config
  - monorepo
    - [x] create project structure
    - [x] add package.json and correct package namings
  - editor
    - [x] consistent code styles (editorconfig)
    - [x] normalize eof (gitattributes)
    - [x] autofix syntax errors (eslint)
    - [x] autofix code formatting (prettier)
  - vscode
    - [x] created workspace file with default settings
    - [x] added launch configuration
      - [x] run debugger mode for custom opened test file
      - [ ] ...
    - [x] added extension recommendation (will be installed, when project will be opened by workspace file) 
    - [x] evaluate SonarLint (https://docs.sonarsource.com/sonarcloud/improving/sonarlint/)
    - [ ] ...
  - node
    - [x] node version manager support (nvmrc)
    - [x] defined current node version (20) 
    - [x] package manager bot (renovate) 
  - info
    - [x] added code of conduct
    - [x] added licence (MIT)
  - versioning
    - [x] monorepo support
    - [x] pre(release) support
    - [x] added commit-analyzer
    - [x] added release notes generator
    - [x] added changelog generator
    - [x] added optional npm publishing process
    - [x] added git update process to commit new version and notes
    - [x] added github update process to publish new version and notes
  - vitest
    - [x] monorepo support
    - [x] run tests with hot reload
    - [x] run code coverage analysis
    - [x] create reports (html, lcov, text)
    - [x] implemented test samples
      - [x] mock browser events (with marble definitions)
      - [x] mock requests (with marble definition)
      - [x] true async handling
      - [x] implemented curl test (.http-file)
  - browserslist 
    - [x] embedded but currently not needed  
  - git
    - [x] lint commit messages (commitlint)
    - [x] Run linters against staged git files (lint-stage)
    - [x] ignore files/dirs for versioning (gitignore)
    - [ ] evaluate BranchNameLint alternative (https://www.npmjs.com/package/branch-name-lint)
  - github
    - config
      - [x] added to organization 
      - [x] protected branch remove of main 
      - [x] protected branch remove of beta 
      - [ ] 
    - actions
      - pipelines
        - [x] main
        - [x] beta
        - [x] feature
        - [x] deploy coverage report of main branch to gh-pages
        - [ ] ...
      - tasks
        - [x] versioning
        - [x] test
        - [x] code analysis 
        - [ ] evaluate pr agent
        - [ ] ...
    - rules
      - [ ] main branch can be updated only by pull request from 
        - [ ] beta branch
        - [ ] hotfix branch
      - [ ] beta branch can be updated only by pull request from 
        - [ ] feature branch
        - [ ] hotfix branch
      - [ ] ...
  - SonarCloud
    - [x] account created
    - [x] embedded analysis call into each git-action as task
    - [x] created sonarcloud properties in repo to publish on demand config
    - [x] proof working code analysis for main
    - [x] proof working code analysis for beta 
- project code
  - observables + test
  - [ ] finalize default fetch
  - [ ] create & finalize window dom (resize, scroll)?
  - [ ] ...
- operators + test
  - [ ] finalize network retry
  - [ ] create & finalize request paginator (full, lazy)
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

[vitest-coverage-src]: https://img.shields.io/badge/Coverage_Report-2ea44f?logo=vitest&logoColor=%23fff
[vitest-coverage-href]: https://basics.github.io/rxjs-collection/