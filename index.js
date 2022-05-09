const core = require('@actions/core');
import {which} from "@actions/io"
const exec = require('@actions/exec');


const runCommand = async ({path, args = [],options = {}}) => {
	let output = '';
	let error = '';

	options.listeners = {
	  stdout: (data) => {
		output += data.toString();
	  },
	  stderr: (data) => {
		error += data.toString();
	  }
	};
	return new Promise(async(resolve, reject) => {
		await exec.exec(path, args, options);
		if(error){
			reject(error);
		}
		resolve(output);
	});

}
async function run() {
  const paths = {
    npm: await which("npm", true),
    npx: await which("npx", true),
    yarn: await which("yarn", true),
  };

  const token = core.getInput('token');
  await runCommand({path:paths.npm, args:["install"]});

  await runCommand({path:paths.npx, args:["install plugin-machine -g"]});
}

run();
