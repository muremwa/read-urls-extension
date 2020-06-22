const vscode = require('vscode');


/** 
 * @param {string} stringToRead
 * @param {string} braceToRead
 * @returns {string[]}
*/
function bracketReader (stringToRead, braceToRead, filePath) {
    /* 
    get to know where a bracket starts and is successfully closed
    */
    if ([stringToRead, braceToRead, filePath].some(arg => arg === undefined)) {
        throw TypeError('one of the arguments is undefined');
    }

    if (typeof stringToRead !== 'string' || typeof braceToRead !== 'string' || typeof filePath !== 'string') {
        throw TypeError('String to read is not a string');
    }

    const braces = {'{': '}', '[': ']', '(': ')'};
    const partnerBrace = braces[braceToRead];

    if (partnerBrace === undefined) {
        throw TypeError(`${braceToRead} is not supported`);
    }

    const bracePositions = [];
    const stringToReadAsList = [...stringToRead];
    let position = 0;

    const getItemIdex = function (item, index) {
        if (index >= position) {
            if (item === braceToRead) {
                return true;
            }
        }
    };

    let start = stringToReadAsList.findIndex((item, index) => getItemIdex(item, index));

    while (start > -1) {
        let endPosition = null;
        let openingBraceCount = 1;


        // loop through the whole string and find the closing brace
        for (let index in stringToReadAsList) {
            let strand = stringToReadAsList[index];

            // a brace can only be closed if we are beyond index 'start'
            if (index > start) {
                if (strand === braceToRead) {
                    // if it's anothe opening brace increment openingBraceCount
                    openingBraceCount++;
                } else if (strand === partnerBrace) {
                    // if its a closing brace then decrement openingBraceCount
                    openingBraceCount--;
                };
            };
            // when opening_brace_count is 0, it means that an opened bracket is
            // now closed and there's no need to proceed with the loop
            // create an new position to find a new opening brace
            if (openingBraceCount == 0) {
                endPosition = +index;
                position = +index;
                break;
            };
        };

        // if it does not close raise a value error
        if (openingBraceCount) {
            vscode.window.showErrorMessage(`Syntax error: Missing '${partnerBrace}' in ${filePath}`);
            break;
        };

        // add the brace to brace positions [start, end_position] => [[start, end_position]]
        bracePositions.push([start, endPosition]);

        // check if there's a new brace?
        start = stringToReadAsList.findIndex((item, index) => getItemIdex(item, index));
    };

    // return a list of substrings of string with an open and corresponding closing brace
    return bracePositions.map(
        bracePos => stringToRead.substring(bracePos[0], bracePos[1] + 1).replace('\n', '')
    );
};


module.exports = {
    bracketReader
};
