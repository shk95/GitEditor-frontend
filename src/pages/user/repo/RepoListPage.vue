<script setup>
import {computed, onBeforeMount, reactive, ref, watch} from "vue";
import {api} from "boot/axios";
import {useQuasar} from "quasar";
import {useRouter} from "vue-router";

const $q = useQuasar();
const router = useRouter();

const splitterModel1 = ref(18);


// 가져온 리포지토리 목록의 정보
const repos = ref([
  /*{branches, defaultBranch, htmlUrl, repoFullName, repoName, url}*/
]);
// 페이지 로딩시 리포지토리 목록 불러옴.
onBeforeMount(() => {
  api.get("/git/repos").then((resolve) => {
    console.debug("Get Repos", resolve);
    repos.value = resolve?.data;
    currentRepo.value = resolve?.data[0]?.repoName;
  })
})
// 현재 보고있는 리포지토리 (패널)
const currentRepo = ref(null);
// 선택된 리포지토리 정보
const repo = reactive({
  branches: "",
  defaultBranch: "",
  htmlUrl: "",
  repoFullName: "",
  repoName: "",
  url: ""
});
// 리포지토리 선택되면 리포지토리 정보 가져옴.
watch(currentRepo, (selectedRepo) => {
  console.debug("Looking : ", selectedRepo);
  repo.value = repos.value.find((r) => r.repoName === selectedRepo);
  branchList.value = repo.value?.branches;
  branchNameList.value = [...branchList.value.map((b) => b.branchName)];
  defaultBranch.value = repo.value?.defaultBranch;
  selectedBranch.value = defaultBranch.value;
  console.log("get repo : ", repo.value.repoName);
});


// 선택된 리포지토리 브랜치 정보 목록
const branchList = ref([
  /*{branchName, branchSha}...*/
]);
// 브랜치 이름 목록
const branchNameList = ref([
  /*branchName*/
]);
// 리포지토리 기본 브랜치
const defaultBranch = ref(null);
// 선택된 브랜치
const selectedBranch = ref(null);
// 리포지토리 정보중 브랜치가 선택되면 파일 목록을 가져옴.
watch(repo, (selectedBranch) => {
  getFilesFromRoot(repo.value.repoName, selectedBranch);
});
// const unNestedFileTree = ref([]);
// 가져온 리포지토리 파일 트리
const fileTree = ref([]);
const getFilesFromRoot = (repoName, branchName) => {
  // 루트 경로의 파일 목록 가져오기
  api
    .get(`/git/repo/${repoName}/tree`, {
      params: {
        branchName: `${encoding(branchName)}`,
      },
    })
    .then((resolve) => {
      const retrievedFiles = resolve.data;

      fileTree.value = retrievedFiles.map((retrievedFile) => {
        const file = {
          label: retrievedFile.path,
          sha: retrievedFile.sha,
          type: retrievedFile.type,
          mode: retrievedFile.mode,
          url: retrievedFile.url,
          icon: getTreeIcon(retrievedFile.mode),
        };
        if (retrievedFile.type === "tree") file.lazy = true;
        return file;
      });
    })
    .catch((error) => {
    });
};
// ##### 파일트리
const onLazyLoad = ({node, key, done, fail}) => {

  // 파일트리 지연생성
  if (node.type !== "tree") {
    done([]);
    return;
  }
  getFilesFromTreeSha({
    repoName: currentRepo.value,
    branchName: selectedBranch.value,
    treeSha: node.sha,
  })
    .then(({appendTree}) => {
      const newTree = appendTree.map((file) => {
        const res = {
          label: file.path,
          sha: file.sha,
          type: file.type,
          mode: file.mode,
          url: file.url,
          icon: getTreeIcon(file.mode),
        };
        if (file.type === "tree") res.lazy = true;
        return res;
      })
      // unNestedFileTree.value.push(...newTree)// 검색용 리스트
      done(newTree);
    })
    .catch((error) => {
      fail(error);
      console.warn("Cannot getting files");
    });
};
const getFilesFromTreeSha = ({repoName, branchName, treeSha}) => {
  return api
    .get(`/git/repo/${repoName}/tree`, {
      params: {
        branchName: `${encoding(branchName)}`,
        treeSha: `${treeSha}`,
      },
    })
    .then((resolve) => {
      return {appendTree: resolve?.data};
    })
    .catch((error) => {
      throw new Error("파일 목록가져오기 실패.");
    });
};


