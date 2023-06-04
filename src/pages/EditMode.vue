<template>
  <header>
    <h1>Open a GitHub repo with the StackBlitz SDK</h1>
    <nav>
      <label>
        Repo:
        <select v-model="selectedRepo">
          <option value="vite">Vite (Vanilla JS)</option>
        </select>
      </label>
      <button @click="embedProject()">Embed project</button>
      <button @click="openProject()">Open in new window</button>
    </nav>
  </header>

  <div id="embed">
    <p>Embed will go here</p>
  </div>
</template>

<script>
import sdk from "@stackblitz/sdk";

const REPOS = {
  vite: {
    github: "shk95/GitEditor-frontend",
    openFile: "README.md",
  },
};

export default {
  data() {
    return {
      selectedRepo: REPOS.vite,
    };
  },
  methods: {
    async embedProject() {
      await sdk.embedGithubProject("embed", this.selectedRepo.github, {
        height: 400,
        openFile: this.selectedRepo.openFile,
      });
    },
    openProject() {
      sdk.openGithubProject(this.selectedRepo.github, {
        openFile: this.selectedRepo.openFile,
      });
    },
    setRepo(value) {
      this.selectedRepo = REPOS[value];
      // if already embedded, update the embed
      if (document.getElementById("embed")?.nodeName === "IFRAME") {
        this.embedProject();
      }
    },
  },
  watch: {
    selectedRepo(newVal, oldVal) {
      if (newVal !== oldVal) {
        this.setRepo(newVal);
      }
    },
  },
};
</script>

<style scoped>
html {
  height: 100%;
  text-align: center;
  font-family: system-ui, sans-serif;
  color: black;
  background-color: white;
}

body {
  height: 100%;
  margin: 0;
  display: flex;
  flex-direction: column;
}

h1 {
  margin: 1rem;
  font-size: 1.25rem;
}

nav {
  margin: 1rem;
  font-size: 0.9rem;
}

select,
button {
  margin: 0.2em;
  padding: 0.2em 0.5em;
  font-size: inherit;
  font-family: inherit;
}

#embed {
  display: flex;
  flex: 1 1 60%;
  flex-direction: column;
  justify-content: center;
  overflow: hidden;
  width: 100%;
  height: auto;
  margin: 0;
  border: 0;
}

#embed > p {
  width: min(300px, 100%);
  margin: 2rem auto;
  padding: 4rem 1rem;
  border: dashed 2px #ccc;
  border-radius: 0.5em;
  font-size: 85%;
  color: #777;
}
</style>
<style>
body {
  margin: 0;
}

.editor {
  height: 100vh;
  display: flex;
}

.input,
.output {
  overflow: auto;
  width: 50%;
  height: 100%;
  box-sizing: border-box;
  padding: 0 20px;
}

.input {
  border: none;
  border-right: 1px solid #ccc;
  resize: none;
  outline: none;
  background-color: #f6f6f6;
  font-size: 14px;
  font-family: "Monaco", courier, monospace;
  padding: 20px;
}

code {
  color: #f66;
}
</style>
