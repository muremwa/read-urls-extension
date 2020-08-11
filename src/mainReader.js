"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mainReader = void 0;
const path_1 = require("path");
const fs_1 = require("fs");
const walk_1 = require("walk");
const urlsReader_1 = require("./urlsReader");
function realProjectWalk(realProjectPath, filtersOptions) {
    /*
        get the project root of a django project and find all urls.py files
        The arg options contains filters for WalkOptions
    */
    let urlPys = [];
    // function to check if a file is urls.py and add it to urlPys
    const pyChecker = (root, fileStats, next) => {
        const urlsPyFiles = fileStats.filter((fileStat) => fileStat.name === 'urls.py').map((fileStat) => path_1.join(root, fileStat.name));
        urlPys = urlPys.concat(urlsPyFiles);
        next();
    };
    // errors?
    const errorManager = (_, __, next) => next();
    // listeners to pass to walkSync
    const listeners = {
        files: pyChecker,
        errors: errorManager
    };
    // all options combined
    const optionsWithFilters = Object.assign(filtersOptions, { listeners });
    // let's walk!
    walk_1.walkSync(realProjectPath, optionsWithFilters);
    return urlPys;
}
;
function walkProject(projectSourcePath, notDjangoProjectHandler) {
    /*
        find the folder with 'manage.py' (which shall be treated as the root dir) and pass it to realProjectWalk
        walk the dir and record all files that are urls.py
        return a list of them
    */
    const filters = [
        '.idea', '.vscode', '.git', '__pycache__', 'templates', 'tests', 'media', 'static', 'migrations', 'node_modules', 'venv'
    ];
    let urls = [];
    // function to look for manage.py
    const manageDotPyFinder = (root, fileStats, next) => {
        const manageDotPy = fileStats.find((fileStat) => fileStat.name === 'manage.py');
        // if manage.py is not found (is undefined) go to next
        if (manageDotPy === undefined) {
            next();
        }
        else {
            notProject = false;
            urls = realProjectWalk(path_1.join(root), { filters });
        }
        ;
    };
    // errors?
    const errorManager = (_, __, next) => next();
    // what happens when you walk the dir and no manage.py file is found? raise error? let a callback handle it?
    let notProject = true;
    const end = () => {
        notDjangoProjectHandler(notProject);
    };
    // find manage.py
    const options = {
        filters,
        listeners: {
            files: manageDotPyFinder,
            errors: errorManager,
            end
        }
    };
    walk_1.walkSync(projectSourcePath, options);
    return urls;
}
;
function mainReader(path, notDjangoProjectHandler) {
    /*
        path is a project path
        read all urls and return a Map with the following items
        Map([
            ['appName', [
                {
                    reverseName: 'string',
                    arguments: [
                        {
                            name: 'string',
                            type: 'string'
                        },...
                    ],
                    viewName: 'string',
                    hasArgs: boolean
                },...
            ]...]
        ])
    */
    const readUrls = new Map();
    const notPCallBack = notDjangoProjectHandler ? notDjangoProjectHandler : (notProject) => {
        if (notProject) {
            throw new Error('This is not a django project');
        }
        ;
    };
    // get urls.py
    const urlConfFiles = walkProject(path, notPCallBack);
    // loop through all url config files and extract all urls and process them
    for (const urlDotPy of urlConfFiles) {
        const urlDotPyText = fs_1.readFileSync(urlDotPy, { encoding: 'utf-8', flag: 'r' });
        const dirtyUrls = urlsReader_1.urlsFinder(urlDotPyText, urlDotPy);
        if (dirtyUrls.urls.length > 0) {
            const processedUrls = [...dirtyUrls.urls].map((url) => urlsReader_1.urlProcessor(url, dirtyUrls.appName)).filter((url) => url !== null);
            if (processedUrls.length > 0) {
                readUrls.set(dirtyUrls.appName, processedUrls);
            }
            ;
        }
        ;
    }
    ;
    return readUrls;
}
exports.mainReader = mainReader;
;
