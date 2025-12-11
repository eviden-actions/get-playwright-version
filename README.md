# get-playwright-version

This parses the your project's lockfile and returns the installed playwright version.
Supported are `package-lock.json` (NPM), `yarn.lock` (Yarn 1), and `pnpm-lock.yaml` (PNPM).

If you are using the [Playwright Docker Image](https://mcr.microsoft.com/en-us/product/playwright/about) in your CI, Playwright strongly recommends using a [versioned tag](https://playwright.dev/docs/docker). This action can help you make sure your project's Playwright version matches the Playwright Docker Image version.

[![Release](https://github.com/atos-actions/get-playwright-version/actions/workflows/release.yml/badge.svg#main)](https://github.com/atos-actions/get-playwright-version/actions/workflows/release.yml)

## Prerequisites

Define whatever your action needs to run here

## Usage

```
name: Playwright Tests
on:
  push:
    branches: [ main ]

jobs:
  read-playwright-version:
    name: 'Read Playwright Version'
    runs-on: ubuntu-latest
    inputs:
      no-version-found: 'error'
    outputs:
      playwright-version: ${{ steps.get_playwright_version.outputs.playwright-version }}
    steps:
      - uses: actions/checkout@v4
      - id: get_playwright_version
				uses: atos-actions/get-playwright-version@v1

  playwright:
    name: 'Run Playwright Tests'
    runs-on: ubuntu-latest
    needs: read-playwright-version
    container:
      image: mcr.microsoft.com/playwright:${{ needs.read-playwright-version.outputs.playwright-version }}-noble
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - name: Install dependencies
        run: npm ci
      - name: Run your tests
        run: npx playwright test
        env:
          HOME: /root
```

### Inputs

|        Name        |                                    Description                                     | Default |
| :----------------: | :--------------------------------------------------------------------------------: | :-----: |
| `no-version-found` | The message level when no Playwright version is found (`error`, `warning`, `info`) | `error` |

### Outputs

|         Name         |                    Description                    |  Example  |
| :------------------: | :-----------------------------------------------: | :-------: |
| `playwright-version` | The playwright version from the package-lock.json | `v1.47.1` |

## Sources

Thanks to [@mxschmitt](https://github.com/mxschmitt) for coming up with the [workflow](https://github.com/microsoft/playwright/issues/32483#issuecomment-2348193597) this action is based on.
