const { Parser } = require('node-sql-parser');
import { AST } from 'node-sql-parser/types';

const parser = new Parser();

export function parseAst(script :string) :Array<AST> {
    const asts = parser.astify(script, { database: 'transactsql' });
    return Array.isArray(asts) ? asts : [asts];
}
