/* 
    Read *.models.json to load ModelAdmin URL configurations
*/
const fs = require('fs');
const path = require('path');


/**
*@param {string} home
*@param {() => void} wrongFomartCallback
*@param {() => void} noModelsCallback
*@returns {Map<string, string[]>}
**/
function _getModels (home, wrongFomartCallback, noModelsCallback) {
    const models = new Map();

    try {
        const _models = fs.readFileSync(path.join(home, ".vscode", "urlConfigs", "models.json"), { encoding: 'utf-8', flag: 'r' });
        try {
            const __models = JSON.parse(_models);

            if (typeof __models === 'object' && __models !== null) {
                for (const app of Object.keys(__models)) {
                    models.set(app, __models[app]);
                };
            };

        } catch (error) {
            wrongFomartCallback();
        }
    } catch (error) {
        noModelsCallback();
    }

    return models;
};


/**
*@param {string} model
*@param {string} appName
*@param {string} appLabel
*@param {string} extraLabel
*@param {boolean} objectId
*@returns {{
    reverseName: string,
    arguments: [],
    viewName: string,
    hasArgs: boolean
}}
*/
function createSingleModelUrls (model, appName, appLabel, extraLabel, objectId) {
    return {
        "reverseName": `${appName}:${appLabel}_${model}_${extraLabel}`,
        "arguments": objectId? [
            {
                "name": "object_id",
                "argType": "integer"
            }
        ]: [],
        "viewName": "",
        "hasArgs": objectId? true: false
    }
};



/**
*@param {string} home
*@param {Map<string, string[]>} detectedModels
*@param {() => void} wrongFomartCallback
*@param {() => void} noModelsCallback
*@returns {{
    reverseName: string,
    arguments: [],
    viewName: string,
    hasArgs: boolean
}[]}
**/
function loadModelAdminConfigs (home, detectedModels, wrongFomartCallback, noModelsCallback) {
    let patterns = [];
    const extraModels = _getModels(home, wrongFomartCallback, noModelsCallback);
    const models = detectedModels;
    [...extraModels.keys()].forEach((key) => !models.has(key)? models.set(key, extraModels.get(key)): void 0);

    const modelAdminUrls = [
        ['changelist', false],
        ['add', false],
        ['history', true],
        ['delete', true],
        ['change', true]
    ];
    
    for (const model of models.keys()) {
        const appModels = models.get(model);

        if (Array.isArray(appModels)) {
            patterns = [...patterns, ...appModels.map((appModel) => {
                appModel = appModel.toLowerCase();
                return modelAdminUrls.map((url) => createSingleModelUrls(appModel, 'admin', model, url[0], url[1]))
            }).flat()];
        };
    };

    return patterns;
};

module.exports = {
    modelAdmin: loadModelAdminConfigs
}