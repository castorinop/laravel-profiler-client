import { filterService } from './../../services/filter.store.service';
import { trackersService } from './../../services/trackers.store.service';

const getters = {
    total: state => state.all.length,
    filtered: state => filterService.filter(state.all, state.filter, {
        running: state.allRunnings,
        env: state.allEnvs,
        typeGroup: state.allTypeGroups,
        statusGroup: state.allStatusGroups,
        method: state.allMethods,
    }),
    allRunnings: state => state.allRunnings,
    allEnvs: state => state.allEnvs,
    allTypeGroups: state => state.allTypeGroups,
    allStatusGroups: state => state.allStatusGroups,
    allMethods: state => state.allMethods,
};

const mutations = {
    store(state, tracker) {
        trackersService.guardTrackerType(tracker);
        state.all.unshift(tracker);
        trackersService.updateRunningFilter(state, tracker);
        trackersService.updateEnvFilter(state, tracker);
        trackersService.updateTypeGroupFilter(state, tracker);
        trackersService.updateStatusGroupFilter(state, tracker);
        trackersService.updateMethodFilter(state, tracker);
    },

    updateFilter(state, filterBy) {
        Object.assign(state.filter, filterBy);
    },
};

export function trackersFactory() {
    const state = {
        all: [],
        allRunnings: [],
        allEnvs: [],
        allTypeGroups: [],
        allStatusGroups: [],
        allMethods: [],
        filter: {
            running: [],
            env: [],
            typeGroup: [],
            statusGroup: [],
            method: [],
        },
    };

    return {
        namespaced: true,
        state,
        getters,
        mutations,
    };
};
