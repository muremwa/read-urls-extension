const path = require('path');
const fs = require('fs');


const defaultSettings = {
    adminUrls: true,
    autoLoadModels: true,
    builtInAuth: false,
    expandApps: 'normal'
}


function cleanUpSettings (tempSettings) {
    // settings should have all entries on default settings
    const reqKeys = Object.keys(defaultSettings);
    const cleanSettings = {}
    
    reqKeys.forEach(key => {
        const value = tempSettings.hasOwnProperty(key)? tempSettings[key]: defaultSettings[key];
        cleanSettings[key] = value
    });

    return cleanSettings;
};


/**
 * returns an object with settings
 * @param {string} rootPath
 * @param {(error: Error) => void} errorWithSettings
 * @returns {{
    adminUrls: boolean,
    autoLoadModels: boolean,
    builtInAuth: boolean,
    expandApps: string
}} extensionSettings
*/
function loadSettings (rootPath, errorWithSettings) {
    let mainSettings = defaultSettings;

    // load up new settings
    try {
        const loadedSettings = JSON.parse(
            fs.readFileSync(
                path.join(rootPath, '.vscode', 'urlConfigs', 'settings.json')
            ),
            {
                encoding: 'utf-8',
                flag: 'r'
            }
        );

        if (typeof loadedSettings === 'object' && loadedSettings !== null) {
            mainSettings = cleanUpSettings(loadedSettings);
        };
    } catch (error) {
        if (error.code !== 'ENOENT') {
            errorWithSettings(error);
        };
    };

    return mainSettings;
};

module.exports = {
    loadSettings
}