import { parseAst, getTableList } from '../../src/utils/parseAst';

describe('parse AST', () => {
    it('parse one sentences', () => {
        const script = 'select * from customer where id = 1;';
        const asts = parseAst(script);
        expect(asts[0]).toMatchObject({
            type: 'select',
            columns: '*',
            from: [{
                table: 'customer',
            }],
            where: {
                type: 'binary_expr',
                left: {
                    type: 'column_ref',
                    column: 'id',
                },
                operator: '=',
                right: {
                    type: 'number',
                    value: 1,
                },
            },
        });
    });

    it('parse multiple sentences', () => {
        const script = 'select * from customer where id > 100; select count(*) from customer where phone is not null';
        const asts = parseAst(script);
        expect(asts[0]).toMatchObject({
            type: 'select',
            columns: '*',
            from: [{
                table: 'customer',
            }],
            where: {
                type: 'binary_expr',
                left: {
                    type: 'column_ref',
                    column: 'id',
                },
                operator: '>',
                right: {
                    type: 'number',
                    value: 100,
                },
            },
        });
        expect(asts[1]).toMatchObject({
            type: 'select',
            columns: [{
                expr: {
                    type: 'aggr_func',
                    name: 'COUNT',
                    args: {
                        expr: {
                            type: 'star',
                            value: '*'
                        },
                    },
                },
            }],
            from: [{
                table: 'customer',
            }],
            where: {
                type: 'binary_expr',
                left: {
                    type: 'column_ref',
                    column: 'phone',
                },
                operator: 'IS NOT',
                right: {
                    type: 'null',
                    value: null,
                },
            },
        });
    });

    it('parse nested sentences', () => {
        const script = 'select * from customer where id in (select customer_id from orders where total_cost > 1000);';
        const asts = parseAst(script);
        expect(asts[0]).toStrictEqual({
            "with": null,
            "type": "select",
            "options": null,
            "distinct": null,
            "columns": "*",
            "from": [
                {
                    "db": null,
                    "table": "customer",
                    "as": null,
                    "table_hint": null
                }
            ],
            "where": {
                "type": "binary_expr",
                "operator": "IN",
                "left": {
                    "type": "column_ref",
                    "table": null,
                    "column": "id"
                },
                "right": {
                    "type": "expr_list",
                    "value": [
                        {
                            "tableList": [
                                "select::null::orders"
                            ],
                            "columnList": [
                                "select::null::(.*)",
                                "select::null::id",
                                "select::null::customer_id",
                                "select::null::total_cost"
                            ],
                            "ast": {
                                "with": null,
                                "type": "select",
                                "options": null,
                                "distinct": null,
                                "columns": [
                                    {
                                        "expr": {
                                            "type": "column_ref",
                                            "table": null,
                                            "column": "customer_id"
                                        },
                                        "as": null
                                    }
                                ],
                                "from": [
                                    {
                                        "db": null,
                                        "table": "orders",
                                        "as": null,
                                        "table_hint": null
                                    }
                                ],
                                "where": {
                                    "type": "binary_expr",
                                    "operator": ">",
                                    "left": {
                                        "type": "column_ref",
                                        "table": null,
                                        "column": "total_cost"
                                    },
                                    "right": {
                                        "type": "number",
                                        "value": 1000
                                    }
                                },
                                "groupby": null,
                                "having": null,
                                "top": null,
                                "orderby": null,
                                "limit": null
                            }
                        }
                    ]
                }
            },
            "groupby": null,
            "having": null,
            "top": null,
            "orderby": null,
            "limit": null
        });
    });

    it('parse join sentences', () => {
        const script = `select c.first_name, c.last_name
                        from customer c
                        left join orders o
                            on o.customer_id = c.id 
                        where o.total_price > 1000;`;
        const asts = parseAst(script);
        expect(asts[0]).toStrictEqual({
            "with": null,
            "type": "select",
            "options": null,
            "distinct": null,
            "columns": [
                {
                    "expr": {
                        "type": "column_ref",
                        "table": "c",
                        "column": "first_name"
                    },
                    "as": null
                },
                {
                    "expr": {
                        "type": "column_ref",
                        "table": "c",
                        "column": "last_name"
                    },
                    "as": null
                }
            ],
            "from": [
                {
                    "db": null,
                    "table": "customer",
                    "as": "c",
                    "table_hint": null
                },
                {
                    "db": null,
                    "table": "orders",
                    "as": "o",
                    "table_hint": null,
                    "join": "LEFT JOIN",
                    "on": {
                        "type": "binary_expr",
                        "operator": "=",
                        "left": {
                            "type": "column_ref",
                            "table": "o",
                            "column": "customer_id"
                        },
                        "right": {
                            "type": "column_ref",
                            "table": "c",
                            "column": "id"
                        }
                    }
                }
            ],
            "where": {
                "type": "binary_expr",
                "operator": ">",
                "left": {
                    "type": "column_ref",
                    "table": "o",
                    "column": "total_price"
                },
                "right": {
                    "type": "number",
                    "value": 1000
                }
            },
            "groupby": null,
            "having": null,
            "top": null,
            "orderby": null,
            "limit": null
        });
    });
});

describe('get columnList', () => {
    it('should return all tables', () => {
        const script = 'select * from customer where id in (select customer_id from orders where total_cost > 1000);';
        const tables = getTableList(script);
        expect(tables).toContain('orders');
        expect(tables).toContain('customer');
    });
});
