import Tracker from '@/models/tracker';
import { trackerFactory } from './../test-helper';
import { BasePerformance } from '@/models/base-performance';

describe('BasePerformance Model', () => {
    it('has memory peak', () => {
        let trackerSourceA = trackerFactory.create('data.performance.memory', { peak: 209715 });
        let trackerSourceB = trackerFactory.create('data.performance.memory', { peak: 1048576 });
        let trackerSourceC = trackerFactory.create('data.performance.memory', { peak: 1289740 });

        let performanceA = new BasePerformance(trackerSourceA.data.performance);
        let performanceB = new BasePerformance(trackerSourceB.data.performance);
        let performanceC = new BasePerformance(trackerSourceC.data.performance);

        expect(performanceA.memory.peak).to.equal('0.20');
        expect(performanceA.memoryPeakForHuman).to.equal('0.20MB');
        expect(performanceB.memory.peak).to.equal('1.00');
        expect(performanceB.memoryPeakForHuman).to.equal('1.00MB');
        expect(performanceC.memory.peak).to.equal('1.23');
        expect(performanceC.memoryPeakForHuman).to.equal('1.23MB');
    });

    it('has laravel execution time', () => {
        let trackerSourceA = trackerFactory.create('data.performance.timer', { laravel: 36 });
        let trackerSourceB = trackerFactory.create('data.performance.timer', { laravel: 34 });
        let trackerSourceC = trackerFactory.create('data.performance.timer', { laravel: 350.1 });
        let trackerSourceD = trackerFactory.create('data.performance.timer', { laravel: 3501.1 });

        let performanceA = new BasePerformance(trackerSourceA.data.performance);
        let performanceB = new BasePerformance(trackerSourceB.data.performance);
        let performanceC = new BasePerformance(trackerSourceC.data.performance);
        let performanceD = new BasePerformance(trackerSourceD.data.performance);

        expect(performanceA.laravel).to.equal(0.036);
        expect(performanceA.laravelTimeForHuman).to.equal('0.04s');
        expect(performanceB.laravel).to.equal(0.034);
        expect(performanceB.laravelTimeForHuman).to.equal('0.03s');
        expect(performanceC.laravel).to.equal(0.351);
        expect(performanceC.laravelTimeForHuman).to.equal('0.35s');
        expect(performanceD.laravel).to.equal(3.502);
        expect(performanceD.laravelTimeForHuman).to.equal('3.50s');
    });

    it('has queries with redis timers', () => {
        let trackerSource = trackerFactory.create();
        let performance = new BasePerformance(trackerSource.data.performance, 123.456789, 5);

        expect(performance.hasQueries()).to.be.true;
        expect(performance.hasRedis()).to.be.true;
        expect(performance.queries).to.deep.equal({
            queries: '0.123',
            redis: '0.005',
            other: '0.222',
        });
        expect(
            parseFloat(performance.queries.queries) +
            parseFloat(performance.queries.redis) +
            parseFloat(performance.queries.other)
        ).to.equal(performance.laravel);
    });

    it('has queries with redis timers calculated from queries execution time of tracker', () => {
        let trackerSource = trackerFactory.create();
        let tracker = new Tracker(trackerSource);
        let performance = tracker.performance;

        expect(performance.hasQueries()).to.be.true;
        expect(performance.hasRedis()).to.be.true;
        expect(performance.queries).to.deep.equal({
            queries: '0.025',
            redis: '0.019',
            other: '0.306',
        });
    });

    it('has not queries timer if queries execution time is 0', () => {
        let trackerSource = trackerFactory.create();
        let performance = new BasePerformance(trackerSource.data.performance, 0, 1);

        expect(performance.hasQueries()).to.be.false;
        expect(performance.hasRedis()).to.be.true;
    });

    it('has not redis timer if redis execution time is 0', () => {
        let trackerSource = trackerFactory.create();
        let performance = new BasePerformance(trackerSource.data.performance, 1, 0);

        expect(performance.hasQueries()).to.be.true;
        expect(performance.hasRedis()).to.be.false;
    });

    it('has custom timer', () => {
        let trackerSource = trackerFactory.create('data.performance.timer', {
            laravel: 2000,
            'custom-time': 20,
            'custom-time b': 30,
            'custom-time c': 1234,
        });
        let performance = new BasePerformance(trackerSource.data.performance);

        expect(performance.hasCustom()).to.be.true;
        expect(performance.customChartData().labels).to.deep.equal([
            'time (0.020s)',
            'time b (0.030s)',
            'time c (1.234s)',
        ]);
        expect(performance.customChartData().datasets[0].data).to.deep.equal([
            '0.020',
            '0.030',
            '1.234',
        ]);
    });

    it('has not custom timer if custom data are not provided at all', () => {
        let trackerSource = trackerFactory.create('data.performance.timer', {
            laravel: 1000,
            'custom-time': undefined,
        });
        delete trackerSource.data.performance.timer['custom-time'];
        let performance = new BasePerformance(trackerSource.data.performance);

        expect(performance.hasCustom()).to.be.false;
    });

    it('has related queries and redis chart data with queries and redis legend data', () => {
        let trackerSource = trackerFactory.create();
        let performance = new BasePerformance(trackerSource.data.performance, 100, 100);

        let queriesLegend = performance.queriesLegendData();
        let queriesChart = performance.queriesChartData();

        expect(queriesChart.labels.length).to.equal(3);
        expect(queriesChart.labels.length).to.equal(queriesLegend.length);

        expect(queriesChart.labels[0]).to.equal(queriesLegend[0].label);
        expect(queriesChart.labels[1]).to.equal(queriesLegend[1].label);
        expect(queriesChart.labels[2]).to.equal(queriesLegend[2].label);

        expect(queriesChart.datasets[0].data.length).to.equal(3);
        expect(queriesChart.datasets[0].data).to.deep.equal(Object.values(performance.queries));

        expect(queriesChart.datasets[0].backgroundColor.length).to.equal(3);
        expect(queriesChart.datasets[0].backgroundColor[0]).to.equal(queriesLegend[0].color);
        expect(queriesChart.datasets[0].backgroundColor[1]).to.equal(queriesLegend[1].color);
        expect(queriesChart.datasets[0].backgroundColor[2]).to.equal(queriesLegend[2].color);
    });

    it('has related queries chart data with queries legend data', () => {
        let trackerSource = trackerFactory.create();
        let performance = new BasePerformance(trackerSource.data.performance, 100, 0);

        let queriesLegend = performance.queriesLegendData();
        let queriesChart = performance.queriesChartData();

        expect(queriesChart.labels.length).to.equal(2);
        expect(queriesChart.labels.length).to.equal(queriesLegend.length);

        expect(queriesChart.labels).to.contain('queries');
        expect(queriesChart.labels).to.not.contain('redis');
    });

    it('has related redis chart data with redis legend data', () => {
        let trackerSource = trackerFactory.create();
        let performance = new BasePerformance(trackerSource.data.performance, 0, 100);

        let queriesLegend = performance.queriesLegendData();
        let queriesChart = performance.queriesChartData();

        expect(queriesChart.labels.length).to.equal(2);
        expect(queriesChart.labels.length).to.equal(queriesLegend.length);

        expect(queriesChart.labels).to.contain('redis');
        expect(queriesChart.labels).to.not.contain('queries');
    });
});
