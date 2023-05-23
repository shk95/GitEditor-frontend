<template>
  <li :class="{ bold: isFolder }" class="row" @click="toggle">
    <div class="col-1">
      <div v-if="isFolder">
        <IconTree v-if="!isOpen" style="display: inline" />
        <IconTreeToggleOn v-if="isOpen" style="display: inline" />
      </div>
    </div>
    <div class="col-1">
      <div v-if="isFolder">
        <IconFolder v-if="!isOpen" style="display: inline" />
        <IconFolderOpened v-if="isOpen" style="display: inline" />
      </div>
      <div v-else-if="!isFolder">
        <IconFile style="display: inline" />
      </div>
    </div>
    <div class="col">
      {{ model.name }}
    </div>
  </li>
  <ul v-show="isOpen" v-if="isFolder">
    <!-- A component can recursively render itself using its "name" option (inferred from filename if using SFC) -->
    <TreeItem class="item" v-for="model in model.children" :model="model" :key="model.name" />
  </ul>
</template>

<script>
import IconFile from '../components/icons/IconFile.vue'
import IconFolder from '../components/icons/IconFolder.vue'
import IconFolderOpened from '../components/icons/IconFolderOpened.vue'
import IconTree from '../components/icons/IconTree.vue'
import IconTreeToggleOn from '../components/icons/IconTreeToggleOn.vue'

export default {
  name: 'TreeItem', // necessary for self-reference
  props: {
    model: Object
  },
  components: {
    IconFile,
    IconFolder,
    IconFolderOpened,
    IconTree,
    IconTreeToggleOn
  },
  data() {
    return {
      isOpen: false
    }
  },
  computed: {
    isFolder() {
      return this.model.children && this.model.children.length
    }
  },
  methods: {
    toggle() {
      if (this.isFolder) {
        this.isOpen = !this.isOpen
      }
    }
  }
}
</script>
