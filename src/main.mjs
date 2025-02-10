import core from '@actions/core';
import { promises as fs } from 'node:fs';
import yaml from 'js-yaml';

const noVersionFound = core.getInput('no-version-found');

/**
 * The main function for the action.
 * @returns {Promise<string>} The Playwright version.
 */
export const run = async () => {
	try {
		const version =
			(await getVersionFromPackageLock()) || (await getVersionFromYarnLock()) || (await getVersionFromPnpmLock());
		if (!version) {
			switch (noVersionFound) {
				case 'info':
					core.info('No Playwright version found');
					break;
				case 'warning':
					core.warning('No Playwright version found');
					break;
				default:
					core.setFailed('No Playwright version found');
					break;
			}
		} else {
			core.setOutput('playwright-version', `${version}`);
		}
	} catch (error) {
		console.error(error);
		core.setFailed(error.message);
	}
};

const getVersionFromPackageLock = async () => {
	try {
		const data = await fs.readFile('./package-lock.json', 'utf-8');
		console.debug('package-lock.json found');

		const lockfile = JSON.parse(data);

		try {
			let version =
				lockfile['packages']['node_modules/playwright']?.version ||
				lockfile['packages']['node_modules/@playwright/test']?.version;

			console.log(`Playwright v${version} found in the package-lock.json`);
			return `v${version}`;
		} catch (error) {
			console.log(error);
		}
	} catch (error) {
		console.debug('package-lock.json not found');
	}
};

const getVersionFromYarnLock = async () => {
	try {
		const data = await fs.readFile('./yarn.lock', 'utf-8');
		console.debug('yarn.lock found');

		const lines = data.split('\n');
		let playwrightLineIndex = lines.findIndex((line) => line.includes('playwright@'));

		if (playwrightLineIndex === -1) {
			playwrightLineIndex = lines.findIndex((line) => line.includes('@playwright/test@'));
		}

		if (playwrightLineIndex !== -1) {
			const versionLine = lines[playwrightLineIndex + 1];
			const version = versionLine.split('"')[1];

			console.log(`Playwright v${version} found in the yarn.lock`);
			return `v${version}`;
		}
	} catch (error) {
		console.debug('yarn.lock not found');
	}
};

const getVersionFromPnpmLock = async () => {
	try {
		const data = await fs.readFile('./pnpm-lock.yaml', 'utf-8');
		console.debug('pnpm-lock.yaml found');

		const lockfile = yaml.load(data);
		const packages = lockfile.packages;

		// First, check for the non-scoped playwright package.
		for (const pkg in packages) {
			if (pkg.includes('playwright')) {
				const match = pkg.match(/@([^@]+)$/);
				if (match) {
					const version = match[1];
					console.log(`Playwright v${version} found in the pnpm-lock.yaml`);
					return `v${version}`;
				}
			}
		}

		// Fallback: check for '@playwright/test'
		for (const pkg in packages) {
			if (pkg.includes('@playwright/test')) {
				const match = pkg.match(/@([^@]+)$/);
				if (match) {
					const version = match[1];
					console.log(`Playwright v${version} found in the pnpm-lock.yaml`);
					return `v${version}`;
				}
			}
		}
	} catch (error) {
		console.debug('pnpm-lock.yaml not found');
	}
};
