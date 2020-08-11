"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bracketReader = exports.brackets = void 0;
exports.brackets = {
    ROUND_BRACKET: '(',
    SQUARE_BRACKET: '[',
    CURLY_BRACKET: '{',
    ANGLE_BRACKET: '<'
};
const patnerBraces = new Map([
    [exports.brackets.ROUND_BRACKET, ')'],
    [exports.brackets.SQUARE_BRACKET, ']'],
    [exports.brackets.CURLY_BRACKET, '}'],
    [exports.brackets.ANGLE_BRACKET, '>']
]);
function bracketReader(stringToRead, braceToRead) {
    /*
    get to know where a bracket starts and is successfully closed
    */
    const isBraceAllowed = (_brace) => patnerBraces.has(_brace);
    if (!isBraceAllowed(braceToRead)) {
        throw TypeError(`'${braceToRead}' is not supported. Import the constant brackets and use 'brackets.${Object.keys(exports.brackets).join('\', \'brackets.')}'`);
    }
    ;
    const partnerBrace = patnerBraces.get(braceToRead);
    let bracePositions = [];
    const stringToReadAsList = [...stringToRead];
    let position = 0;
    const getItemIndex = function (item, index) {
        let result = false;
        if (index >= position) {
            if (item === braceToRead) {
                result = true;
            }
        }
        return result;
    };
    let start = stringToReadAsList.findIndex((item, index) => getItemIndex(item, index));
    while (start > -1) {
        let endPosition = Infinity;
        let openingBraceCount = 1;
        // loop through the whole string and find the closing brace
        for (let index in stringToReadAsList) {
            const intIndex = parseInt(index);
            let strand = stringToReadAsList[intIndex];
            // a brace can only be closed if we are beyond index 'start'
            if (intIndex > start) {
                if (strand === braceToRead) {
                    // if it's anothe opening brace increment openingBraceCount
                    openingBraceCount++;
                }
                else if (strand === partnerBrace) {
                    // if its a closing brace then decrement openingBraceCount
                    openingBraceCount--;
                }
                ;
            }
            ;
            // when opening_brace_count is 0, it means that an opened bracket is
            // now closed and there's no need to proceed with the loop
            // create an new position to find a new opening brace
            if (openingBraceCount == 0) {
                endPosition = intIndex;
                position = intIndex;
                break;
            }
            ;
        }
        ;
        // if it does not close raise a value error
        if (openingBraceCount) {
            throw new Error(`No closing brace found!`);
        }
        ;
        // add the brace to brace positions [start, end_position] => [[start, end_position]]
        bracePositions.push([start, endPosition]);
        // check if there's a new brace?
        start = stringToReadAsList.findIndex((item, index) => getItemIndex(item, index));
    }
    ;
    // return a list of substrings of string with an open and corresponding closing brace
    return bracePositions.map(bracePos => stringToRead.substring(bracePos[0], bracePos[1] + 1).replace('\n', ''));
}
exports.bracketReader = bracketReader;
;