// 선택된 파일 정보
const shaOfSelectedFile = ref('' /*file`s sha*/);
const selectedFile = reactive({
  label: '',
  mode: '',
  path: '',
  sha: '',
  type: '',
  url: ''
})
const contentOfSelectedFile = reactive({
  render: false,
  textContent: "파일을 선택해주세요.",
  url: "",
  sha: ""
});
// 파일 트리에서 파일 선택시 현재 파일의 sha 정보를 업데이트.
const treeRef = ref(null);// tree ref
watch(shaOfSelectedFile, () => {
  const file = treeRef.value.getNodeByKey(shaOfSelectedFile.value)
  selectedFile.label = file.label
  selectedFile.mode = file.mode
  selectedFile.path = file.path
  selectedFile.sha = file.sha
  selectedFile.type = file.type
  selectedFile.url = file.url
  console.debug("selectedFile", selectedFile)
  console.log("Sha-1 of selected file.", shaOfSelectedFile.value)
});


// 선택된 파일의 sha 정보가 업데이트 되면 파일 내용을 가져옴.
watch(selectedFile, () => {
  console.log("Selected file.", selectedFile)
  getFileContent()
});
const getFileContent = () => {
  if (selectedFile.mode !== "100644") {
    contentOfSelectedFile.textContent = "이 파일은 렌더링 할 수 없습니다."
    contentOfSelectedFile.sha = "";
    contentOfSelectedFile.url = "";
    contentOfSelectedFile.render = false
    return;
  }
  api
    .get(`/git/repo/${repo.value.repoName}/file/string`, {
      params: {
        branchName: `${encoding(selectedBranch.value)}`,
        sha: `${selectedFile.sha}`,
      },
    })
    .then((resolve) => {
      console.log("Read file`s text content", resolve.data)
      $q.notify({
        color: "primary",
        message: resolve.message,
        icon: "check",
      })
      const file = resolve.data;
      contentOfSelectedFile.textContent = file.textContent;
      contentOfSelectedFile.sha = file.sha;
      contentOfSelectedFile.url = file.url;
      contentOfSelectedFile.render = true
    })
    .catch((error) => {
      $q.notify({
        color: "warning",
        message: error.message,
        icon: "report_problem",
      })
    });
}


const createRepositoryForm = reactive({
  repoName: "",
  description: "",
  makePrivate: false,
})
const createRepositoryPrompt = ref(false)
const goToEdit = () => {
  router.push({
    path: `/user/repo/${repo.value.repoName}/edit`,
  })
}
const newRepository = () => {
  if (createRepositoryForm.repoName === '') {
    $q.notify({
      type: "negative",
      message: "리포지토리 이름을 입력해주세요.",
    });
    return
  }
  api
    .post("/git/repo", createRepositoryForm)
    .then(({message, data}) => {
      $q.notify({
        type: "info",
        message: message,
      });
      console.log("Create Repo", data.repoName)
      return Promise.resolve(data.repoName);
    })
    .then(resolve => {
      $q.dialog({
        title: "리포지토리 생성 완료",
        message: `${resolve} 리포지토리가 생성되었습니다.`,
        ok: "이동하시겠습니까?",
        cancel: true,
        persistent: true,
      }).onOk(() => {
        router.push({
          path: `/user/repo/${resolve}/edit`,
        })
      })
    })
}


const getTreeIcon = (mode) => {
  // material icons
  const icons = Object.freeze([
    {
      name: "article",
      mode: "100644",
    },
    {
      name: "laptop_chromebook",
      mode: "100755",
    },
    {
      name: "folder",
      mode: "040000",
    },
    {
      name: "commit",
      mode: "160000",
    },
    {
      name: "link",
      mode: "120000",
    },
  ]);
  return icons.find((i) => i.mode === mode)["name"];
};

import hljs from 'highlight.js';
import 'highlight.js/styles/default.css';
import prettier from 'prettier/standalone';

const isMarkdown = computed(() => selectedFile.path.endsWith('.md'))

