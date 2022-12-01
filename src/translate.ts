import { AST, Select } from 'node-sql-parser/types';
import * as _ from 'lodash';
import { parseAst, getTableList } from './utils/parseAst';
import { whereOperatorMap } from "./mapper";

const notSupportError = new Error('Not supported yet');

const directValueType = ['number', 'string', 'null'];

export function translate(script: string): Function {
    const ast: AST = parseAst(script)[0];
    console.assert(ast.type === 'select');
    const selectAct: Select = ast as Select;
    const tables = getTableList(script);
    const whereOption = getWhereOption(selectAct.where);
    console.log('>>> whereOption', whereOption);
    return (models) => {
        return models[selectAct.from[0].table].findAll({
            where: whereOption,
        });
    };
}

export function getWhereOption(whereAst: any) {
    if (!whereAst) { return {}; }
    if (whereAst.type === 'binary_expr') {
        console.assert(whereAst.left && whereAst.right && whereAst.operator);
        if (whereAst.left.type === 'column_ref') {
            console.assert(whereAst.right.type !== 'column_ref');
            const operator = _.head(whereOperatorMap.filter((op) => op.sql === whereAst.operator))?.node;
            console.assert(operator !== undefined);
            console.assert([...directValueType, 'expr_list'].includes(whereAst.right.type));
            let operatorRight;
            if (directValueType.includes(whereAst.right.type)) {
                operatorRight = whereAst.right.value;
            } else if (whereAst.right.type === 'expr_list') {
                operatorRight = whereAst.right.value.map((value) => value.value);
            }
            return {
                [whereAst.left.column]: {
                    [operator]: operatorRight,
                },
            };
        }
    }
    throw notSupportError;
}
