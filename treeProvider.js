const vscode = require('vscode');
const trees = {
    APP: 0,
    URL: 1,
    ARGUMENT: 2    
};


class TreeDataProvider {
    constructor(urlsTreeItems) {
		this.data = urlsTreeItems;
	};  	

    getTreeItem(element) {
        return element;
	};
	
    getChildren(element) {
        if (element === undefined) {
            return this.data;
        };
        return element.children;
	};

};


class TreeItem extends vscode.TreeItem {
 
    constructor (label, treeType, children, parent, simpleLabel) {
        let collapsedTreeOrNot, labelToFeed, contextValue, tooltip;

        if (treeType === trees.APP) {
            collapsedTreeOrNot = label === 'admin'? vscode.TreeItemCollapsibleState.Collapsed: vscode.TreeItemCollapsibleState.Expanded;
            contextValue = 'app';
            
            if (label.includes('READER_FILE_PATH')) {
                const _tempLabel = label.split('\\');
                labelToFeed = _tempLabel.splice(_tempLabel.length - 2, 2).join('\\');
            } else {
                labelToFeed = label;
            };
            labelToFeed = labelToFeed.toUpperCase();
            tooltip = `App called ${labelToFeed}`;
        
        } else if (treeType === trees.URL) {
            collapsedTreeOrNot = vscode.TreeItemCollapsibleState.Collapsed;
            contextValue = 'urlName';
            labelToFeed = simpleLabel;
            tooltip = `URL config named ${labelToFeed}`;

        } else if (treeType === trees.ARGUMENT) {
            contextValue = 'args';
            const _tempLabel = label.split('=');
            const typeName = _tempLabel[1] === 'NULL'? 'Type undeclared': _tempLabel[1];
            labelToFeed = `${_tempLabel[0]} <${typeName}>`;
            tooltip = `URL config argument for ${parent}`;
        };


        super(labelToFeed, children === undefined || children.length === 0 ? vscode.TreeItemCollapsibleState.None : collapsedTreeOrNot);
        this.children = children;
        this.ogLabel = label;
        this.contextValue = contextValue;
        this.tooltip = tooltip;
    };

};


module.exports = {
    TreeDataProvider,
    TreeItem,
    trees
};


