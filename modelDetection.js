/* 
    Detect automatically all models inside of a project from admin module
    using .detect
*/


const fs = require('fs');
const path = require('path');


/**
 * Remove " or ' from text
 * @param {string} text 
 * @returns {string} text without quotation marks
 */
const removeQuotationMarks = (text) => text.replace(/"/g, '').replace(/'/g, '');


/**
 * Remove whitespace from text
 * @param {string} text 
 * @returns {string} text without space
 */
const removeSpace = (text) => text.replace(/\s/g, '');


/**
 * Remove comments from python code text
 * @param {string} pythonCodeText 
 * @returns {string} python code without comments
 */
const removePythonComments = (pythonCodeText) => pythonCodeText.replace(/""".*?"""/sg, '').replace(/#.*?\n/sg, '');


/**
 * Get all model class names from text
 * returns an object with the following keys:
 *  1. registeredModels - models registered
 *  2. inlineModels - models appearing as inline only i.e. they don't appear on changelist on admin site
 * 
 *  if a models is both inline and registered, it will appear on registeredModels only
 * 
 * @param {string} fileText 
 * @returns {{registeredModels: string[], inlineModels: string[]}} object with registered and inline models
 */
function retrieveModelClassNames (fileText) {
    /* 
        Using text from a model file, retrieve all model classes
    */
    
    const registeredModels = [];
    const inlineModels = [];
    fileText = removePythonComments(fileText);

    // look for an alias for register? the search for registered models
    const aliasMatch = fileText.match(/from django\.contrib\.admin\simport\sregister\sas\s(?<alias>.*?)$/m);
    const registerName = aliasMatch && aliasMatch.groups.alias? aliasMatch.groups.alias: 'register';
    const modelPattern = new RegExp(`${registerName}\\((?<model>.*?)[\\),]`, 'g')

    let match = modelPattern.exec(fileText);

    while (match) {
        if (match.groups.model) {
            registeredModels.push(removeSpace(match.groups.model));
        };
        match = modelPattern.exec(fileText);
    };

    // look for inline models
    const inlineModelPattern = new RegExp(/model[\s]*=[\s]*(?<inlineModel>.*?)$/gm)
    let inlineMatch = inlineModelPattern.exec(fileText);

    while (inlineMatch) {
        if (inlineMatch.groups.inlineModel && !registeredModels.includes(inlineMatch.groups.inlineModel)) {
            inlineModels.push(removeSpace(inlineMatch.groups.inlineModel));
        };
        inlineMatch = inlineModelPattern.exec(fileText);
    };

    return { registeredModels, inlineModels }
};


/**
 * Takes the path of an app and gets text from the admin module
 * @param {string} appPath 
 * @returns {string[]} an array of text from the appPath admin module
 */
 function retrieveTextFromAdminModule (appPath) {
    /* 
        Models in django are registered in the admin module
        1. projectroot/app/admin.py
        2. projectroot/app/admin/*
    */
    const files = [];
    const paths = [
        path.join(appPath, 'admin.py'),
        path.join(appPath, 'admin')
    ];

    if (fs.existsSync(paths[0])) {
        files.push(fs.readFileSync(paths[0], {
            encoding: 'utf-8',
            flag: 'r'
        }));
    } else if (fs.existsSync(paths[1])) {

        const transformImportToPath = (importPath = '', imports = '') => {
            /* 
                receive imports and transform them to a path
            */
            const importPaths = [];

            if (!importPath.startsWith('.')) {
                importPath = importPath.replace(/.*?\.admin[\.]*/, '.');
            };

            const splitPath = importPath.split('.');
            imports.split(',').map((import_) => importPaths.push(
                [path.join(...splitPath, import_.trim()), import_.trim()]
            ))
            return importPaths;
        };
        
        const getAllImports = (home) => {            
            const initFile = path.join(home, '__init__.py');

            if (fs.existsSync(initFile)) {
                const initFileText = removePythonComments(fs.readFileSync(initFile, {
                    encoding: 'utf-8',
                    flag: 'r'
                }));
                const importRegex = new RegExp(/from\s(?<path>.*?)\simport\s(?<import>.*?$)/mg);
                let match = importRegex.exec(initFileText);

                while (match) {
                    if (match.groups.path && match.groups.import) {
                        transformImportToPath(match.groups.path, match.groups.import).forEach((processedImport) => {
                            const importAsFile = path.join(home, `${processedImport[0]}.py`);
                            const theImport = processedImport[1];

                            if (fs.existsSync(importAsFile)) {
                                files.push(fs.readFileSync(importAsFile, {
                                    encoding: 'utf-8',
                                    flag: 'r'
                                }));
                            } else {
                                getAllImports(path.join(home, theImport));
                            };
                        });
                    };

                    match = importRegex.exec(initFileText);
                };
            };
        };

        getAllImports(paths[1]);
    };

    return files;
 };



/**
 * Takes the root of the project and searches for all models in the project
 * @param {string} projectRootPath 
 * @param {boolean} registeredOnly only search registered apps only; default is false
 * @returns {Map<string, string[]>} a map whose keys are apps and values are arrays of model class names
 */
 function searchModels (projectRootPath, registeredOnly = false) {
    const localApps = [];
    let authModels = ['Group', 'User'];

    // project directories
    const rootDirs = fs.readdirSync(projectRootPath, {
        withFileTypes: true
    }).filter((dirent) => dirent.isDirectory()).map((dirent) => dirent.name);

    // check all folders or just registered ones
    if (registeredOnly) {
        // retrieve all apps in the project from the settings.py
        const managePyText = fs.readFileSync(path.join(projectRootPath, 'manage.py'), {
            encoding: 'utf-8',
            flag: 'r'
        });
        const settingsModuleMatch = removePythonComments(managePyText).match(/,\s(?<settings>.*?.settings)/);
        const settingsModule = settingsModuleMatch && settingsModuleMatch.groups.settings? removeQuotationMarks(settingsModuleMatch.groups.settings): null;

        if (settingsModule) {
            // retieve settings.py
            let settingsText;
            const settingsFolder = settingsModule.split('.')[0];
            const possibleSettingsFiles = [
                path.join(projectRootPath, settingsFolder, 'settings.py'),
                path.join(projectRootPath, settingsFolder, 'settings', 'base.py')
            ]

            if (fs.existsSync(possibleSettingsFiles[0])) {
                // settings in 'root/module/settings.py'
                settingsText = fs.readFileSync(possibleSettingsFiles[0], {
                    encoding: 'utf-8',
                    flag: 'r'
                });

            } else if (fs.existsSync(possibleSettingsFiles[1])) {
                // settings exists in 'root/module/settings/base.py'
                settingsText = fs.readFileSync(possibleSettingsFiles[1], {
                    encoding: 'utf-8',
                    flag: 'r'
                });
            };

            // get installed apps
            if (settingsText) {
                const installedAppsMatch = removePythonComments(settingsText).match(/INSTALLED_APPS\s=\s\[(?<installedApps>.*?)\]/s);
                const installedApps = installedAppsMatch && installedAppsMatch.groups.installedApps? installedAppsMatch.groups.installedApps: null;

                if (installedApps) {
                    const registeredApps = installedApps.split(',').filter((app) => !app.includes('django.')).map((app) => removeQuotationMarks(app.trim()));
                    
                    // loop through all apps registeredApps and add to registeredLocalApps ones in rootDir
                    registeredApps.forEach((app) => {
                        const appDir = app.includes('.apps.')? app.split('.')[0]: app;
                        if (rootDirs.includes(appDir)) {
                            localApps.push(appDir);
                        };
                    });
                };

                if (settingsText.match(/AUTH_USER_MODEL/g)) {
                    authModels = ['Group'];
                };
            };
        };
    } else {
        localApps.push(...rootDirs.filter((dir) => {
            return [
                path.join(projectRootPath, dir, 'admin.py'),
                path.join(projectRootPath, dir, 'admin')
            ].some((home) => fs.existsSync(home));
        }));
    };

    // loop through every app and retieve models
    const projectModels = new Map([['auth', authModels]])
    localApps.forEach((app) => {
        const modelClasses = retrieveTextFromAdminModule(path.join(projectRootPath, app)).map((moduleText) => {
            return retrieveModelClassNames(moduleText).registeredModels;
        });
        
        if (modelClasses.length) {
            projectModels.set(app, modelClasses.flat());
        };
    });

    return projectModels

};


module.exports = {
    detect: searchModels
}