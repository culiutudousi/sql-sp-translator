import { Op } from "sequelize";

// refs: https://sequelize.org/docs/v6/core-concepts/model-querying-basics/
const whereOperatorMap = [
    {
        sql: '=',
        node: Op.eq,
    },
    {
        sql: '!=',
        node: Op.ne,
    },
    {
        sql: '<>',
        node: Op.ne,
    },
    {
        sql: 'IS',
        node: Op.is,
    },
    {
        sql: 'IS NOT',
        node: Op.not,
    },
    {
        sql: '>',
        node: Op.gt,
    },
    {
        sql: '>=',
        node: Op.gte,
    },
    {
        sql: '<',
        node: Op.lt,
    },
    {
        sql: '<=',
        node: Op.lte,
    },
    {
        sql: 'BETWEEN',
        node: Op.between,
    },
    {
        sql: 'NOT BETWEEN',
        node: Op.notBetween,
    },
    {
        sql: 'LIKE',
        node: Op.like,
    },
    {
        sql: 'NOT LIKE',
        node: Op.notLike,
    },
    {
        sql: 'IN',
        node: Op.in,
    },
    {
        sql: 'NOT IN',
        node: Op.notIn,
    },
];

//todo: spike Op.col
export { whereOperatorMap };
