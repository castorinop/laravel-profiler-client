<template>
    <span class="true-false">
        <b-tooltip v-if="value"
            :label="'true'"
            type="is-success"
            position="is-right"
        >
            <b-icon
                pack="fas"
                icon="toggle-on"
                size="is-small"
                type="is-success"
            ></b-icon>
        </b-tooltip>
        <b-tooltip v-if="! value"
            :label="'false'"
            type="is-grey-lighter"
            position="is-right"
        >
            <b-icon
                pack="fas"
                icon="toggle-off"
                size="is-small"
                type="is-grey-lighter"
            ></b-icon>
        </b-tooltip>
    </span>
</template>

<script>
    export default {
        name: 'true-false',
        props: {
            value: Boolean,
        },
    };
</script>

<style lang="sass" src="./../../css/true-false-scoped.sass" scoped></style>
