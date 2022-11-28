const { Parser } = require('node-sql-parser');
import * as _ from "lodash";
import { AST } from 'node-sql-parser/types';

const parser = new Parser();

export function parseAst(script :string) :Array<AST> {
    const asts = parser.astify(script, { database: 'transactsql' });
    return Array.isArray(asts) ? asts : [asts];
}

export function getTableList(script :string) :Array<string> {
    const tables = parser.tableList(script, { database: 'transactsql' });
    return tables
        .map((table) => _.last(table.split('::')));
}
