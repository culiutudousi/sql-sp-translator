import { clean } from '../../src/utils/clean';

describe('clean', () => {
    it('should clean script', () => {
        // given
        const script = ` SELECT id, username \nfrom "user"\twhere  id  in (select 'user_id' from good_user);`;
        // when
        const cleanScript = clean(script);
        // then
        expect(cleanScript).toBe(
            "select id , username from user where id in ( select user_id from good_user ) ;"
        );
    });
});
