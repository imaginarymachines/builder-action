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
		if(error && ! error.startsWith('npm WARN')){
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
  let pluginDir = core.getInput('pluginDir');
  if( ! pluginDir ){
	pluginDir = process.env.GITHUB_WORKSPACE;
  }
  const pluginDirArg = `--pluginDir=${pluginDir}`;
  const tokenArg = `--token=${token}`;
  const pluginMachine = async (args) => {
	return await runCommand({
		path:paths.npx,
		args:["plugin-machine", ...args, pluginDirArg, tokenArg],
	});
  }

  await runCommand({path:paths.npm, args:["install","plugin-machine","-g"]});
  await pluginMachine(["plugin","build"]);
  await pluginMachine(["plugin","zip"]);
  const upload = await pluginMachine(["upload"]);
  console.log(upload);
  core.setOutput('upload', upload);

}

run();
