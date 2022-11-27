import * as _ from "lodash";

export function split(script: string): Array<any> {
    const words = script.split(' ');
    const sentences = cutToGroups(words);
    return [];
}

export function cutToGroups(words: Array<string>): Array<Array<string>> {
    return words.reduce((accumulator, currentValue) => {
        if (currentValue === ';') {
            return [...accumulator, []];
        }
        return [..._.dropRight(accumulator, 1), [..._.last(accumulator), currentValue]];
    }, [[]]);
}
