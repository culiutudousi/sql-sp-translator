import { Sequelize, DataTypes } from 'sequelize';
import { translate } from '../src/translate';

describe('translate', () => {
    let sequelize, User;

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
                type: DataTypes.STRING
            }
        }, {
            tableName: 'user'
        });

        await sequelize.sync({ force: true });
    });

    afterEach(async () => {
        await sequelize.drop();
    });

    describe('select', () => {

        beforeAll(async () => {
            await User.create({ firstName: 'Jane', lastName: 'Gate' });
            await User.create({ firstName: 'Bob' });
        });

        test('translate select where equal', async () => {
            const func: Function = translate('select * from user where id = 1;');
            const result :Array<any> = await func({ user: User });
            expect(result).toMatchObject([{ id: 1, firstName: 'Jane', lastName: 'Gate' }]);
        });
    });
});
