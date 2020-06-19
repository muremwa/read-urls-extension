// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const reader = require('./src/mainReader');


class TreeDataProvider {
    constructor() {
        this.data = [new TreeItem('cars', [
                new TreeItem('Ford', [new TreeItem('Fiesta'), new TreeItem('Focus'), new TreeItem('Mustang')]),
                new TreeItem('BMW', [new TreeItem('320'), new TreeItem('X3'), new TreeItem('X5')])
            ])];
	};  	
	
    getTreeItem(element) {
        return element;
	};
	
    getChildren(element) {
        if (element === undefined) {
            return this.data;
        }
        return element.children;
	};

};
class TreeItem extends vscode.TreeItem {
    constructor(label, children) {
        super(label, children === undefined ? vscode.TreeItemCollapsibleState.None : vscode.TreeItemCollapsibleState.Expanded);
        this.children = children;
    }
}


/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	let readUrls = vscode.commands.registerCommand('read-urls.readUrls', function () {
		const urlPatterns = reader.reader(vscode.workspace.rootPath);
		const ot = vscode.window.createOutputChannel('ot');

		vscode.window.registerTreeDataProvider('project-urls', new TreeDataProvider())
		// try {
		// } catch (e) {
			// console.log(e)
		// }

		Object.keys(urlPatterns).forEach(key => {
			ot.appendLine(
				urlPatterns[key].join('\n')
			);
		});

	})

	context.subscriptions.push(readUrls);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {}


module.exports = {
	activate,
	deactivate
}
