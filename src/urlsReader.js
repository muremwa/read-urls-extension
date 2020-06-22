/* 
Takes a urls.py and reads all urls
shall do the exact same thing as ../python/urls_reader.py
*/

const readerUtil = require('./readerUtil');


/**
 * @param {string} arg
 * @returns {any[]}
*/
function typeProcessor(arg) {
    /* 
    if the type of an argument is defined map it correctly
    */
    if (!arg) {
        return []
    };

    const types = {slug: 'slug', int: 'integer', str: 'string'};
    let argList = arg.split(":");

    if (argList.length == 2) {
        let argType = types[argList[0]];

        // if argType is undefined the use null
        argType = argType === undefined? null: argType;

        // add the type to the front of the list
        argList[0] = argType;

    } else {
        // add null to the front of the array
        argList.splice(0, 0, null);
    }

    return argList.reverse();

};



/** 
 * @param {string} string
 * @param {string} appName
 * @returns {any[]} [reverse_name, [[argument_1, type],...[argument_n, type]], view_name]
*/
function urlProcessor(string, appName) {
    /* 
    Takes a string of path() and returns
    a list like so -> ['appName:url_name', (arguments,), 'view_name']
    */
    if ([string, appName].some(arg => arg === undefined)) {
        throw TypeError("all arguments not satisfied");
    };

    if ((typeof string !== 'string') || (typeof appName !== 'string')) {
        throw TypeError("wrong argument type: all arguments should be strings");
    };

    if (string.includes('_ROOT')) {
        return [];
    };

    let name = null;
    let view = null;
    let possibleNames;
    let possibleViews;
    // reg ex for url name
    const namePattern = /\bname=[\'\"](.*?)[\'\"]/;
    // reg ex for a view that has a name
    const viewPattern = /[\'\"],[\s\t\n]*(.+?),/;
    // reg ex for a view that has no name
    const viewPatternNoName = /[\'\"],[\s\t\n]*(.+?)\)$/;
    // reg ex for url argument
    const argsPattern = /<.*?>/g;

    // extract names
    possibleNames = string.match(namePattern);
    if (possibleNames) {
        // the non global pattern returns an array in which the requested 
        // group is at index 1
        name = possibleNames[1].replace(' ', '');
    };

    // extract view
    // if no name exists then choose the NoName pattern
    possibleViews = string.match(
        name === null? viewPatternNoName: viewPattern
    );
    if (possibleViews) {
        view = possibleViews[1];
    }


    // extract arguments and process them
    let args = string.match(argsPattern);
    args = args? args.map(
        arg => typeProcessor(arg.replace('>', '').replace('<', ''))
    ): [];
    

    // create the view name
    let viewName = null;
    viewName = function () {
        if (name) {
            if (appName.includes("READER_FILE_PATH_")) {
                return `${name}`;
            } else {
                return `${appName}:${name}`;
            }
        } else {
            return null;
        }
    }();

    return [viewName, args, view];
};



/** 
 * @param {string} urlsFileText
 * @param {string} filePath
 * @returns {object} {'app_name': [list of all urls]}
*/
function urlsFinder (urlsFileText, filePath) {
    /* 
    get a urls.py file text and extract 'app_name' and all urls
    */
    if ([urlsFileText, filePath].some(arg => arg === undefined || typeof arg !== 'string')) {
        throw TypeError('Argument missing or of the wrong type');
    };


    let appName = `READER_FILE_PATH_${filePath}`;
    let urls = [];

    // reg ex for app name
    const appNamePattern = /^app_name.*?[\'\"](.*?)[\'\"]/m;
    
    // extract app name
    let possibleAppNames = urlsFileText.match(appNamePattern);
    if (possibleAppNames) {
        appName = possibleAppNames[1];
    };


    // extract urls patterns first? they are enclosed in a list
    const urlPatterns = readerUtil.bracketReader(urlsFileText, '[', filePath);

    // extract url pattens
    for (let urlPatternList of urlPatterns) {
        urls = urls.concat(
            readerUtil.bracketReader(urlPatternList, '(', filePath)
        );
    };

    const solution = {};
    solution[`${appName}`] = urls;

    return solution;
};


module.exports = {
    urlProcessor,
    urlsFinder
};
