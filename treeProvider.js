const vscode = require('vscode');


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
    constructor(label, children, isAppName = false, args = [], parent = null, isArgs = false) {
        // clean app name for urls
        const labelCleaner = (fullLabel) => {
            let name = fullLabel;
            if (isArgs) {
                let tempName = fullLabel.split(' -> ');
                name = `${tempName[0]} <${tempName[1]}>`;
            } else {
                let tempName = fullLabel.split(':');
                if (!['', undefined, null].includes(tempName[1])) {
                    name = tempName[1]
                };
            }
            return name;
        };

        // clean the display name for an app_name
        const readerPathCleaner = (fullLabel)  => {
            let name = fullLabel;

            if (fullLabel.includes('READER_FILE_PATH')) {
                let tempName = fullLabel.split('\\');
                name = tempName.splice(tempName.length - 2, 2).join('\\');
            }

            return name.toUpperCase();
        };


        // a url name should be collapsed while a app_name is expanded
        const collapsedTreeOrNot = (() => {
            if (isAppName) {
                return vscode.TreeItemCollapsibleState.Expanded;
            } else {
                return vscode.TreeItemCollapsibleState.Collapsed;
            }
        })();

        // used get the correct name to display
        const labelToFeed = isAppName? readerPathCleaner(label): labelCleaner(label);
        

        super(labelToFeed, children === undefined || children.length === 0 ? vscode.TreeItemCollapsibleState.None : collapsedTreeOrNot);
		this.children = children;
        this.isAppName = isAppName;
        this.fullLabel = label;
        this.urlArguments = args;
        this.parent = parent;
        this.contextValue = (() => {
            if (isAppName) {
                return 'app';
            } else if (isArgs) {
                return 'args';
            } else {
                return 'urlName';
            };
        })();
        this.tooltip = this.getToolTip();
    };

    getToolTip () {
        let tip;
        if (this.contextValue === 'app'){
            if (this.fullLabel.includes('READER_FILE_PATH')) {
                tip = `App found in ${this.label}`;
            } else {
                tip = `App called ${this.label}`;
            };
        } else if (this.contextValue === 'urlName') {
            tip = `url named ${this.label}`;
        } else if (this.contextValue === 'args') {
            let splitLabel = this.fullLabel.split(' -> ');
            let type = splitLabel[1] === 'type_undecleared'? 'undeclared': splitLabel[1];
            tip = `Url argument of ${type} type`;
        }
        return tip;
    }


    
    
};


module.exports = {
    TreeDataProvider,
    TreeItem
};


