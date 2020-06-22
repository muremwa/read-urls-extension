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


// do all the work !!!
function readAndDisplayUrls () {
	// retrieve all urls using reader by passing in workspace path
	const urlPatterns = reader.reader(vscode.workspace.rootPath);

	// this shall contain all TreeItems to show
	const ultimatePatterns = [];

	// loop through all discovered patterns create TreeItems
	Object.keys(urlPatterns).forEach((key) => {
		// filter out patterns with no reverse name
		let patterns = urlPatterns[key].filter((item) => ![null, undefined].includes(item[0]));
		
		// create all TreeItems for each app
		let items = patterns.map((patternItems) => {
			let name = patternItems[0];
			let args = patternItems[1];

			// ensure args are not null
			if (!Array.isArray(args) || args === undefined || args === null) {
				args = [];
			};

			args = args.filter((arg) => arg !== null || arg !== undefined);


			// map an arg to a tree item
			args = args.map((arg) => {
				let argType = arg[1] === null? 'type_undecleared': `${arg[1]}`;
				return new provider.TreeItem(`${arg[0]} -> ${argType}`, [], false, [], name, true);
			})

			return new provider.TreeItem(name, args, false, [], key, false);
		});

		if (items.length > 0) {
			// add each app TreeItem with it's accompanying urls TreeItem(s)
			ultimatePatterns.push(
				new provider.TreeItem(key, items, true)
			);
		};
	});

	vscode.window.registerTreeDataProvider('project-urls', new provider.TreeDataProvider(ultimatePatterns));
	
};


/**
 * @param {vscode.ExtensionContext} context
 */
function activate() {
	// read and display every url
	readAndDisplayUrls();

	// Refresh button
	vscode.commands.registerCommand('read-urls.refresh', () => readAndDisplayUrls());

	// copy for template
	vscode.commands.registerCommand('read-urls.copyForTemplate', function (treeItem) {
		if (treeItem === undefined) {
			vscode.window.showInformationMessage('No url selected');
		};
		
		const reverseName = treeItem.fullLabel;
		// extract args from children
		let args = treeItem.children.map((child) => child.fullLabel.split(' -> ')[0]);
		
		// map the children to the right string representation
		args = args.map((arg) => `%${arg}%`);
		
		// get kwargs from args
		args = args.length > 0? `${args.join(' ')}`: '';

		const templateUrl = `{% url '${reverseName}' ${args === ''? '': `${args} `}%}`;

		addToClipBoard(templateUrl);

		vscode.window.showInformationMessage('Copied url template tag to clipboard');
	});

	// copy for reverse
	vscode.commands.registerCommand('read-urls.copyForReverse', (treeItem) => getReverseUrl(treeItem));

	// copy reverse lazy
	vscode.commands.registerCommand('read-urls.copyForReverseLazy', (treeItem) => getReverseUrl(treeItem, true));

};
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {}


module.exports = {
	activate,
	deactivate
}
