
// most @actions toolkit packages have async methods
async function run() {
	const core = require('@actions/core')
	const glob = require('@actions/glob')

	const globOptions = {
		followSymbolicLinks: 'TRUE'
	}
	const globber = glob.create(core.getInput('files'), globOptions)
	for await (const file of globber.globGenerator()) {
	console.log(file)
	}

}

run();
