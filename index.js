const core = require('@actions/core');
import {which} from "@actions/io"
const exec = require('@actions/exec');
const github = require('@actions/github');

const runCommand = async ({path, args = [],options = {}}) => {
	let output = '';
	let error = '';

	if( ! options.listeners ){
		options.listeners = {
			stdout: (data) => {
				output += data.toString();
			},
			stderr: (data) => {
				error += data.toString();
			}
		};
	}
	return new Promise(async(resolve, reject) => {
		await exec.exec(path, args, options);
		if(error && ! error.startsWith('npm WARN')){
			//reject(error);
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
	const buildDir = 'output';
	const pluginDirArg = `--pluginDir=${pluginDir}`;
	const tokenArg = `--token=${token}`;
	const buildDirArg = `--buildDir=${buildDir}`;
	const pluginMachine = async (args) => {
		return await runCommand({
			path:paths.npx,
			args:["plugin-machine", ...args, pluginDirArg, tokenArg]
		});
	}
	await runCommand({path:paths.npm, args:["install","plugin-machine","-g"]});
	await pluginMachine(["plugin","build",buildDirArg]);
	await pluginMachine(["plugin","zip",buildDirArg]);
	const uploader = async () => {
		//@todo get CLI to only return the URL.
		let url = ''
		const listeners = {
			stdout: (data) => {
				data = data.toString();
				if( data.startsWith('Upload completed')){
					url = data.replace('Upload completed', '').trim();
				}
				if( data.startsWith('\u001b[32mUpload completed')){
					url = data.replace('\u001b[32mUpload completed','').trim();
				}

			},
			stderr: (data) => {

			}
		};
		await runCommand({
			path:paths.npx,
			args:["plugin-machine", "upload", pluginDirArg, tokenArg],
			options: {
				listeners
			}
		});
		if( url ){
			//Cut off after name of file.
			url = url.substring(0, url.indexOf('zip') + 3);
		}
		return url;
	}
	//Make upload url available to other steps
  	const upload = await uploader();
	core.setOutput('upload', upload);

	//Put a comment on PR request if enabled
	if( core.getInput('commentPr',false)){
		const token = core.getInput('GITHUB_TOKEN');
		const context = github.context;
		const {payload} = context;
		if ( typeof token !== 'string' ) {
			throw new Error('Invalid GITHUB_TOKEN: did you forget to set it in your action config?');
		}
		//And is a PR
		if( payload.hasOwnProperty('pull_request') ){
			const octokit = github.getOctokit(token);
			console.log(
				{
					issue_number:payload.pull_request.number,
					owner: context.repo.owner,
					repo: context.repo.repo,
					body: `Link To Built ZIP File: ${upload}`
				}
			);
			await octokit.rest.issues.createComment({
				issue_number:payload.pull_request.number,
				owner: context.repo.owner,
				repo: context.repo.repo,
				body: `Link To Built ZIP File: ${upload}`
			})
		}


	}

}

run();
