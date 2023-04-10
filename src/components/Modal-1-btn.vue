<template>
    <div>
        <button type="button" class="btn btn-primary" data-bs-toggle="modal" v-bind:data-bs-target="'#' + this.modalId">
            <slot></slot>
        </button>
    </div>
</template>

<script>
export default {
    name: 'Modal-1-btn',
    components: {},
    data() {
        return {
        };
    },
    props: {
        modalId: String
    },
    setup() { },
    created() { },
    mounted() { },
    unmounted() { },
    methods: {}
}
</script>