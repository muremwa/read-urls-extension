"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.urlsFinder = exports.urlProcessor = void 0;
const readerUtil_1 = require("./readerUtil");
const pathConvertes = new Map([
    ['slug', 'slug'],
    ['int', 'integer'],
    ['str', 'string'],
    ['uuid', 'UUID'],
    ['path', 'path']
]);
const NO_TYPE = 'NULL';
function typeProcessor(arg) {
    /*
    if the type of an argument is defined map it correctly
    'str:name' -> 🏭 -> {name: 'name', argType: 'type'}
    */
    let procesedType = {
        name: null,
        argType: null
    };
    const argList = arg.split(":");
    if (argList.length === 2) {
        const _argType = pathConvertes.has(argList[0]) ? pathConvertes.get(argList[0]) : NO_TYPE;
        // procesedType = { name: _argType!, argType: argList[1]}
        procesedType = { name: argList[1], argType: _argType };
    }
    else if (argList.length === 1) {
        // procesedType = {name: NO_TYPE, argType: argList[0]}
        procesedType = { name: argList[0], argType: NO_TYPE };
    }
    ;
    return procesedType;
}
;
function urlProcessor(urlString, appName) {
    /*
        Takes a string of path() and returns an object like ProcessedUrl
        extracts the view_name, url reverse name and all arguments from the url
         ->
        {
            reverseName: 'reverse:name',
            arguments: [
                {name: 'arg', argType: 'argType'}
            ],
            viewName: 'viewName',
            hasArgs: true | false?
        }

        if no name exists null is returned
        if _ROOT is in urlString then null is returned
    */
    if (urlString.includes('_ROOT')) {
        return null;
    }
    ;
    let name = null;
    let viewArg = null;
    let urlArgs = [];
    let possibleNames;
    let possibleViews;
    // reg ex for url name
    const namePattern = /\bname=[\'\"](.*?)[\'\"]/;
    // reg ex for a view that has a name
    const viewPattern = /[\'\"],[\s\t\n]*(.+?),/;
    // reg ex for url argument
    const argsPattern = /<.*?>/g;
    // extract names
    possibleNames = urlString.match(namePattern);
    if (possibleNames) {
        // the non global pattern returns an array in which the requested group is at index 1
        name = possibleNames[1].replace(' ', '');
    }
    else {
        // if no name exists then stop processing the url! :-(
        return null;
    }
    ;
    // extract view name
    possibleViews = urlString.match(viewPattern);
    if (possibleViews) {
        // the group we targeted is at index 1
        viewArg = possibleViews[1];
    }
    ;
    // extract arguments and process them
    let args = urlString.match(argsPattern);
    if (args && args.length > 0) {
        urlArgs = args.map((arg) => typeProcessor(arg.replace('<', '').replace('>', '')));
    }
    ;
    // create the view name
    const reverseName = appName.includes('READER_FILE_PATH_') ? name : `${appName}:${name}`;
    return {
        reverseName,
        arguments: urlArgs,
        viewName: viewArg,
        hasArgs: urlArgs.length > 0
    };
}
exports.urlProcessor = urlProcessor;
;
function urlsFinder(urlsFileText, filePath, braceError) {
    /*
        get a urls.py file text and extract 'app_name' and all urls
        {
            appName: [
                `url`,
                `url2`,
                `url3`
            ]
        }
    */
    let appName = `READER_FILE_PATH_${filePath}`;
    let urls = [];
    // reg ex for app name
    const appNamePattern = /^app_name.*?[\'\"](.*?)[\'\"]/m;
    // extract app name
    const possibleAppNames = urlsFileText.match(appNamePattern);
    if (possibleAppNames) {
        // target group is at index 1
        appName = possibleAppNames[1];
    }
    ;
    // extract urls patterns first? they are enclosed in a list
    const urlPatterns = readerUtil_1.bracketReader(urlsFileText, readerUtil_1.brackets.SQUARE_BRACKET, braceError);
    // extract url pattens
    for (let urlPatternList of urlPatterns) {
        urls.push(...readerUtil_1.bracketReader(urlPatternList, readerUtil_1.brackets.ROUND_BRACKET, braceError));
    }
    ;
    return { appName, urls };
}
exports.urlsFinder = urlsFinder;
;
