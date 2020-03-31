let {exists} = require('fs');
const {promisify} = require('util');
exists = promisify(exists);
const program = require('commander');
const {resolve} = require('path');
const {version} = require('./constants');
const figlet = require('figlet');
const chalk = require('chalk');
const Printer = require('@darkobits/lolcatjs');
const inquirer = require('inquirer');
const shell = require('shelljs');
const txt = figlet.textSync('lilaoban');
const result = Printer.default.fromString(txt);
const create = require('./create');

console.log(result);

const mapAction = {
	create: {
		alias: 'c',
		description: 'create a project',
		examples: [
			'lilin-cli create <project-name>',
		],
	},
	'*': {
		alias: '',
		description: 'command not found',
		examples: [],
	},
};

Reflect.ownKeys(mapAction).forEach((action) => {
	program
		.command(action) // 配置命令的名字
		.alias(mapAction[action].alias) // 命令的别名
		.description(mapAction[action].description) // 命令对应的描述
		.action(async (cmd, name) => {
			if (action === '*') {
				console.log(chalk.yellow("🙏抱歉!!!") + "【" + chalk.red(name) + "】" + chalk.yellow("暂未实现,敬请期待..."));
			} else {
				// 判断该文件夹是否存在
				const pwd = resolve(...process.argv.slice(3));
				const result = await exists(pwd);
				//存在询问是否删除 不删除就输入新的文件夹名称然后下载项目 删除就下载项目到当下目录下
				if (result) {
					const {isDelete} = await inquirer.prompt({
						name: 'isDelete',
						type: 'list',
						message: 'The current directory already exists in the folder, whether to delete?',
						choices: ['true', 'false'],
					});
					if (isDelete === 'true') {
						shell.cd(pwd);
						shell.rm('-rf', pwd);
						await create(pwd);
					} else {
						const {temName} = await inquirer.prompt({
							name: 'temName',
							type: 'input',
							message: 'Please enter a folder name',
						});
						await create(resolve(temName));
					}
				} else {
					await create(pwd);
				}
			}
		});
});

program.on('--help', () => {
	console.log('\nExamples');
	Reflect.ownKeys(mapAction).forEach((action) => {
		mapAction[action].examples.forEach((example) => {
			console.log(`  ${example}`);
		});
	});
});

program.version(version).parse(process.argv);
