const vscode = require('vscode');
const path = require('path');
const trees = {
    APP: 0,
    URL: 1,
    ARGUMENT: 2,
    PROJECT: 3 
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
 
    constructor (label, treeType, children, parent, simpleLabel, settings, isExtraApp, useKeyWords) {
        let collapsedTreeOrNot, labelToFeed, contextValue, tooltip, icons, keywords;

        if (treeType === trees.APP) {
            contextValue = 'app';

            switch (settings.expandApps) {
                case 'collapsed':
                    collapsedTreeOrNot = vscode.TreeItemCollapsibleState.Collapsed;
                    break;
                
                case 'expanded':
                    collapsedTreeOrNot = vscode.TreeItemCollapsibleState.Expanded;
                    break;
            
                default:
                    collapsedTreeOrNot = label === 'admin' || isExtraApp? vscode.TreeItemCollapsibleState.Collapsed: vscode.TreeItemCollapsibleState.Expanded;
                    break;
            }
            
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
            keywords = settings.urlWithKeywords;
            tooltip = `URL config named ${labelToFeed}`;

        } else if (treeType === trees.ARGUMENT) {
            contextValue = 'args';
            const _tempLabel = label.split('=');
            const typeName = _tempLabel[1] === 'NULL'? 'Type undeclared': _tempLabel[1];
            labelToFeed = `${_tempLabel[0]} <${typeName}>`;
            tooltip = `URL config argument for ${parent}`;
        } else if (treeType === trees.PROJECT) {
            contextValue = 'project';
            labelToFeed = `${label} (PROJECT)`;
            collapsedTreeOrNot = vscode.TreeItemCollapsibleState.Collapsed;
            tooltip = `Project named ${label}`;
            icons = {
                light: path.join(__dirname, 'media', 'folder_light.png'),
                dark: path.join(__dirname, 'media', 'folder_dark.png')
            }
        };


        super(labelToFeed, children === undefined || children.length === 0 ? vscode.TreeItemCollapsibleState.None : collapsedTreeOrNot);
        this.children = children;
        this.ogLabel = label;
        this.contextValue = contextValue;
        this.tooltip = tooltip;
        this.iconPath = icons;
        this.keywords = keywords;
    };

};


module.exports = {
    TreeDataProvider,
    TreeItem,
    trees
};


