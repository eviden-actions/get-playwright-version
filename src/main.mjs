import core from '@actions/core';
import { promises as fs } from 'node:fs';
import yaml from 'js-yaml';

/**
 * The main function for the action.
 * @returns {Promise<string>} The Playwright version.
 */
export const run = async () => {
	try {
		const version =
			(await getVersionFromPackageLock()) || (await getVersionFromYarnLock()) || (await getVersionFromPnpmLock());
		if (!version) {
			core.setFailed('Cannot find a lockfile with Playwright');
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
			let version = lockfile['packages']['node_modules/@playwright/test'].version;

			console.log(`Playwright v${version} found in the package-lock.json`);
			return `v${version}`;
		} catch (error) {
			console.log(error);
			core.setFailed('No Playwright version found');
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
		const playwrightLineIndex = lines.findIndex((line) => line.includes('@playwright/test@'));

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

		for (const pkg in packages) {
			if (pkg.includes('@playwright/test')) {
				const version = pkg.match(/@([^@]+)$/)[1];
				console.log(`Playwright v${version} found in the pnpm-lock.yaml`);
				return `v${version}`;
			}
		}
	} catch (error) {
		console.debug('pnpm-lock.yaml not found');
	}
};
