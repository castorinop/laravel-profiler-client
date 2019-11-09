import Tracker from '@/models/tracker';
import AppDashboard from '@/components/AppDashboard';
import { trackerFactory, mountWithoutProps } from './../test-helper';

describe('AppDashboard Component', () => {
    let wrapper;

    beforeEach(() => {
        wrapper = mountWithoutProps(AppDashboard);
    });

    it('sees meta data of profiler after data are delivered', async () => {
        let wrapperTable = wrapper.find({ name: 'dashboard-table' });
        expect(wrapperTable.find('p').text()).to.contain(wrapper.vm.$t('dashboard.trackers-list-is-empty'));

        let tracker = new Tracker(trackerFactory.create());
        wrapper.vm.$store.commit('trackers/store', tracker);

        wrapperTable.vm.$forceUpdate();
        await wrapperTable.vm.$nextTick();
        expect(wrapperTable.find('p').exists()).to.be.false;
        expect(wrapperTable.vm.$store.state.trackers.all).to.have.lengthOf(1);
        expect(wrapperTable.find('table tr:nth-child(1) td:nth-child(2)').text()).to.contain(tracker.executionAt);
        expect(wrapperTable.find('table tr:nth-child(1) td:nth-child(3)').text()).to.contain(tracker.env);
        expect(wrapperTable.find('table tr:nth-child(1) td:nth-child(4)').text()).to.contain(tracker.running);
        expect(wrapperTable.find('table tr:nth-child(1) td:nth-child(5)').text()).to.contain(tracker.type);
        expect(wrapperTable.find('table tr:nth-child(1) td:nth-child(6)').text()).to.contain(tracker.method);
        expect(wrapperTable.find('table tr:nth-child(1) td:nth-child(6)').text()).to.contain(tracker.status);
        expect(wrapperTable.find('table tr:nth-child(1) td:nth-child(6)').text()).to.contain(tracker.path);
        expect(wrapperTable.find('table tr:nth-child(1) td:nth-child(7)').text()).to.contain(tracker.performance.laravelTimeForHuman);
        expect(wrapperTable.find('table tr:nth-child(1) td:nth-child(8)').text()).to.contain(tracker.performance.memoryPeakForHuman);
        expect(wrapperTable.find('table tr:nth-child(1) td:nth-child(15)').text()).to.contain(tracker.laravelVersion);
    });

    it('has memory usage hidden when running tests', async () => {
        let wrapperTable = wrapper.find({ name: 'dashboard-table' });
        let trackerA = new Tracker(trackerFactory.create('meta', { env: 'local' }));
        let trackerB = new Tracker(trackerFactory.create('meta', { env: 'testing' }));
        wrapper.vm.$store.commit('trackers/store', trackerA);
        wrapper.vm.$store.commit('trackers/store', trackerB);

        wrapperTable.vm.$forceUpdate();
        await wrapperTable.vm.$nextTick();

        let memoryTdA = wrapperTable.find('table tr:nth-child(2) .tracker-summary.memory');
        let memoryTdB = wrapperTable.find('table tr:nth-child(1) .tracker-summary.memory');
        expect(memoryTdA.text()).to.contain(trackerA.performance.memoryPeakForHuman);
        expect(memoryTdB.text()).to.not.contain(trackerA.performance.memoryPeakForHuman);
        expect(memoryTdB.text()).to.contain('------');
    });

    it('sees number of views after data are delivered', async () => {
        let wrapperTable = wrapper.find({ name: 'dashboard-table' });
        let tracker = new Tracker(trackerFactory.create('data', { views: [
            { name: 'view-a', path: 'path-to-a', data: {} },
            { name: 'view-b', path: 'path-to-b', data: {} },
            { name: 'view-c', path: 'path-to-c', data: {} },
            { name: 'view-d', path: 'path-to-d', data: {} },
            { name: 'view-e', path: 'path-to-e', data: {} },
        ]}));
        wrapper.vm.$store.commit('trackers/store', tracker);

        wrapperTable.vm.$forceUpdate();
        await wrapperTable.vm.$nextTick();
        expect(wrapperTable.find('table tr:nth-child(1) .tracker-summary.views').text()).to.contain('5');
    });

    it('does not see number of views after data are delivered but views are not provided at all', async () => {
        let wrapperTable = wrapper.find({ name: 'dashboard-table' });
        let trackerSource = trackerFactory.create('data', { views: [] });
        delete trackerSource.data.views;
        let tracker = new Tracker(trackerSource);
        wrapper.vm.$store.commit('trackers/store', tracker);

        wrapperTable.vm.$forceUpdate();
        await wrapperTable.vm.$nextTick();
        expect(wrapperTable.find('table tr:nth-child(1) .tracker-summary.views').text()).that.is.empty;
    });

    it('sees number of events after data are delivered', async () => {
        let wrapperTable = wrapper.find({ name: 'dashboard-table' });
        let tracker = new Tracker(trackerFactory.set('meta', { events_count: 5 }).create('data', { events: [
            { name: 'event-a', data: {}, count: 1 },
            { name: 'event-b', data: {}, count: 1 },
            { name: 'event-c', data: {}, count: 1 },
            { name: 'event-d', count: 2 },
        ]}));
        wrapper.vm.$store.commit('trackers/store', tracker);

        wrapperTable.vm.$forceUpdate();
        await wrapperTable.vm.$nextTick();
        expect(wrapperTable.find('table tr:nth-child(1) .tracker-summary.events').text()).to.contain('5');
    });

    it('does not see number of events after data are delivered but events are not provided at all', async () => {
        let wrapperTable = wrapper.find({ name: 'dashboard-table' });
        let trackerSource = trackerFactory.create('data', { events: [] });
        delete trackerSource.data.events;
        let tracker = new Tracker(trackerSource);
        wrapper.vm.$store.commit('trackers/store', tracker);

        wrapperTable.vm.$forceUpdate();
        await wrapperTable.vm.$nextTick();
        expect(wrapperTable.find('table tr:nth-child(1) .tracker-summary.events').text()).that.is.empty;
    });

    it('sees number of queries after data are delivered', async () => {
        let wrapperTable = wrapper.find({ name: 'dashboard-table' });
        let tracker = new Tracker(trackerFactory.set('meta', { queries_count: 1 }).create('data', { queries: [{
            type: 'query',
            database: 'laravel_profiler_2',
            name: 'mysql_2',
            query: 'select * from `users` where `id` = 2 limit 1',
            sql: 'select * from `users` where `id` = ? limit 1',
            bindings: [2],
            time: 22,
        }]}));
        wrapper.vm.$store.commit('trackers/store', tracker);

        wrapperTable.vm.$forceUpdate();
        await wrapperTable.vm.$nextTick();
        expect(wrapperTable.find('table tr:nth-child(1) .tracker-summary.queries').text()).to.contain('1');
    });

    it('does not see number of queries after data are delivered but queries are not provided at all', async () => {
        let wrapperTable = wrapper.find({ name: 'dashboard-table' });
        let trackerSource = trackerFactory.set('meta', { queries_count: 0 }).create('data', { queries: [] });
        delete trackerSource.data.queries;
        let tracker = new Tracker(trackerSource);
        wrapper.vm.$store.commit('trackers/store', tracker);

        wrapperTable.vm.$forceUpdate();
        await wrapperTable.vm.$nextTick();
        expect(wrapperTable.find('table tr:nth-child(1) .tracker-summary.queries').text()).that.is.empty;
    });

    it('sees number of redis commands after data are delivered', async () => {
        let wrapperTable = wrapper.find({ name: 'dashboard-table' });
        let tracker = new Tracker(trackerFactory.set('meta', { redis_count: 3 }).create('data', { redis: [
            {
                command: 'set',
                name: 'default',
                parameters: ['name', 'Laravel Profiler'],
                time: 19,
            },
            {
                command: 'set',
                name: 'default',
                parameters: ['name', 'Laravel Profiler'],
                time: 19,
            },
            {
                command: 'set',
                name: 'default',
                parameters: ['name', 'Laravel Profiler'],
                time: 19,
            },
        ]}));
        wrapper.vm.$store.commit('trackers/store', tracker);

        wrapperTable.vm.$forceUpdate();
        await wrapperTable.vm.$nextTick();
        expect(wrapperTable.find('table tr:nth-child(1) .tracker-summary.redis').text()).to.contain('3');
    });

    it('does not see number of redis commands after data are delivered but redis is not provided at all', async () => {
        let wrapperTable = wrapper.find({ name: 'dashboard-table' });
        let trackerSource = trackerFactory.set('meta', { redis_count: 0 }).create('data', { redis: [] });
        delete trackerSource.data.redis;
        let tracker = new Tracker(trackerSource);
        wrapper.vm.$store.commit('trackers/store', tracker);

        wrapperTable.vm.$forceUpdate();
        await wrapperTable.vm.$nextTick();
        expect(wrapperTable.find('table tr:nth-child(1) .tracker-summary.redis').text()).that.is.empty;
    });

    it('sees positive auth icon after data are delivered and user was logged in', async () => {
        let wrapperTable = wrapper.find({ name: 'dashboard-table' });
        let tracker = new Tracker(trackerFactory.create());
        wrapper.vm.$store.commit('trackers/store', tracker);

        wrapperTable.vm.$forceUpdate();
        await wrapperTable.vm.$nextTick();
        let positive = wrapperTable.find('table tr:nth-child(1) .tracker-summary.auth i.fa-user.has-text-success');
        let negative = wrapperTable.find('table tr:nth-child(1) .tracker-summary.auth i.fa-user-slash.has-text-grey-lighter');
        expect(positive.isVisible()).to.be.true;
        expect(negative.isVisible()).to.be.false;
    });

    it('sees negative auth icon after data are delivered and user was not logged in', async () => {
        let wrapperTable = wrapper.find({ name: 'dashboard-table' });
        let trackerSource = trackerFactory.create('data', { auth: null });
        let tracker = new Tracker(trackerSource);
        wrapper.vm.$store.commit('trackers/store', tracker);

        wrapperTable.vm.$forceUpdate();
        await wrapperTable.vm.$nextTick();
        let positive = wrapperTable.find('table tr:nth-child(1) .tracker-summary.auth i.fa-user.has-text-success');
        let negative = wrapperTable.find('table tr:nth-child(1) .tracker-summary.auth i.fa-user-slash.has-text-grey-lighter');
        expect(positive.isVisible()).to.be.false;
        expect(negative.isVisible()).to.be.true;
    });

    it('does not see auth icon after data are delivered but auth is not provided at all', async () => {
        let wrapperTable = wrapper.find({ name: 'dashboard-table' });
        let trackerSource = trackerFactory.create('data', { auth: undefined });
        delete trackerSource.data.auth;
        let tracker = new Tracker(trackerSource);
        wrapper.vm.$store.commit('trackers/store', tracker);

        wrapperTable.vm.$forceUpdate();
        await wrapperTable.vm.$nextTick();
        let positive = wrapperTable.find('table tr:nth-child(1) .tracker-summary.auth i.fa-user.has-text-success');
        let negative = wrapperTable.find('table tr:nth-child(1) .tracker-summary.auth i.fa-user-slash.has-text-grey-lighter');
        expect(positive.isVisible()).to.be.false;
        expect(negative.isVisible()).to.be.false;
    });

    it('sees exception icon after data with exception are delivered', async () => {
        let wrapperTable = wrapper.find({ name: 'dashboard-table' });
        let tracker = new Tracker(trackerFactory.create());
        wrapper.vm.$store.commit('trackers/store', tracker);

        wrapperTable.vm.$forceUpdate();
        await wrapperTable.vm.$nextTick();
        let exception = wrapperTable.find('table tr:nth-child(1) .tracker-summary.exception i.fa-exclamation-circle.has-text-danger');
        let ok = wrapperTable.find('table tr:nth-child(1) .tracker-summary.exception i.fa-thumbs-up.has-text-grey-lighter');
        expect(exception.isVisible()).to.be.true;
        expect(ok.isVisible()).to.be.false;
    });

    it('sees ok icon after data without exception are delivered', async () => {
        let wrapperTable = wrapper.find({ name: 'dashboard-table' });
        let trackerSource = trackerFactory.create('data', { exception: null });
        let tracker = new Tracker(trackerSource);
        wrapper.vm.$store.commit('trackers/store', tracker);

        wrapperTable.vm.$forceUpdate();
        await wrapperTable.vm.$nextTick();
        let exception = wrapperTable.find('table tr:nth-child(1) .tracker-summary.exception i.fa-exclamation-circle.has-text-danger');
        let ok = wrapperTable.find('table tr:nth-child(1) .tracker-summary.exception i.fa-thumbs-up.has-text-grey-lighter');
        expect(exception.isVisible()).to.be.false;
        expect(ok.isVisible()).to.be.true;
    });

    it('does not see exception or ok icon after data are delivered but exception is not provided at all', async () => {
        let wrapperTable = wrapper.find({ name: 'dashboard-table' });
        let trackerSource = trackerFactory.create('data', { exception: undefined });
        delete trackerSource.data.exception;
        let tracker = new Tracker(trackerSource);
        wrapper.vm.$store.commit('trackers/store', tracker);

        wrapperTable.vm.$forceUpdate();
        await wrapperTable.vm.$nextTick();
        let exception = wrapperTable.find('table tr:nth-child(1) .tracker-summary.exception i.fa-exclamation-circle.has-text-danger');
        let ok = wrapperTable.find('table tr:nth-child(1) .tracker-summary.exception i.fa-thumbs-up.has-text-grey-lighter');
        expect(exception.isVisible()).to.be.false;
        expect(ok.isVisible()).to.be.false;
    });

    it('sees meta data of profiler in descending order', async () => {
        let trackerA = new Tracker(trackerFactory.create());
        let trackerB = new Tracker(trackerFactory.create('meta', { env: 'testing' }));
        wrapper.vm.$store.commit('trackers/store', trackerA);
        wrapper.vm.$store.commit('trackers/store', trackerB);

        let wrapperTable = wrapper.find({ name: 'dashboard-table' });
        wrapperTable.vm.$forceUpdate();
        await wrapperTable.vm.$nextTick();
        expect(wrapperTable.vm.$store.state.trackers.all).to.have.lengthOf(2);
        expect(wrapperTable.find('table tr:nth-child(1) td:nth-child(3)').text()).to.contain(trackerB.env);
        expect(wrapperTable.find('table tr:nth-child(2) td:nth-child(3)').text()).to.contain(trackerA.env);
    });

    it('sees meta data of profiler paginated', async () => {
        [
            new Tracker(trackerFactory.create('meta', { env: 'localA' })),
            new Tracker(trackerFactory.create('meta', { env: 'localB' })),
            new Tracker(trackerFactory.create('meta', { env: 'localC' })),
        ].forEach(tracker => wrapper.vm.$store.commit('trackers/store', tracker));

        let wrapperTable = wrapper.find({ name: 'dashboard-table' });
        wrapperTable.setData({ perPage: 2 });

        wrapperTable.vm.$forceUpdate();
        await wrapperTable.vm.$nextTick();
        expect(wrapperTable.find('table').text()).to.contain('localC');
        expect(wrapperTable.find('table').text()).to.contain('localB');
        expect(wrapperTable.find('table').text()).to.not.contain('localA');
        expect(wrapperTable.findAll('.pagination-link').length).to.equal(2);
    });

    it('shows 15 items per page by default', () => {
        let wrapperTable = wrapper.find({ name: 'dashboard-table' });
        expect(wrapperTable.vm.perPage).to.equal(15);
    });

    it('filters profilers by running', async () => {
        [
            new Tracker(trackerFactory.create('meta', { is_running_in_console: true })),
            new Tracker(trackerFactory.create('meta', { is_running_in_console: false })),
        ].forEach(tracker => wrapper.vm.$store.commit('trackers/store', tracker));

        let wrapperTable = wrapper.find({ name: 'dashboard-table' });
        wrapperTable.setData({ perPage: 1 });

        wrapperTable.vm.$forceUpdate();
        await wrapperTable.vm.$nextTick();
        expect(wrapperTable.find('table').text()).to.contain('web');
        expect(wrapperTable.find('table').text()).to.not.contain('console');

        wrapper.vm.$store.commit('trackers/updateFilter', { running: [ 'console' ] });

        wrapperTable.vm.$forceUpdate();
        await wrapperTable.vm.$nextTick();
        expect(wrapperTable.find('table').text()).to.not.contain('web');
        expect(wrapperTable.find('table').text()).to.contain('console');
    });

    it('filters profilers by env', async () => {
        [
            new Tracker(trackerFactory.create('meta', { env: 'localA' })),
            new Tracker(trackerFactory.create('meta', { env: 'localB' })),
            new Tracker(trackerFactory.create('meta', { env: 'localC' })),
        ].forEach(tracker => wrapper.vm.$store.commit('trackers/store', tracker));

        let wrapperTable = wrapper.find({ name: 'dashboard-table' });
        wrapperTable.setData({ perPage: 2 });

        wrapperTable.vm.$forceUpdate();
        await wrapperTable.vm.$nextTick();
        expect(wrapperTable.find('table').text()).to.contain('localC');
        expect(wrapperTable.find('table').text()).to.contain('localB');
        expect(wrapperTable.find('table').text()).to.not.contain('localA');

        wrapper.vm.$store.commit('trackers/updateFilter', { env: [ 'localC', 'localA' ] });

        wrapperTable.vm.$forceUpdate();
        await wrapperTable.vm.$nextTick();
        expect(wrapperTable.find('table').text()).to.contain('localC');
        expect(wrapperTable.find('table').text()).to.not.contain('localB');
        expect(wrapperTable.find('table').text()).to.contain('localA');
    });

    it('filters profilers by type', async () => {
        [
            new Tracker(trackerFactory.create('meta', { type: 'command-finished' })),
            new Tracker(trackerFactory.create('meta', { type: 'http' })),
        ].forEach(tracker => wrapper.vm.$store.commit('trackers/store', tracker));

        let wrapperTable = wrapper.find({ name: 'dashboard-table' });
        wrapperTable.setData({ perPage: 1 });

        wrapperTable.vm.$forceUpdate();
        await wrapperTable.vm.$nextTick();
        expect(wrapperTable.find('table').text()).to.contain('http');
        expect(wrapperTable.find('table').text()).to.not.contain('command');

        wrapper.vm.$store.commit('trackers/updateFilter', { typeGroup: [ 'command' ] });

        wrapperTable.vm.$forceUpdate();
        await wrapperTable.vm.$nextTick();
        expect(wrapperTable.find('table').text()).to.not.contain('http');
        expect(wrapperTable.find('table').text()).to.contain('command');
    });

    it('filters profilers by statusGroup', async () => {
        [
            new Tracker(trackerFactory.create('meta', { status: 201 })),
            new Tracker(trackerFactory.create('meta', { status: 301 })),
        ].forEach(tracker => wrapper.vm.$store.commit('trackers/store', tracker));

        let wrapperTable = wrapper.find({ name: 'dashboard-table' });
        wrapperTable.setData({ perPage: 1 });

        wrapperTable.vm.$forceUpdate();
        await wrapperTable.vm.$nextTick();
        expect(wrapperTable.find('table').text()).to.contain('301');
        expect(wrapperTable.find('table').text()).to.not.contain('201');

        wrapper.vm.$store.commit('trackers/updateFilter', { statusGroup: [ '2xx' ] });

        wrapperTable.vm.$forceUpdate();
        await wrapperTable.vm.$nextTick();
        expect(wrapperTable.find('table').text()).to.not.contain('301');
        expect(wrapperTable.find('table').text()).to.contain('201');
    });

    it('filters profilers by method', async () => {
        [
            new Tracker(trackerFactory.create('meta', { method: 'GET' })),
            new Tracker(trackerFactory.create('meta', { method: 'POST' })),
        ].forEach(tracker => wrapper.vm.$store.commit('trackers/store', tracker));

        let wrapperTable = wrapper.find({ name: 'dashboard-table' });
        wrapperTable.setData({ perPage: 1 });

        wrapperTable.vm.$forceUpdate();
        await wrapperTable.vm.$nextTick();
        expect(wrapperTable.find('table').text()).to.contain('POST');
        expect(wrapperTable.find('table').text()).to.not.contain('GET');

        wrapper.vm.$store.commit('trackers/updateFilter', { method: [ 'GET' ] });

        wrapperTable.vm.$forceUpdate();
        await wrapperTable.vm.$nextTick();
        expect(wrapperTable.find('table').text()).to.not.contain('POST');
        expect(wrapperTable.find('table').text()).to.contain('GET');
    });

    it('toggles visibility of row details', async () => {
        wrapper.vm.$store.commit('trackers/store', new Tracker(trackerFactory.create('meta', { id: 1 })));
        wrapper.vm.$store.commit('trackers/store', new Tracker(trackerFactory.create('meta', { id: 2 })));

        let wrapperTable = wrapper.find({ name: 'dashboard-table' });
        wrapperTable.vm.$forceUpdate();
        await wrapperTable.vm.$nextTick();

        let tr = wrapperTable.find('table tr:nth-child(1)');

        tr.trigger('click');
        let trDetailsA = wrapperTable.find('table tr:nth-child(1) + tr.detail');
        expect(trDetailsA.exists()).to.be.true;
        expect(trDetailsA.isVisible()).to.be.true;
        expect(trDetailsA.find('td').attributes().colspan).to.equal('14');

        tr.trigger('click');
        let trDetailsABis = wrapperTable.find('table tr:nth-child(1) + tr.detail');
        expect(trDetailsABis.exists()).to.be.false;
    });
});
