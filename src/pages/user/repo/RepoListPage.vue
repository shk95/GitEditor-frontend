<script setup>
import { onBeforeMount, ref, watch } from "vue";
import { api } from "boot/axios";

const splitterModel1 = ref(30);
const splitterModel2 = ref(30);

// 가져온 리포지토리 목록의 정보
const repos = ref([
  /*{branches, defaultBranch, htmlUrl, repoFullName, repoName, url}*/
]);
// 현재 보고있는 리포지토리
const currentRepo = ref(null);

// 선택된 리포지토리 정보
const repo = ref({
  /*{branches, defaultBranch, htmlUrl, repoFullName, repoName, url}...*/
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

// 가져온 리포지토리 파일 트리
const fileTree = ref([]);
// 선택된 파일 정보
const selectedFile = ref({
  /*mode, path, sha, type, url*/
});

onBeforeMount(() => {
  // 페이지 로딩시 리포지토리 목록 불러옴.
  getRepos();
});

watch(currentRepo, (selectedRepo) => {
  // 리포지토리 선택되면 리포지토리 정보 가져옴.
  console.debug("Looking : ", selectedRepo);
  getRepo(selectedRepo);
});

watch(selectedBranch, (selectedBranch) => {
  // 리포지토리 정보중 브랜치가 선택되면 파일 목록을 가져옴.
  getFilesFromRoot(repo.value.repoName, selectedBranch);
});

watch(selectedFile, () => console.debug(selectedFile));

const getRepos = () => {
  return api.get("/git/repos").then((resolve) => {
    console.debug("Get Repos", resolve);
    repos.value = resolve?.data;
    currentRepo.value = resolve?.data[0]?.repoName;
  });
};

const getRepo = (selectedRepoName) => {
  repo.value = repos.value.find((r) => r.repoName === selectedRepoName);

  branchList.value = repo.value?.branches;
  branchNameList.value = [...branchList.value.map((b) => b.branchName)];
  defaultBranch.value = repo.value?.defaultBranch;
  selectedBranch.value = defaultBranch.value;

  console.log("get repo : ", repo.value.repoName);
};

const getFilesFromRoot = (repoName, branchName) => {
  // 루트 경로의 파일 목록 가져오기
  api
    .get(`/git/repo/${repoName}`, {
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
    .catch((error) => {});
};

const getFilesFromTreeSha = ({ repoName, branchName, treeSha }) => {
  return api
    .get(`/git/repo/${repoName}/tree`, {
      params: {
        branchName: `${encoding(branchName)}`,
        treeSha: `${treeSha}`,
      },
    })
    .then((resolve) => {
      return { appendTree: resolve?.data };
    })
    .catch((error) => {
      throw new Error("파일 목록가져오기 실패.");
    });
};

const onLazyLoad = ({ node, key, done, fail }) => {
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
    .then(({ appendTree }) => {
      done(
        appendTree.map((file) => {
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
      );
    })
    .catch((error) => {
      fail(error);
      console.warn("Cannot getting files");
    });
};

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
              :nodes="fileTree"
              node-key="label"
              dense
              duration="150"
              selected-color="primary"
              v-model:selected="selectedFile"
              @lazy-load="onLazyLoad"
              default-expand-all
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
            <div class="text-h4 q-mb-md">{{ repo.repoFullName }}</div>
            <p>{{ repo.htmlUrl }}</p>
            <div class="q-pa-md">
              <div class="q-gutter-x-md">
                <q-select
                  outlined
                  dense
                  v-model="selectedBranch"
                  :options="branchNameList"
                  label="Branch"
                />
              </div>
            </div>
          </q-tab-panel>
        </q-tab-panels>
      </template>
    </q-splitter>
  </div>
</template>

<style></style>
