// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const reader = require('./src/mainReader');
const provider = require('./treeProvider');
const externalUrls = require('./extraUrls').loadUrls;
const clipboard = require('clipboardy');


/**
 * @param {string} stringToAdd
 * @returns {void}
*/
function addToClipBoard (stringToAdd) {
	/* 
		Add stringToAdd to clipboard
	*/
	clipboard.writeSync(stringToAdd);
};



/**
 * @param {provider.TreeItem} treeItem
 * @param {Boolean} lazy
 * @returns {void}
*/
function getReverseUrl (treeItem, lazy = false) {
	if (treeItem === undefined) {
		vscode.window.showInformationMessage('No url selected');
	};

	const reverseType = lazy? "reverse_lazy": "reverse";
	// get the reverse name
	const reverseName = treeItem.ogLabel;

	const simpleArgs = treeItem.children.map((arg) => {
		const _arg = arg.ogLabel.split('=')[0];
		return `"${_arg}": str(%${_arg}%)`;
	});

	const args = simpleArgs.length > 0? `, kwargs={${simpleArgs.join(', ')}}`: '';

	// generate the reverse function
	const reverseUrl = `${reverseType}("${reverseName}"${args})`

	addToClipBoard(reverseUrl);

	vscode.window.showInformationMessage(`Copied for ${lazy?'for reverse_lazy': 'for reverse'} to clipboard`);
};


/* 
	Read all urls and plant the tree
*/
function readAndDisplayUrls (projectPath) {
	// know if this is a django project, true by default, changed using the isNotProject closure
	let realProject = true;

	// retrieve all urls using reader by passing in workspace path
	const urlPatterns = reader.mainReader(projectPath, (isNotProject) => {
		if (isNotProject) {
			vscode.window.showInformationMessage('This is not a django project.');
			realProject = false;
		};
	}, (brace, file) => {
		const smallFileName = file.split('\\');
		vscode.window.showInformationMessage(`${smallFileName.splice(smallFileName.length - 2, 2).join('\\')} is missing '${brace}'`);
	});

	// load pre defined url configurations
	const extraUrlPatterns = externalUrls(projectPath, (error, file) => {
		vscode.window.showErrorMessage(`The configurations in ${file} are incorrect`);
	}, () => {
		vscode.window.showErrorMessage('Wrong formart on .vscode/urlConfigs/models.json')
	});

	// merge both patterns
	const mergedPatterns = [...extraUrlPatterns.keys()].length && realProject? new Map([...extraUrlPatterns, ...urlPatterns]): urlPatterns;


	// this shall contain all TreeItems to show
	const urlTreeItems = [];

	// loop through all patterns and create tree items
	for (const app of mergedPatterns.keys()) {
		const appUrlPatterns = mergedPatterns.get(app);

		// create urlConfig children
		const appUrlConfigs = appUrlPatterns.map((appUrlPattern) => {
			// url config arguments
			const urlArgs = appUrlPattern.arguments.map((arg) => new provider.TreeItem(`${arg.name}=${arg.argType}`, provider.trees.ARGUMENT));
			return new provider.TreeItem(appUrlPattern.reverseName, provider.trees.URL, urlArgs);
		});

		// add app
		urlTreeItems.push(
			new provider.TreeItem(app, provider.trees.APP, appUrlConfigs)
		);
	};

	vscode.window.registerTreeDataProvider('project-urls', new provider.TreeDataProvider(urlTreeItems));
	
};


/**
 * @param {vscode.ExtensionContext} context
 */
function activate() {

	// vscode.workspace.rootPath is depracated, currently the extension will support only workspace folder 1, others to be supported in future.
	const projectOne = vscode.workspace.workspaceFolders[0].uri.fsPath;

	if (projectOne) {
		// read and display every url
		readAndDisplayUrls(projectOne);

		// Refresh button
		vscode.commands.registerCommand('read-urls.refresh', () => readAndDisplayUrls());

		// copy for template
		vscode.commands.registerCommand('read-urls.copyForTemplate', function (treeItem) {
			if (treeItem === undefined) {
				vscode.window.showInformationMessage('No url selected');
			};
			
			const reverseName = treeItem.ogLabel;

			const args = treeItem.children.map((arg) => {
				const _arg = arg.ogLabel.split('=')[0];
				return `%${_arg}%`;
			}).join(' ');

			const templateUrl = `{% url '${reverseName}' ${args === ''? '': `${args} `}%}`;

			addToClipBoard(templateUrl);

			vscode.window.showInformationMessage('Copied url template tag to clipboard');
		});

		// copy for reverse
		vscode.commands.registerCommand('read-urls.copyForReverse', (treeItem) => getReverseUrl(treeItem));

		// // copy reverse lazy
		vscode.commands.registerCommand('read-urls.copyForReverseLazy', (treeItem) => getReverseUrl(treeItem, true));
	} else {
		vscode.window.showInformationMessage('Open a Django project to use the extension');
	}
};
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {}


module.exports = {
	activate,
	deactivate
}
