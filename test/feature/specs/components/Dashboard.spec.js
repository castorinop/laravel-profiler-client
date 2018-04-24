import Buefy from 'buefy';
import { createLocalVue, mount } from '@vue/test-utils';
import i18n from '@/i18n';
import { storeFactory } from '@/store';
import Dashboard from '@/components/Dashboard';
import { dummyTracker, dummyTrackerB } from './../../../fixtures/es6';

describe('Dashboard Component', () => {
    let wrapper;

    beforeEach(() => {
        let localVue = createLocalVue();
        localVue.use(Buefy);

        wrapper = mount(Dashboard, {
            localVue,
            store: storeFactory(),
            i18n,
        });
    });

    it('sees meta data of profiler after data are delivered', (done) => {
        expect(wrapper.find('p').text()).to.contain(wrapper.vm.$t('message.trackers-list-is-empty'));

        wrapper.vm.$store.commit('trackers/store', dummyTracker);

        wrapper.vm.$forceUpdate();
        wrapper.vm.$nextTick(() => {
            expect(wrapper.find('p').exists()).to.be.false;
            expect(wrapper.vm.$store.state.trackers.all).to.have.lengthOf(1);
            expect(wrapper.find('table tr:nth-child(1) td:nth-child(1)').text()).to.equal(dummyTracker.running);
            expect(wrapper.find('table tr:nth-child(1) td:nth-child(2)').text()).to.equal(dummyTracker.env);
            expect(wrapper.find('table tr:nth-child(1) td:nth-child(3)').text()).to.equal(dummyTracker.version);
            expect(wrapper.find('table tr:nth-child(1) td:nth-child(4)').text()).to.equal(dummyTracker.http);
            expect(wrapper.find('table tr:nth-child(1) td:nth-child(5)').text()).to.equal(dummyTracker.method);
            done();
        });
    });

    it('sees meta data of profiler in descending order', (done) => {
        wrapper.vm.$store.commit('trackers/store', dummyTracker);
        wrapper.vm.$store.commit('trackers/store', dummyTrackerB);

        wrapper.vm.$forceUpdate();
        wrapper.vm.$nextTick(() => {
            expect(wrapper.vm.$store.state.trackers.all).to.have.lengthOf(2);
            expect(wrapper.find('table tr:nth-child(1) td:nth-child(1)').text()).to.equal(dummyTrackerB.running);
            expect(wrapper.find('table tr:nth-child(1) td:nth-child(2)').text()).to.equal(dummyTrackerB.env);
            expect(wrapper.find('table tr:nth-child(1) td:nth-child(3)').text()).to.equal(dummyTrackerB.version);
            expect(wrapper.find('table tr:nth-child(2) td:nth-child(1)').text()).to.equal(dummyTracker.running);
            expect(wrapper.find('table tr:nth-child(2) td:nth-child(2)').text()).to.equal(dummyTracker.env);
            expect(wrapper.find('table tr:nth-child(2) td:nth-child(3)').text()).to.equal(dummyTracker.version);
            done();
        });
    });

    it('sees meta data of profiler paginated', (done) => {
        [
            Object.assign({}, dummyTracker, { env: 'localA' }),
            Object.assign({}, dummyTracker, { env: 'localB' }),
            Object.assign({}, dummyTracker, { env: 'localC' }),
        ].forEach(tracker => wrapper.vm.$store.commit('trackers/store', tracker));

        wrapper.setData({ perPage: 2 });

        wrapper.vm.$forceUpdate();
        wrapper.vm.$children.forEach(child => child.$children.forEach(subChild => subChild.$forceUpdate()));
        wrapper.vm.$nextTick(() => {
            expect(wrapper.find('table').text()).to.contain('localC');
            expect(wrapper.find('table').text()).to.contain('localB');
            expect(wrapper.find('table').text()).to.not.contain('localA');
            expect(wrapper.findAll('.pagination-link').length).to.equal(2);
            done();
        });
    });

    it('filters profilers by env', (done) => {
        [
            Object.assign({}, dummyTracker, { env: 'localA' }),
            Object.assign({}, dummyTracker, { env: 'localB' }),
            Object.assign({}, dummyTracker, { env: 'localC' }),
        ].forEach(tracker => wrapper.vm.$store.commit('trackers/store', tracker));

        wrapper.setData({ perPage: 2 });

        wrapper.vm.$forceUpdate();
        wrapper.vm.$nextTick(() => {
            expect(wrapper.find('table').text()).to.contain('localC');
            expect(wrapper.find('table').text()).to.contain('localB');
            expect(wrapper.find('table').text()).to.not.contain('localA');

            wrapper.vm.$store.commit('trackers/updateFilter', { env: [ 'localC', 'localA' ] });

            wrapper.vm.$forceUpdate();
            wrapper.vm.$nextTick(() => {
                expect(wrapper.find('table').text()).to.contain('localC');
                expect(wrapper.find('table').text()).to.not.contain('localB');
                expect(wrapper.find('table').text()).to.contain('localA');
                done();
            });
        });
    });

    it('filters profilers by version', (done) => {
        [
            Object.assign({}, dummyTracker, { version: '5.4.0' }),
            Object.assign({}, dummyTracker, { version: '5.5.0' }),
            Object.assign({}, dummyTracker, { version: '5.6.0' }),
        ].forEach(tracker => wrapper.vm.$store.commit('trackers/store', tracker));

        wrapper.setData({ perPage: 2 });

        wrapper.vm.$forceUpdate();
        wrapper.vm.$nextTick(() => {
            expect(wrapper.find('table').text()).to.contain('5.6.0');
            expect(wrapper.find('table').text()).to.contain('5.5.0');
            expect(wrapper.find('table').text()).to.not.contain('5.4.0');

            wrapper.vm.$store.commit('trackers/updateFilter', { version: [ '5.6.0', '5.4.0' ] });

            wrapper.vm.$forceUpdate();
            wrapper.vm.$nextTick(() => {
                expect(wrapper.find('table').text()).to.contain('5.6.0');
                expect(wrapper.find('table').text()).to.not.contain('5.5.0');
                expect(wrapper.find('table').text()).to.contain('5.4.0');
                done();
            });
        });
    });
});
