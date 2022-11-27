import { cutToGroups } from '../../src/utils/split';

describe('cutToGroups', () => {
    it('should cut by ";"', () => {
        // given
        const words = ['select', '*', 'from', 'table_a', ';', 'select', '*', 'from', 'table_b'];
        // when
        const groupedWords = cutToGroups(words);
        // then
        expect(groupedWords).toStrictEqual([
            ['select', '*', 'from', 'table_a'],
            ['select', '*', 'from', 'table_b'],
        ]);
    });
});
