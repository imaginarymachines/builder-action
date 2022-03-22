const core = require("@actions/core");
const exec = require("@actions/exec");
const github = require("@actions/github");
const io = require("@actions/io");

const pluginMachineCli = require("plugin-machine").default;

const createApi = async (token) => {
	try {
		const api = await pluginMachineCli.pluginMachineApi(token);
		return api;
	} catch (error) {
		console.log({ error });
		core.setFailed("Could not create api");
	}
};

const uploadFile = async (fileName, filePath, pluginMachineApi) => {
	try {
		const upload = pluginMachineApi.uploadFile(fileName, filePath);
		return upload;
	} catch (error) {
		console.log({ error, fileName, filePath });
		core.setFailed("Failed to upload file");
	}
};
// most @actions toolkit packages have async methods
async function run() {
	const token = core.getInput("token");
	const pluginMachineApi = await createApi(token);
	const pluginDir = core.getInput("path");
	const { buildPlugin, makeZip } = pluginMachineCli.builder;

	const pluginMachineJson = pluginMachineCli.getPluginMachineJson(
		pluginDir,
		//Optional ovverides
		{}
	);
	console.log({ pluginMachineJson });

	try {
		const pmDockerApi = await pluginMachineCli.createDockerApi(); //no opts for now.

		const fileName = await buildPlugin(pluginMachineJson, "prod", pmDockerApi)
			.catch((error) => {
				console.log({ error });
				core.setFailed("Failed to build plugin");
			})
			.then(() => {
				makeZip(pluginDir, pluginMachineJson)
					.catch((error) => {
						console.log({ error });
						core.setFailed("Failed to zip plugin");
					})
					.then(({ name }) => {
						core.setOutput("zipFile", name);
						return name;
					});
			});
		const zipDownload = await uploadFile(fileName, `${pluginDir}/${fileName}`)
			.catch((error) => {
				console.log(error);
				core.setFailed("Failed to upload file");
			})
			.then((r) => {
				if (r.download) {
					return r.download;
				}
				core.setFailed("Could not get download link from upload");
			});
		core.setOutput(zipDownload, zipDownload);
		return 0;
	} catch (error) {
		console.log(error);
		core.setFailed("Could not make docker api");
	}
}

run();