const code = computed(() => {
    const text = contentOfSelectedFile.textContent
    let formatted
    try {
      formatted = prettier.format(text, {
        parser: 'babel',
        plugins: [prettierPlugins],
      });
    } catch (e) {
      formatted = text
    }
    return hljs.highlightAuto(formatted).value
  }
)

const deleteRepo = () => {
  api.delete('/git/repo', {
    params: {
      repoName: repo.value.repoName,
    }
  })
    .then(({message}) => {
      $q.notify({
        type: "info",
        message: message,
      });
      updatePage()
    })
}
const updatePage = () => setTimeout(() => router.go(0), 2000)

const encoding = (url) => encodeURIComponent(url);
</script>

<template>
  <!--  repo list-->
  <div>
    <q-splitter v-model="splitterModel1">
      <template v-slot:before>
        <div class="q-pa-md example-column-row-width">
          <div class="column" style="height: 200px">
            <q-tabs
              v-model="currentRepo"
              vertical
              dense
              stretch
              shrink
              outside-arrows
              class="text-teal"
            >
              <q-tab
                v-for="repo in repos"
                :name="repo.repoName"
                :label="repo.repoName"
                :key="repo.repoFullName"
                no-caps
              />
            </q-tabs>
          </div>
          <div class="column" style="height: max-content">
            <q-tree
              ref="treeRef"
              :nodes="fileTree"
              node-key="sha"
              label-key="label"
              dense
              duration="150"
              selected-color="primary"
              v-model:selected="shaOfSelectedFile"
              @lazy-load="onLazyLoad"
            />
          </div>
        </div>
      </template>

      <template v-slot:after>
        <q-tab-panels
          v-model="currentRepo"
          animated
          swipeable
          vertical
          transition-prev="jump-up"
          transition-next="jump-up"
        >
          <q-tab-panel
            v-for="repo in repos"
            :name="repo.repoName"
            :key="repo.repoName"
          >
            <div class="q-ma-lg-xl row">
              <div class="col-4">
                <div class="text-h4 q-mb-md">{{ repo.repoFullName }}</div>
                <p>{{ repo.htmlUrl }}</p>
              </div>
              <div class="col-4">
                <div class="q-gutter-x-md">
                  <q-select
                    style="width: 150px;"
                    outlined
                    dense
                    v-model="selectedBranch"
                    :options="branchNameList"
                    label="Branch"
                  />
                </div>
              </div>
              <div class="col-2">
                <q-btn
                  style="width: 178px"
                  label="New Repository"
                  outline
                  @click="()=>createRepositoryPrompt=true"
                  push
                ></q-btn>
                <q-btn
                  label="Delete Repository"
                  outline
                  @click="deleteRepo"
                  push
                ></q-btn>
              </div>
              <div class="col-2">
                <q-btn
                  label="Go To Edit"
                  outline
                  @click="goToEdit"
                  push
                ></q-btn>
              </div>
            </div>
            <div class="row">
              <q-markdown v-if="isMarkdown" :src="contentOfSelectedFile.textContent"></q-markdown>
              <pre v-else v-html="code"></pre>
            </div>
          </q-tab-panel>
        </q-tab-panels>
      </template>
    </q-splitter>
  </div>
  <div class="q-pa-md q-gutter-sm">
    <q-dialog v-model="createRepositoryPrompt" persistent>
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">Repository Name</div>
        </q-card-section>
        <q-card-section class="q-pt-none">
          <q-input dense v-model="createRepositoryForm.repoName" autofocus/>
        </q-card-section>

        <q-card-section>
          <div class="text-h6">Repository Description</div>
        </q-card-section>
        <q-card-section class="q-pt-none">
          <q-input dense v-model="createRepositoryForm.description"/>
        </q-card-section>

        <q-card-section>
          <div class="text-h6">Make Repository Private?</div>
        </q-card-section>
        <q-card-section class="q-pt-none">
          <q-toggle :label="createRepositoryForm.makePrivate?'true':'false'" dense
                    v-model="createRepositoryForm.makePrivate"/>
        </q-card-section>

        <q-card-actions align="right" class="text-primary">
          <q-btn flat label="Cancel" v-close-popup/>
          <q-btn flat label="Create" v-close-popup @click="newRepository"/>
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<style></style>
