const vscode = require('vscode');
const path = require('path');

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

class ArgumentTreeItem extends vscode.TreeItem {
    /**
     * 
     * @param {string} argumentName 
     * @param {string} argumentType 
     * @param {string} parent 
     */
    constructor(argumentName, argumentType, parent) {
        super(`${argumentName} <${argumentType === 'NULL'? 'type_undeclared': argumentType}>`, vscode.TreeItemCollapsibleState.None);
        this.contextValue = 'args'
        this.tooltip = `URL config argument for ${parent}`;
        this.argumentName = argumentName;
    };
};


class URLConfigTreeItem extends vscode.TreeItem {
    /**
     * 
     * @param {string} label 
     * @param {ArgumentTreeItem[]} children 
     * @param {string} urlConfigName 
     * @param {boolean} keywords 
     */
    constructor (label, children, urlConfigName, keywords) {
        super(urlConfigName, children && children.length > 0? vscode.TreeItemCollapsibleState.Collapsed: vscode.TreeItemCollapsibleState.None);
        this.children = children;
        this.contextValue = 'urlName';
        this.ogLabel = label;
        this.keywords = keywords;
        this.tooltip = `URL config named ${urlConfigName}`;
    };
};


class AppTreeItem extends vscode.TreeItem {
    /**
     * 
     * @param {string} label 
     * @param {URLConfigTreeItem[]} children 
     * @param {boolean} isExtraApp 
     * @param {{force: boolean, collapsed: boolean}} forceCollapse 
     */
    constructor (label, children, isExtraApp, forceCollapse = {force: false, collapsed: false}) {
        const collapsedState = () => {
            let state = vscode.TreeItemCollapsibleState.None;

            if (children.length > 0) {
                if (forceCollapse.force) {
                    state = forceCollapse.collapse? vscode.TreeItemCollapsibleState.Collapsed: vscode.TreeItemCollapsibleState.Expanded;
                } else {
                    state = isExtraApp? vscode.TreeItemCollapsibleState.Collapsed: vscode.TreeItemCollapsibleState.Expanded;
                };
            };
            return state;
        };
        const labelToFeed = ((() => {
            let processedLabel = label;

            if (label.includes('READER_FILE_PATH_')) {
                const homeMatch = label.match(/READER_FILE_PATH_.*?\\(?<home>[^\\/:*?"<>|]+\\urls.py)$/);
                processedLabel = homeMatch && homeMatch.groups.home? homeMatch.groups.home: 'UNKNOWN_APP\\urls.py';
            };

            return processedLabel.toUpperCase();
        })());

        super(labelToFeed, collapsedState());
        this.children = children;
        this.contextValue = 'app'
        this.ogLabel = label;
        this.tooltip = `App called ${labelToFeed}`;
    }
}


class ProjectTreeItem extends vscode.TreeItem {
    /**
     * 
     * @param {string} projectTitle 
     * @param {AppTreeItem[]} children 
     */
    constructor (projectTitle, children) {
        super(`${projectTitle} (PROJECT)`, vscode.TreeItemCollapsibleState.Collapsed);
        this.contextValue = 'project';
        this.tooltip = `Project called ${projectTitle}`;
        this.ogLabel = projectTitle;
        this.children = children;
        this.iconPath = {
            light: path.join(__dirname, 'media', 'folder_light.png'),
            dark: path.join(__dirname, 'media', 'folder_dark.png')
        };
    };
}


module.exports = {
    TreeDataProvider,
    ArgumentTreeItem,
    URLConfigTreeItem,
    AppTreeItem,
    ProjectTreeItem,
};


