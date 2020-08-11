// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const reader = require('./src/mainReader');
const provider = require('./treeProvider');
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
	const reverseName = treeItem.fullLabel;
	// extract args from children
	let args = treeItem.children.map((child) => child.fullLabel.split(' -> ')[0]);

	// map the children to the right string representation
	args = args.map((arg) => `"${arg}": str(%${arg}%)`);

	// get kwargs from args
	args = args.length > 0? `, kwargs={${args.join(', ')}}`: '';

	// generate the reverse function
	const reverseUrl = `${reverseType}("${reverseName}"${args})`

	addToClipBoard(reverseUrl);

	vscode.window.showInformationMessage(`Copied for ${lazy?'for reverse_lazy': 'for reverse'} to clipboard`);
};


/* 
	Read all urls and plant the tree
*/
function readAndDisplayUrls () {
	// retrieve all urls using reader by passing in workspace path
	const urlPatterns = reader.mainReader(vscode.workspace.rootPath);

	// this shall contain all TreeItems to show
	const urlTreeItems = [];

	// loop through all patterns and create tree items
	console.log('loop through the map')
	for (const app of urlPatterns.keys()) {
		const appUrlPatterns = urlPatterns.get(app);

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
	// read and display every url
	readAndDisplayUrls();

	// // Refresh button
	// vscode.commands.registerCommand('read-urls.refresh', () => readAndDisplayUrls());

	// // copy for template
	// vscode.commands.registerCommand('read-urls.copyForTemplate', function (treeItem) {
	// 	if (treeItem === undefined) {
	// 		vscode.window.showInformationMessage('No url selected');
	// 	};
		
	// 	const reverseName = treeItem.fullLabel;
	// 	// extract args from children
	// 	let args = treeItem.children.map((child) => child.fullLabel.split(' -> ')[0]);
		
	// 	// map the children to the right string representation
	// 	args = args.map((arg) => `%${arg}%`);
		
	// 	// get kwargs from args
	// 	args = args.length > 0? `${args.join(' ')}`: '';

	// 	const templateUrl = `{% url '${reverseName}' ${args === ''? '': `${args} `}%}`;

	// 	addToClipBoard(templateUrl);

	// 	vscode.window.showInformationMessage('Copied url template tag to clipboard');
	// });

	// copy for reverse
	// vscode.commands.registerCommand('read-urls.copyForReverse', (treeItem) => getReverseUrl(treeItem));

	// // copy reverse lazy
	// vscode.commands.registerCommand('read-urls.copyForReverseLazy', (treeItem) => getReverseUrl(treeItem, true));

};
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {}


module.exports = {
	activate,
	deactivate
}
