import env from '@/env';
import { storeFactory } from '@/store';

describe('Store', () => {
    it('has strict mode enabled on env different then production', () => {
        expect(env.nodeEnv).to.equal('testing');
        expect(storeFactory().strict).to.be.true;
    });

    it('has strict mode disabled on production', () => {
        sinon.stub(env, 'nodeEnv').get(function() {
            return 'production';
        });

        expect(env.nodeEnv).to.equal('production');
        expect(storeFactory().strict).to.be.false;
    });
});
