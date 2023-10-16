<script setup>
import {computed, onMounted, reactive, ref, watch} from "vue";
import {useRoute, useRouter} from "vue-router";
import {api} from "boot/axios";
import {useQuasar} from "quasar";

const route = useRoute();
const router = useRouter();
const $q = useQuasar();
const splitterModel1 = ref(18);
const splitterModel2 = ref(50);

const prompt = ref(false);
const address = ref("");
const name = ref("");
const getMarkdown = () => {
  if (selectedFile.type !== "tree") {
    $q.notify({
      type: "negative",
      message: "폴더를 선택해주세요.",
    });
    return;
  }
  console.debug("###", selectedFile.path, name.value);
  api
    .post("/document/github/markdown", {
      url: address.value,
      repoName: repo.repoName,
      branchName: selectedBranch.value,
      filename: name.value,
      basePath: selectedFile.path,
      baseTreeSha: selectedFile.sha,
    })
    .then(({data, message}) => {
      console.log("#### data", data);
      console.log("#### message", message);
      $q.notify({
        type: "positive",
        message: "저장되었습니다",
      });
      setTimeout(() => (prompt.value = false), 1000);
    });
};

onMounted(() => {
  console.log("Repository edit page mounted");
  console.log("Current repository : ", route.params.repoName);
  repoName.value = route.params.repoName;
  getRepo()
    .then(() => {
      getFilesFromRoot(repo.repoName, selectedBranch);
      branchNameList.value = [...repo.branches.map((b) => b.branchName)];
      selectedBranch.value = repo.defaultBranch;
    })
    .catch((error) => {
      console.log("Repository Not Found : ", error);
      $q.notify({
        type: "negative",
        message: "리포지토리가 존재하지 않습니다.",
      });
      router.push({path: "/user/repo"});
    });
});

const repoName = ref("");
const repo = reactive({
  repoFullName: "",
  repoName: "",
  branches: [],
  url: "",
  htmlUrl: "",
  defaultBranch: "",
  owner: "",
});

const getRepo = () => {
  return api
    .get("/git/repo", {
      params: {
        repoName: encoding(repoName.value),
      },
    })
    .then(
      ({data, message}) => {
        $q.notify({
          color: "primary",
          message: message,
          icon: "check",
        });
        console.log("##########", data);
        repo.repoName = data.repoName;
        repo.repoFullName = data.repoFullName;
        repo.branches = data.branches;
        repo.url = data.url;
        repo.htmlUrl = data.htmlUrl;
        repo.defaultBranch = data.defaultBranch;
        repo.owner = data.owner;
      },
      ({message}) => {
        return Promise.reject(new Error(message));
      }
    );
};

const branchNameList = ref([
  /*branchName*/
]);
const selectedBranch = ref(null);
const fileTree = ref([]);
const shaOfSelectedFile = ref("" /*file`s sha*/);
const selectedFile = reactive({
  label: "",
  mode: "",
  path: "",
  sha: "",
  type: "",
  url: "",
});
const contentOfSelectedFile = reactive({
  render: false,
  textContent: "파일을 선택해주세요.",
  url: "",
  sha: "",
});
const treeRef = ref(null);
watch(selectedBranch, (selectedBranch) => {
  getFilesFromRoot(repo.repoName, selectedBranch);
});
// 파일 트리에서 파일 선택시 현재 파일의 sha 정보를 업데이트.
watch(shaOfSelectedFile, () => {
  const file = treeRef.value.getNodeByKey(shaOfSelectedFile.value);
  selectedFile.label = file.label;
  selectedFile.path = file.path;
  selectedFile.mode = file.mode;
  selectedFile.path = file.path;
  selectedFile.sha = file.sha;
  selectedFile.type = file.type;
  selectedFile.url = file.url;
  console.debug("selectedFile", selectedFile);
  console.log("Sha-1 of selected file.", shaOfSelectedFile.value);
});

