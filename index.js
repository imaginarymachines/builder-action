const core = require('@actions/core');
const {pluginMachine} = require( 'plugin-machine').default;

async function main({token,pluginDir}){

	return new Promise( async  (resolve, reject) => {
		try {
			const upload = await pluginMachine.builder({
				pluginDir,
				token
			});
			if( upload && upload.url ){
				resolve(upload);
			}
			reject({
				message:upload.message ? upload.message : 'Error'}
			);
		} catch (error) {
			reject({
				message:error.message ? error.message : 'Error'}
			);
		}
	})

}
async function run() {
	const token = core.getInput('token');
	let pluginDir = core.getInput('pluginDir');
	if( ! pluginDir ){
		pluginDir = process.env.GITHUB_WORKSPACE;
	}
	try {
		const upload = await main({
			pluginDir,
			token
		});
		if( upload && upload.url ){
			core.setOutput('upload', upload.url);
		}
		core.setError(upload.message ? upload.message : 'Error');
	} catch (error) {
		core.setFailed(error.message);
	}



}

run();
