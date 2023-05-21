<template>
  <div
    class="modal fade"
    v-bind:id="this.modalId"
    data-bs-backdrop="static"
    data-bs-keyboard="false"
    tabindex="-1"
    v-bind:aria-labelledby="this.modalId + 'Label'"
    aria-hidden="true"
  >
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h1 class="modal-title fs-5" v-bind:id="this.modalId + 'Label'">{{ this.modalTitle }}</h1>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"
          ></button>
        </div>
        <div class="modal-body">
          <slot></slot>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
          <!-- <button type="button" class="btn btn-primary">Understood</button> -->
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Modal-1',
  components: {},
  data() {
    return {}
  },
  props: {
    modalId: String,
    modalTitle: String
  },
  setup() {},
  created() {},
  mounted() {},
  unmounted() {},
  methods: {}
}
</script>
