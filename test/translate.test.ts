import { Sequelize, DataTypes } from 'sequelize';
import { translate } from '../src/translate';

describe('translate', () => {
    let sequelize,
        User, Blog;

    beforeAll(async () => {
        sequelize = new Sequelize('sqlite::memory:');

        User = sequelize.define('User', {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            firstName: {
                type: DataTypes.STRING,
                allowNull: false
            },
            lastName: {
                type: DataTypes.STRING,
            },
            star: {
                type: DataTypes.INTEGER,
                allowNull: false,
                default: 0,
            },
        }, {
            tableName: 'user'
        });

        Blog = sequelize.define('Blog', {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            title: {
                type: DataTypes.STRING,
            },
            star: {
                type: DataTypes.INTEGER,
                allowNull: false,
                default: 0,
            },
        }, {
            tableName: 'blog'
        });

        User.hasMany(Blog, { foreignKey: 'userId' });
        Blog.belongsTo(User, { foreignKey: 'userId' });

        await sequelize.sync({ force: true });
    });

    describe('select', () => {

        beforeAll(async () => {
            await sequelize.sync({ force: true });
            const { dataValues: user1 } = await User.create({ firstName: 'Ben', lastName: 'Whitehead', star: 7 });
            const { dataValues: user2 } = await User.create({ firstName: 'Albert', lastName: 'Digby', star: 10 });
            const { dataValues: user3 } = await User.create({ firstName: 'Tobias', lastName: 'Halsey', star: 0 });
            const { dataValues: user4 } = await User.create({ firstName: 'Luke', lastName: 'Langley', star: 29 });
            const { dataValues: user5 } = await User.create({ firstName: 'Francis', lastName: 'Wheeler', star: 42 });
            const { dataValues: user6 } = await User.create({ firstName: 'Morgan', lastName: 'Blackwood', star: 10 });
            await Blog.create({ title: 'MYSQL 101', star: 4, userId: user1.id });
            await Blog.create({ title: 'MS SQL 101', star: 20, userId: user2.id });
            await Blog.create({ title: 'C++ 101', star: 1, userId: user3.id });
            await Blog.create({ title: 'NodeJs 101', star: 76, userId: user4.id });
            await Blog.create({ title: 'TypeScript 101', star: 122, userId: user5.id });
            await Blog.create({ title: 'Python 101', star: 98, userId: user5.id });
            await Blog.create({ title: 'Golang 101', star: 35, userId: user6.id });
        });

        test('translate select where =', async () => {
            const func: Function = translate('select * from user where id = 1;');
            const result :Array<any> = await func({ user: User });
            expect(result).toMatchObject([{ id: 1, firstName: 'Ben', lastName: 'Whitehead' }]);
        });

        test('translate select where <', async () => {
            const func: Function = translate('select * from user where id < 2;');
            const result :Array<any> = await func({ user: User });
            expect(result).toMatchObject([{ id: 1, firstName: 'Ben', lastName: 'Whitehead' }]);
        });

        test('translate select where like contain (%an%)', async () => {
            const func: Function = translate(`select * from user where firstName like '%an%';`);
            const result :Array<any> = await func({ user: User });
            expect(result.length).toBe(2);
            expect(result).toMatchObject([{ firstName: 'Francis'}, { firstName: 'Morgan' }]);
        });

        test('translate select where like end with (%an)', async () => {
            const func: Function = translate(`select * from user where firstName like '%an';`);
            const result :Array<any> = await func({ user: User });
            expect(result.length).toBe(1);
            expect(result).toMatchObject([{ firstName: 'Morgan' }]);
        });

        test('translate select where in', async () => {
            const func: Function = translate(`select * from user where id in (2, 4);`);
            const result :Array<any> = await func({ user: User });
            expect(result.length).toBe(2);
            expect(result).toMatchObject([{ id: 2 }, { id: 4 }]);
        });

        test('translate select where not between', async () => {
            const func: Function = translate(`select * from user where id between 2 and 4;`);
            const result :Array<any> = await func({ user: User });
            expect(result.length).toBe(3);
            expect(result).toMatchObject([{ id: 2 }, { id: 3 }, { id: 4 }]);
        });
    });
});
