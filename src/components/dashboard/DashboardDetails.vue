<template>
    <b-tabs
        :value="activeTab"
        @input="updateActiveTab"
        size="is-small"
        :animated="false"
    >
        <b-tab-item :label="$t('tab-labels.application')">
            <tab-application :tracker="tracker"></tab-application>
        </b-tab-item>
        <b-tab-item :label="$t('tab-labels.request')">
            <tab-request :tracker="tracker"></tab-request>
        </b-tab-item>
        <b-tab-item :label="$t('tab-labels.response')">
            <tab-response :tracker="tracker"></tab-response>
        </b-tab-item>
    </b-tabs>
</template>

<script>
    import Tracker from './../../models/tracker';
    import TabRequest from './details/TabRequest';
    import TabResponse from './details/TabResponse';
    import TabApplication from './details/TabApplication';

    export default {
        components: {
            TabRequest,
            TabResponse,
            TabApplication,
        },
        props: {
            tracker: Tracker,
        },
        created() {
            this.activeTab = this.tracker.lastActiveDetailsTab || this.$store.state.trackers.lastActiveDetailsTab;
            this.updateLastActiveDetailsTabOfTracker(this.activeTab);
        },
        data() {
            return {
                activeTab: 0,
            };
        },
        methods: {
            updateActiveTab(activeTab) {
                this.updateLastActiveDetailsTab(activeTab);
                this.updateLastActiveDetailsTabOfTracker(activeTab);
            },
            updateLastActiveDetailsTab(activeTab) {
                this.$store.commit('trackers/updateLastActiveDetailsTab', activeTab);
            },
            updateLastActiveDetailsTabOfTracker(activeTab) {
                this.$store.commit('trackers/updateLastActiveDetailsTabOfTracker', {
                    trackerId: this.tracker.id,
                    activeTab,
                });
            },
        },
    };
</script>