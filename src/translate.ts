import { AST, Select } from 'node-sql-parser/types';
import * as _ from 'lodash';
import { parseAst } from './utils/parseAst';
import { whereOperatorMap } from "./mapper";

const notSupportError = new Error('Not supported yet');

const directValueType = ['number', 'string', 'null'];

export function translate(script: string): Function {
    const ast: AST = parseAst(script)[0];
    console.assert(ast.type === 'select');
    const selectAct: Select = ast as Select;
    const whereOption = getWhereOption(selectAct.where);
    const columnOption = getColumnsOption(selectAct.columns);
    console.log('>>> where', whereOption);
    console.log('>>> attributes', columnOption);
    console.assert(selectAct.from.length == 1, 'not support more than one from tables');
    return (models) => {
        return models[selectAct.from[0].table].findAll({
            attributes: columnOption,
            where: whereOption,
        });
    };
}

function getTableName(columnReference: any, tables: Array<any>) :string {
    console.assert(columnReference.type === 'column_ref');
    if (!columnReference.table) {
        return tables[0].table;
    }
    const matchAliaTableName = _.first(tables
        .filter(table => table.as === columnReference.table)
        .map(table => table.table)
    );
    const matchTableName = _.first(tables
        .filter(table => table.table === columnReference.table)
        .map(table => table.table)
    );
    console.assert(matchAliaTableName || matchTableName, 'could not match any table');
    return matchAliaTableName ? matchAliaTableName : matchTableName;
}

function getWhereOption(whereAst: any) {
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

function getColumnsOption(columnsAst: any) {
    if (Array.isArray(columnsAst)) {
        return columnsAst
            .map(column => {
                console.assert(column.expr, 'expr not defined in column');
                console.assert(column.expr.type !== 'column_ref', 'column type not supported');
                return column.as ? [column.expr.column, column.as] : column.expr.column;
            })
    }
    if (columnsAst === '*') {
        return undefined;
    }
    throw notSupportError;
}
