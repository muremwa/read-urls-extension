/* 
    load all extra apps url configurations
*/

const fs = require('fs');
const path = require('path');
const modelAdmin = require('./modelAdminLoad').modelAdmin;
const EXTRAURLS = 'extraUrls'
const isObj = (obj) => typeof obj === 'object' && obj !== null;


function _loadExtraUrls (files, errorCallBack) {
    const urlConfigs = new Map();

    files.forEach((file) => {
        if (file.match(/\.conf\.json/g)) {
            const configs = fs.readFileSync(file, { encoding: 'utf-8', flag: 'r' });
            
            try {
                const parsedconfigs = JSON.parse(configs);
                
                if (Array.isArray(parsedconfigs)) {
                    const trueConfig = ['appName', 'urls'];
                    const trueUrl = ['reverseName', 'arguments', 'viewName', 'hasArgs'];
                    const trueArg = ['name', 'argType'];
                    
                    parsedconfigs.forEach((config) => {
                        // ensure that every property for a config is present otherwise reject!
                        if (trueConfig.every((c) => Object.keys(config).includes(c)) && Array.isArray(config.urls)) {
                            const correctUrls = config.urls.every((url) => {
                                if (isObj(url) && trueUrl.every((c) => Object.keys(url).includes(c))) {
                                    if (Array.isArray(url.arguments) && [url.reverseName, url.viewName].every((c) => typeof c === 'string') && typeof url.hasArgs === 'boolean') {
                                        if (url.arguments.length === 0 || url.arguments.every((arg) => isObj(arg) && trueArg.every((c) => Object.keys(arg).includes(c)) && Object.values(arg).every((c) => typeof c === 'string' || c === null))) {
                                            return true;
                                        };
                                    };
                                };

                                return false;
                            });

                            if (correctUrls && typeof config.appName === 'string') {
                                urlConfigs.set(config.appName, config.urls)
                            };
                        };
                    });
                };
            } catch (error) {
                errorCallBack(error, file);
            };
        };
    });

    return urlConfigs
};


/**
 * @param {string} home
 * @returns {Map<string, []>}
 */
function loadUrls (home, handleExternalReadError, wrongFormatModels) {
    // Read json files in extraUrls
    let userConfigs;

    try {
        userConfigs = fs.readdirSync(path.join(home, '.vscode', 'urlConfigs')).map((file) => path.join(home, '.vscode', 'urlConfigs', file));
    } catch (error) {
        userConfigs = [];
    };

    const jFiles = [
        ...fs.readdirSync(path.join(__dirname, EXTRAURLS)).map((file) => path.join(__dirname, EXTRAURLS, file)),
        ...userConfigs
    ];

    const urls = _loadExtraUrls(jFiles, handleExternalReadError);

    if (urls.has('admin')) {
        const modelUrls = modelAdmin(home, wrongFormatModels, () => {});
        urls.set('admin', [...urls.get('admin'), ...modelUrls]);
    };

    return urls;

};

module.exports = {
    loadUrls
};