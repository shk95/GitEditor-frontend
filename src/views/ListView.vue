<template>
  <div class="container text-center">

    <!-- Breadcrumb 경로 표시 -->
    <div class="row">
      <div class="col-3"></div>
      <div class="col-9">
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb">
            <li class="breadcrumb-item"><a href="#">Home</a></li>
            <li class="breadcrumb-item"><a href="#">Library</a></li>
            <li class="breadcrumb-item active" aria-current="page">Data</li>
          </ol>
        </nav>
      </div>
    </div>

    <!-- 파일 목록 표시 -->
    <div class="row">
      <div class="col-2">
        <ul class="container">
          <TreeItem class="item" :model="treeData"></TreeItem>
        </ul>
      </div>
      <div role="separator" class="col-1">
        <div class="vertical-line">

        </div>
      </div>
      <div class="col-9">
        <div>
          <div class="file-list container">
            <!-- header -->
            <div class="file-list-header row">
              <div class="file-name col-4">Name</div>
              <div class="file-size col-3">Size</div>
              <div class="file-updated col-3">Last Updated</div>
            </div>

            <!-- lists -->
            <div class="file-list-body">

              <!-- list -->
              <div class="file row">
                <div class="file-name col-4">
                  <a href="#">file1.txt</a>
                </div>
                <div class="file-size col-3">10 KB</div>
                <div class="file-updated col-3">2022-04-01 10:00 AM</div>
              </div>

              <div class="file row">
                <div class="file-name col-4">
                  <a href="#">file2.png</a>
                </div>
                <div class="file-size col-3">50 KB</div>
                <div class="file-updated col-3">2022-04-01 11:00 AM</div>
              </div>

            </div>

          </div>
        </div>
      </div>
    </div>

  </div>
  <IconFile />
  <IconFolder />
  <IconFolderOpened />
  <IconTree />
  <IconTreeToggleOn />
</template>

<script>

import TreeItem from '../components/TreeItem.vue'

// mock data
const treeData = {
  name: 'My Tree',
  children: [
    { name: 'hello' },
    { name: 'wat' },
    {
      name: 'child folder',
      children: [
        {
          name: 'child folder',
          children: [{ name: 'hello' }, { name: 'wat' }]
        },
        { name: 'hello' },
        { name: 'wat' },
        {
          name: 'child folder',
          children: [{ name: 'hello' }, { name: 'wat' }]
        }
      ]
    }
  ]
}

export default {
  name: 'listView',
  components: { TreeItem },
  data() {
    return {
      treeData
    };
  },
  setup() {

  },
  created() { },
  mounted() { },
  unmounted() { },
  methods: {}
}
</script>

<style>
.file-list {
  border: 1px solid #ddd;
  font-size: 14px;
}

.file-list-header {
  /* display: flex; */
  padding: 8px;
  background-color: #f6f8fa;
  font-weight: bold;
  border-bottom: 1px solid #ddd;
}

.file-list-header>div {
  /* flex-basis: 33.33%; */
}

.file-list-body {
  /* padding: 8px; */
}

.file {
  /* display: flex; */
  /* align-items: center; */
  padding: 8px 0;
  border-bottom: 1px solid #ddd;
}

.file-name {
  /* flex-basis: 50%; */
}

.file-name a {
  text-decoration: none;
  color: #0366d6;
}

.file-size {
  /* flex-basis: 25%; */
}

.file-updated {
  /* flex-basis: 25%; */
  text-align: right;
  color: #6a737d;
}

/* 트리 뷰 */
.item {
  cursor: pointer;
  line-height: 1.5;
}

.bold {
  font-weight: bold;
}
</style>