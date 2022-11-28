import { parseAst, getTableList } from './utils/parseAst';
import { AST, Select } from 'node-sql-parser/types';

const notSupportError = new Error('Not supported yet');

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

function mapLeftAndRight(left: object, right: object): Array<any> {
    return [
        {
            side: 'left',
            ...left,
        },
        {
            side: 'right',
            ...right,
        },
    ];
}

export function getWhereOption(whereAst: any) {
    if (!whereAst) { return {}; }
    if (whereAst.type === 'binary_expr') {
        if (whereAst.operator === '=') {
            const sides = mapLeftAndRight(whereAst.left, whereAst.right);
            const columnSides = sides.filter((side) => side.type === 'column_ref');
            if (columnSides.length === 1) {
                const columnSide = columnSides[0];
                const anotherSide = sides.filter((side) => side.type !== 'column_ref')[0];
                return {
                    [columnSide.column]: anotherSide.value,
                };
            }
        }
    }
    throw notSupportError;
}