// 선택된 파일의 sha 정보가 업데이트 되면 파일 내용을 가져옴.
watch(selectedFile, () => {
  console.log("Selected file.", selectedFile);
  getFileContent();
});
const getFilesFromRoot = (repoName, branchName) => {
  // 루트 경로의 파일 목록 가져오기
  api
    .get(`/git/repo/tree`, {
      params: {
        branchName: `${encoding(branchName)}`,
        repoName: `${repoName}`
      },
    })
    .then((resolve) => {
      const retrievedFiles = resolve.data;

      fileTree.value = retrievedFiles.map((retrievedFile) => {
        const file = {
          label: retrievedFile.path,
          path: retrievedFile.path,
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

const getFilesFromTreeSha = ({repoName, branchName, treeSha}) => {
  return api
    .get(`/git/repo/tree`, {
      params: {
        branchName: `${encoding(branchName)}`,
        treeSha: `${treeSha}`,
        repoName: `${repoName}`
      },
    })
    .then((resolve) => {
      return {appendTree: resolve?.data};
    })
    .catch((error) => {
      throw new Error("파일 목록가져오기 실패.");
    });
};

const getFileContent = () => {
  if (selectedFile.mode !== "100644") {
    contentOfSelectedFile.textContent = "이 파일은 렌더링 할 수 없습니다.";
    contentOfSelectedFile.sha = "";
    contentOfSelectedFile.url = "";
    contentOfSelectedFile.render = false;
    return;
  }
  api
    .get(`/git/repo/file/string`, {
      params: {
        branchName: `${encoding(selectedBranch.value)}`,
        sha: `${selectedFile.sha}`,
        repoName: `${repoName.value}`
      },
    })
    .then((resolve) => {
      console.log("Read file`s text content", resolve.data);
      $q.notify({
        color: "primary",
        message: resolve.message,
        icon: "check",
      });
      const file = resolve.data;
      contentOfSelectedFile.textContent = file.textContent;
      contentOfSelectedFile.sha = file.sha;
      contentOfSelectedFile.url = file.url;
      contentOfSelectedFile.render = true;
    })
    .catch((error) => {
      $q.notify({
        color: "warning",
        message: error.message,
        icon: "report_problem",
      });
    });
};

const onLazyLoad = ({node, key, done, fail}) => {
  // 파일트리 지연생성
  if (node.type !== "tree") {
    done([]);
    return;
  }
  getFilesFromTreeSha({
    repoName: repo.repoName,
    branchName: selectedBranch.value,
    treeSha: node.sha,
  })
    .then(({appendTree}) => {
      const newTree = appendTree.map((file) => {
        const res = {
          label: file.path,
          path: node.path + "/" + file.path,
          sha: file.sha,
          type: file.type,
          mode: file.mode,
          url: file.url,
          icon: getTreeIcon(file.mode),
        };
        if (file.type === "tree") res.lazy = true;
        return res;
      });
      done(newTree);
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

// 삭제
const deleteFile = () => {
  api
    .delete("/document", {
      data: {
        branchName: selectedBranch.value,
        path: selectedFile.path,
        repoName: repo.repoName,
        fileSha: selectedFile.sha,
        mode: selectedFile.mode,
      },
    })
    .then((resolve) => {
      $q.notify({
        color: "primary",
        message: resolve.message,
        icon: "check",
      });
      updatePage();
    });
};

import hljs from "highlight.js";
import "highlight.js/styles/default.css";
import prettier from "prettier/standalone";

const isMarkdown = computed(() => selectedFile.path.endsWith(".md"));
const code = computed(() => {
  const text = contentOfSelectedFile.textContent;
  let formatted;
  try {
    formatted = prettier.format(text, {
      parser: "babel",
      plugins: [prettierPlugins],
    });
  } catch (e) {
    formatted = text;
  }
  return hljs.highlightAuto(formatted).value;
});

const updatePage = () => setTimeout(() => router.go(0), 1000);

const isUpdate = () => {
};
const updateFile = () => {
  const document = {
    content: contentOfSelectedFile.textContent,
    repoName: repo.repoName,
    branchName: selectedBranch.value,
    path: selectedFile.path,
  };
  api.put("/document", document).then(({message, data}) => {
    $q.notify({
      color: "primary",
      message: message,
      icon: "check",
    });
    updatePage();
  });
};
/*

const prompt2 = ref(false)
const typeName = ref("")
const addDirectory = () => {
  console.log(treeRef.value)
  prompt2.value = true
  treeRef.value.getNodeByKey(selectedFile.sha).children.push({
    label: typeName.value,
    path: selectedFile.path + typeName.value,
    type: "tree",
    mode: "040000",
    icon: "folder",
    new: true,
    lazy: true
  })
  console.log("#$#$$#$#", treeRef.value.getNodeByKey(selectedFile.sha))
}

const addFile = () => {

}

*/

const promptSaveFile = ref(false);
const newName = ref("");
const newPath = ref("");
const saveNew = () => {
  promptSaveFile.value = false;
  const document = {
    content: contentOfSelectedFile.textContent,
    repoName: repo.repoName,
    branchName: selectedBranch.value,
    path: newPath.value,
    filename: newName.value,
    extension: "md",
  };
  api.post("/document", document).then(({message, data}) => {
    $q.notify({
      color: "primary",
      message: message,
      icon: "check",
    });
    updatePage();
  });
};

const newBranchPrompt = ref(false);
const newBranchName = ref("");
const createBranch = () => {
  newBranchPrompt.value = false;
  const data = {
    baseBranchName: selectedBranch.value,
    newBranchName: newBranchName.value,
    repoName: repo.repoName,
  };
  api.post("/git/branch", data).then(({message, data}) => {
    $q.notify({
      color: "primary",
      message: message,
      icon: "check",
    });
    updatePage();
  });
};

const deleteBranch = () => {
  const data = {
    branchName: selectedBranch.value,
    repoName: repo.repoName,
  };
  api.delete("/git/branch", {data}).then(({message, data}) => {
    $q.notify({
      color: "primary",
      message: message,
      icon: "check",
    });
    updatePage();
  });
};
</script>

<template>
  <!--  repo list-->
  <div class="q-pa-md example-column-row-width">
    <q-splitter v-model="splitterModel1">
      <template v-slot:before>
        <div class="q-pa-md example-column-row-width">
          <!--          <div class="row justify-center">
                      <q-btn class="col" outline size="10px" label="+ directory" @click="addDirectory"></q-btn>
                      <q-btn class="col" outline size="10px" label="+ file" @click="addFile"></q-btn>
                      <q-dialog v-model="prompt2" persistent>
                        <q-card style="min-width: 350px">
                          <q-card-section>
                            <div class="text-h6">Insert Name</div>
                          </q-card-section>

                          <q-card-section class="q-pt-none">
                            <q-input label="New Name" dense v-model="typeName" autofocus @keyup.enter="prompt2 = false"/>
                          </q-card-section>

                          <q-card-actions align="right" class="text-primary">
                            <q-btn flat label="Cancel" v-close-popup/>
                            <q-btn flat label="Ok" v-close-popup/>
                          </q-card-actions>
                        </q-card>
                      </q-dialog>
                    </div>-->
          <div class="column" style="height: max-content">
            <q-tree
              ref="treeRef"
              :nodes="fileTree"
              node-key="sha"
              label-key="label"
              accordion
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
        <div class="q-ma-lg-xl row">
          <div class="col-sm-3">
            <div class="text-h4 q-mb-md">{{ repo.repoFullName }}</div>
            <p>{{ repo.htmlUrl }}</p>
          </div>
          <div class="col-sm-3">
            <div class="q-gutter-x-md">
              <q-select
                style="width: 150px"
                outlined
                dense
                v-model="selectedBranch"
                :options="branchNameList"
                label="Branch"
              />
            </div>
          </div>

          <div class="row absolute-top-right">
            <div class="col-5">
              <q-btn
                style="width: 148px"
                label="New Branch"
                outline
                push
                @click="newBranchPrompt = true"
              ></q-btn>
            </div>
            <div class="col-5">
              <q-btn
                label="Get Markdown"
                outline
                push
                @click="prompt = true"
              ></q-btn>
            </div>
            <div class="col-5">
              <q-btn
                label="Delete Branch"
                outline
                push
                @click="deleteBranch"
              ></q-btn>
            </div>
            <div class="col-4">
              <q-btn
                style="width: 149px"
                label="Go Repo List"
                to="/user/repo"
                outline
                push
              ></q-btn>
            </div>
          </div>
        </div>
        <div class="row">
          <div class="q-pa-md">
            <q-splitter
              v-model="splitterModel2"
              style="height: 500px; width: 1000px"
            >
              <template v-slot:separator>
                <q-avatar
                  color="primary"
                  text-color="white"
                  size="28px"
                  icon="fas fa-arrows-alt-h"
                />
              </template>
              <template v-slot:before>
                <div class="q-pa-md">
                  <textarea
                    v-model="contentOfSelectedFile.textContent"
                    rows="20"
                    :class="{ 'text-white bg-dark': $q.dark.isActive }"
                    class="fit q-pa-sm"
                  />
                </div>
              </template>
              <template v-slot:after>
                <div class="q-pa-md" style="height: 467px">
                  <q-markdown
                    v-if="isMarkdown"
                    :src="contentOfSelectedFile.textContent"
                  ></q-markdown>
                  <pre v-else v-html="code"></pre>
                </div>
              </template>
            </q-splitter>
          </div>
        </div>
      </template>
    </q-splitter>
  </div>
  <div
    class="row justify-center fixed-bottom-right"
    style="right: 50px; bottom: 50px"
  >
    <div class="col col-sm-3">
      <q-btn
        style="width: 67px"
        label="New"
        outline
        push
        @click="
          () => {
            contentOfSelectedFile.textContent = '';
          }
        "
      ></q-btn>
      <q-btn
        label="Save"
        outline
        push
        @click="
          () => {
            promptSaveFile = true;
          }
        "
      ></q-btn>
    </div>

    <div class="col">
      <q-btn label="Update" outline push @click="updateFile"></q-btn>
    </div>
    <div class="col">
      <q-btn label="Delete" @click="deleteFile" outline push></q-btn>
    </div>
  </div>
  <q-dialog v-model="newBranchPrompt" persistent>
    <q-card style="min-width: 350px">
      <q-card-section>
        <div class="text-h6">New Branch</div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <q-input dense v-model="newBranchName" autofocus/>
      </q-card-section>

      <q-card-actions align="right" class="text-primary">
        <q-btn flat label="Ok" v-close-popup/>
        <q-btn flat label="Submit" @click="createBranch"/>
      </q-card-actions>
    </q-card>
  </q-dialog>

  <q-dialog v-model="prompt" persistent>
    <q-card style="min-width: 350px">
      <q-card-section>
        <div class="text-h6">Address</div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <q-input dense v-model="address" autofocus/>
      </q-card-section>
      <q-card-section>
        <div class="text-h6">File Name</div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <q-input dense v-model="name" autofocus/>
      </q-card-section>

      <q-card-actions align="right" class="text-primary">
        <q-btn flat label="Ok" v-close-popup/>
        <q-btn flat label="Submit" @click="getMarkdown"/>
      </q-card-actions>
    </q-card>
  </q-dialog>

  <q-dialog v-model="promptSaveFile" persistent>
    <q-card style="min-width: 350px">
      <q-card-section>
        <div class="text-h6">Path</div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <q-input dense v-model="newPath" autofocus/>
      </q-card-section>
      <q-card-section>
        <div class="text-h6">File Name</div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <q-input dense v-model="newName" autofocus/>
      </q-card-section>

      <q-card-actions align="right" class="text-primary">
        <q-btn flat label="Cancel" v-close-popup/>
        <q-btn flat label="Submit" @click="saveNew"/>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<style></style>
