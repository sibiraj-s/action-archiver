# action-archiver

> Github action to generate tar/zip archives

[![Tests](https://github.com/sibiraj-s/action-archiver/actions/workflows/test.yml/badge.svg)](https://github.com/sibiraj-s/action-archiver/actions/workflows/test.yml)

## Usage

```yml
name: Build
on:
  push:
    branches:
      - production

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: 16

      - run: npm ci
      - run: npm run build

      - uses: sibiraj-s/action-archiver@v1
        with:
          working-directory: './'
          path: 'dist/**'
          format: tar # default
          output: dist.tar
```

**Creating gzip archive:**

```yml
steps:
  - uses: sibiraj-s/action-archiver@v1
    with:
      path: '**/*.js'
      format: zip
      output: dist.zip
      compression-level: 4 # default, see https://nodejs.org/api/zlib.html#class-options
```

**Compress tar archive with gzip**

```yml
steps:
  - uses: sibiraj-s/action-archiver@v1
    with:
      path: '**/*.js'
      format: tar
      gzip: true
      output: dist.tar.gz
```

**Ignore files**

```yml
steps:
  - uses: sibiraj-s/action-archiver@v1
    with:
      path: '**/*'
      output: dist.tar
      ignore: |
        **/*.md
        **/*.yml
```

## Security

For better security it is recommended to pin actions to a full length commit SHA.

Read more on [using third-party actions](https://docs.github.com/en/actions/learn-github-actions/security-hardening-for-github-actions#using-third-party-actions)
