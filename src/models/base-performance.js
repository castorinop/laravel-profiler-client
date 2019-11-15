import { performanceService } from './../services/performance.model.service';

export class BasePerformance {
    constructor(performance, queriesExecutionTime, redisExecutionTime) {
        this.memory = performanceService.memoryInMB(performance.memory);
        this.laravel = performanceService.laravelInSeconds(performance.timer);
        this.custom = performanceService.customInSeconds(performance.timer);
        this.queries = performanceService.queriesInSeconds(queriesExecutionTime, redisExecutionTime, performance.timer);
        this.queriesColors = {
            queries: 'rgb(255, 159, 64)',
            redis: 'rgb(153, 50, 200)',
            other: 'hsl(0, 0%, 86%)',
        };
        this.customColors = {
            backgroundColor: '#d7ecfb',
            borderColor: '#54b0ee',
        };
    }

    get memoryPeakForHuman() {
        return `${this.memory.peak}MB`;
    }

    get laravelTimeForHuman() {
        return `${parseFloat(this.laravel).toFixed(2)}s`;
    }

    get customChartHeight() {
        return `${(Object.keys(this.custom).length * 50)}px`;
    }

    hasCustom() {
        return !! Object.keys(this.custom).length;
    }

    hasQueries() {
        return parseFloat(this.queries.queries) !== 0;
    }

    hasRedis() {
        return parseFloat(this.queries.redis) !== 0;
    }

    hasQueriesOrRedis() {
        return this.hasQueries() || this.hasRedis();
    }

    queriesKeysToChart() {
        return Object.keys(this.queries).filter(key => this.queries[key] > 0);
    }

    queriesValuesToChart() {
        return Object.values(this.queries).filter(value => value > 0);
    }

    summaryLegendData($t) {
        return Object.keys(this.summary).map((key) => {
            return {
                label: $t(`tabs.performance.summary.${key}`),
                item: `${this.summary[key]}s`,
                color: this.summaryColors[key],
            };
        });
    }

    summaryChartData($t) {
        return {
            labels: Object.keys(this.summary).map(key => $t(`tabs.performance.summary.${key}`)),
            datasets: [
                {
                    data: Object.values(this.summary),
                    backgroundColor: Object.keys(this.summary).map(key => this.summaryColors[key]),
                },
            ],
        };
    }

    queriesLegendData() {
        return this.queriesKeysToChart().map((key) => {
            return {
                label: key,
                item: `${this.queries[key]}s`,
                color: this.queriesColors[key],
            };
        });
    }

    queriesChartData() {
        return {
            labels: this.queriesKeysToChart(),
            datasets: [
                {
                    data: this.queriesValuesToChart(),
                    backgroundColor: this.queriesKeysToChart().map(key => this.queriesColors[key]),
                },
            ],
        };
    }

    customChartData() {
        return {
            labels: Object.keys(this.custom).map(key => `${key} (${this.custom[key]}s)`),
            datasets: [
                {
                    data: Object.values(this.custom),
                    backgroundColor: this.customColors.backgroundColor,
                    borderColor: this.customColors.borderColor,
                    borderWidth: 1,
                },
            ],
        };
    }
}
