const core = require('@actions/core');

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
async function run() {
	let version = '';
	try {
		const lockfile = require('../package-lock.json');
		version = lockfile['packages']['node_modules/@playwright/test'].version;

		console.log(`Found Playwright v${version} in the lockfile`);
		core.setOutput('playwright-version', `v${version}`);
	} catch (error) {
		core.setFailed('No Playwright version found');
	}
}

module.exports = {
	run
};
