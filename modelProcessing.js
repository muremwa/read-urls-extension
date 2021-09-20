/* 
    Detect automatically all models inside of a project
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
 * Remove comments from python code text
 * @param {string} pythonCodeText 
 * @returns {string} python code without comments
 */
const removePythonComments = (pythonCodeText) => pythonCodeText.replace(/""".*?"""/sg, '').replace(/#.*?\n/sg, '');


/**
 * Get all model class names from text
 * @param {string} fileText 
 * @returns {string[]} model class names
 */
function retrieveModelClassNames (fileText) {
    /* 
        Using text from a model file, retrieve all model classes
    */
    const modelNames = []
    fileText = removePythonComments(fileText);

    // determine what a model is called (i.e. it has an alias like "from django.db.models import Model as alias")
    const aliasMatch = fileText.match(/Model\sas\s(?<alias>\w+)/);
    const modelPattern = aliasMatch && aliasMatch.groups && aliasMatch.groups.alias? new RegExp(`class.*?\\(${aliasMatch.groups.alias}\\):`, 'g'): /class.*?\(.*?Model\):/g;

    // search fileText for classes inheriting from modelName
    const rawModels = fileText.match(modelPattern);
    
    // extract the model name
    if (rawModels) {
        rawModels.forEach((model) => {
            const posName = model.match(/class\s(?<model>.*?)\(/);
            if (posName && posName.groups && posName.groups.model) {
                modelNames.push(posName.groups.model);
            };
        });
    };
    
    return modelNames
};


/**
 * Takes the path of an app and gets text from files with models
 * @param {string} appPath 
 * @returns {string[]} an array of files with models
 */
function retrieveTextFromModelModules (appPath) {
    /* 
        Models in django live in either two places
        1. projectroot/app/models.py
        2. projectroot/app/models/*.py
    */
    const files = [];
    const paths = [
        path.join(appPath, 'models.py'),
        path.join(appPath, 'models')
    ];

    if (fs.existsSync(paths[0])) {
        files.push(fs.readFileSync(paths[0], {
            encoding: 'utf-8',
            flag: 'r'
        }))
    } else if (fs.existsSync(paths[1])) {
        const initFile = path.join(paths[1], '__init__.py')
        if (fs.existsSync(initFile)) {
            const initCode = removePythonComments(fs.readFileSync(initFile, {
                encoding: 'utf-8',
                flag: 'r'
            }))
            const importRegex = new RegExp(/from\s(.*?)\simport/, 'g');
            let match = importRegex.exec(initCode);

            while (match) {
                const file = match[1].includes('.')? match[1].replace(/\./g, '\\'): match[1];
                files.push(fs.readFileSync(path.join(paths[1], `${file}.py`), {
                    encoding: 'utf-8',
                    flag: 'r'
                }));
                match = importRegex.exec(initCode);
            };
        };
    };

    return files;
};


/**
 * Takes the root of the project and searches for all models in the project
 * @param {string} projectRootPath 
 * @param {boolean} registeredOnly only search registered apps only; default is false
 * @returns {{app: string[]}} object whose keys are apps and values are arrays of model class names
 */
function searchModels (projectRootPath, registeredOnly = false) {
    const localApps = [];

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
                    })
                };
            };
        };
    } else {
        localApps.push(...rootDirs.filter((dir) => {
            return [
                path.join(projectRootPath, dir, 'models.py'),
                path.join(projectRootPath, dir, 'models')
            ].some((home) => fs.existsSync(home));
        }));
    };

    // loop through every app and retieve models
    const projectModels = {}
    localApps.forEach((app) => {
        const modelClasses = retrieveTextFromModelModules(path.join(projectRootPath, app)).map((moduleText) => {
            return retrieveModelClassNames(moduleText);
        });
        
        if (modelClasses.length) {
            projectModels[app] = modelClasses.flat();
        };
    });

    return projectModels

};


module.exports = {
    detect: searchModels
}