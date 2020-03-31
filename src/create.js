const axios = require('axios');
const {resolve} = require('path');
const ora = require('ora');
const inquirer = require('inquirer');
const chalk = require('chalk');
let downLoadGitRepo = require('download-git-repo');
const {promisify} = require('util');
downLoadGitRepo = promisify(downLoadGitRepo);
const {downloadDirectory} = require('./constants');

// 获取项目列表
const fetchRepoList = async () => {
	try {
		const {data} = await axios.get('https://api.github.com/users/{你的github用户名}/repos');
		return data;
	} catch (e) {
		console.log(`错误${e}`);
	}
};

// 封装loading效果
const waitFnLoading = (fn, message) => async (...args) => {
	const spinner = ora(chalk.red(message));
	spinner.start();
	const result = await fn(...args);
	spinner.succeed();
	return result;
};

// 下载模版
const downLoad = async (repo, projectName) => {
	let api = `LingKim/${repo}`;
	await downLoadGitRepo(api,projectName);
	return projectName;
};

module.exports = async (projectName) => {
	try {
		const repos = await waitFnLoading(fetchRepoList, 'List of request templates，Please later...')();
		const result = repos.map((item) => item.name);
		// 选择项目模版
		const {repo} = await inquirer.prompt({
			name: 'repo',
			type: 'list',
			message: '请选择一个项目模版',
			choices: result,
		});
		// 下载模版
		const downLoadResult = await waitFnLoading(downLoad,'download template...')(repo,projectName);
		if(downLoadResult) {
			 console.log(chalk.green('Project download completed！！！'));
		}
		console.log(downLoadResult);
	} catch (e) {
		console.log('报错了=========' + e);
	}
};




