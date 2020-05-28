<template>
  <div id="appindex">
  <div class="topbar">
    <h2>Octopus Deploy Step History Tool</h2>
  </div>
  <div class="url_input_area">
    <form @submit.prevent="setUrl">
      <input class="urlinput" type="text" v-model="url" name="url" placeholder="Octopus Server Url">
      <input class="apiinput" type="password" v-model="apiKey" name="apiKey" placeholder="Api Key">
      <input
        class="sslcheckbox"
        type="checkbox"
        id="sslcheck"
        v-model="sslCheck"
        value="true">
      <label class="sslcheck" for="sslcheck">Verify SSL</label>
      <input class="connect" type="submit" value="connect">
      <span class="resp_code">Last Response: {{ $store.state.data.responseCode }}</span>
    </form>
  </div>
  <div class="selection_area">
    <div class="selector">
      <select v-if="$store.state.data.allProjects" v-model="selectedProject" @change="getProjectSteps" class="dropdown">
        <option>Select A Project:</option>
        <option
          v-for="(item,key) in $store.state.data.allProjects"
          :key="key"
          :value="item.Id">
          {{item.Name}}
        </option>
      </select>
      <span v-else @click="getProjects" class="dropdown">
        Select A Project:
      </span>
    </div>
    <div class="selector">
      <select v-if="selectedProject != 'Select A Project:'" v-model="selectedStep" class="dropdown" >
        <option>Release Step:</option>
        <option
          v-for="(item,key) in $store.state.data.projectSteps"
          :key="key"
          :value="item">
          {{item}}
        </option>
      </select>
      <span v-else class="dropdown">
        Release Step:
      </span>
    </div>
  </div>
  <div class="dvpane"><DataView :octopusData="taskData" /></div>
  </div>
</template>

<script>
import axios from 'axios'
import DataView from '../components/DataView.vue'

export default {
  name: 'App',
  components: {
    DataView
  },
  data () {
    return {
      url: '',
      apiKey: '',
      sslCheck: true,
      selectedProject: 'Select A Project:',
      selectedStep: 'Release Step:',
      displayData: { test: 'test1output', test2: 'test2output' }
    }
  },
  computed: {
    taskData () {
      if (this.selectedStep === 'Release Step:') {
        return this.$store.state.data.projectTasks
      } else {
        return 'No task data yet'
      }
    }
  },
  created () {
    // later
    this.$store.commit('data/SET_CODE', '')
    this.$store.commit('data/SET_PROJECTS', undefined)
    this.$store.commit('data/SET_STEPS', undefined)
  },
  methods: {
    async getData (apiEndpoint) {
      const config = {
        headers: {
          Accept: 'application/json',
          'X-NuGet-ApiKey': this.apiKey,
          OctUrl: `${this.url}/${apiEndpoint}`,
          verifySSL: this.sslCheck
        }
      }
      try {
        const res = await axios.get('/api', config)
        // axios wont handle errors using a custom http agent so doing some here
        if (res.data.data === undefined) {
          this.$store.commit('data/SET_CODE', 'Error')
        } else {
          this.$store.commit('data/SET_CODE', res.data.status)
        }
        console.log('sent axios request to backend')
        console.log(config.headers.OctUrl)
        return res.data.data
      } catch (error) {
        this.$store.commit('data/SET_CODE', 'Error')
      }
    },
    setUrl (submitEvent) {
      this.url = submitEvent.target.elements.url.value
      this.apiKey = submitEvent.target.elements.apiKey.value
      this.getData('api/serverstatus/health')
    },
    async getProjects () {
      this.$store.commit('data/SET_PROJECTS', await this.getData('api/projects/all'))
    },
    async getTasks () {
      // paginated obv
      const taskList = []
      let getNext = true
      let pagedUrl = 'api/tasks/?project=' + this.selectedProject.replace(/\s+/g, '')
      do {
        const taskListRaw = await this.getData(pagedUrl)
        console.log(taskListRaw)
        let task
        for (task of taskListRaw.Items) {
          const taskLine = []
          taskLine[0] = task.Id
          taskLine[1] = task.Description
          taskLine[2] = task.State
          taskLine[3] = task.Completed
          taskList.push(taskLine)
          if (!taskListRaw.Links['Page.Next']) {
            getNext = false
          } else {
            pagedUrl = taskListRaw.Links['Page.Next']
          }
        }
      }
      while (getNext === true)
      this.$store.commit('data/SET_TASKS', taskList)
      // console.log(this.$store.state.data.projectTasks)
    },
    async getLastProjectDeployment () {
      try {
        // gets latest deployment process from a project
        // regex to get rid a a bug where spaces cause an issue
        const lastDep = await this.getData('api/deployments?projects=' + this.selectedProject.replace(/\s+/g, ''))
        const depDetails = await this.getData('api/deploymentprocesses/' + lastDep.Items[0].DeploymentProcessId)
        return depDetails
      } catch (error) {
        console.log(error)
      }
    },
    async getProjectSteps () {
      try {
        this.selectedStep = 'Release Step:'
        const depDetails = await this.getLastProjectDeployment()
        const stepList = []
        let stepNum = 0
        let step
        for (step of depDetails.Steps) {
          stepNum++
          let action
          let substepNum = 0
          for (action of step.Actions) {
            if (step.Actions.length > 1) {
              substepNum++
              stepList.push(stepNum + '.' + substepNum + ' - ' + action.Name)
            } else {
              stepList.push(stepNum + ' - ' + action.Name)
            }
          }
        }
        console.log(stepList)
        this.$store.commit('data/SET_STEPS', stepList)
        await this.getTasks()
      } catch (error) {
        console.log(error)
      }
    },
    getStepFromTask (taskDetailLogs, step) {
      let ActivityLog
      for (ActivityLog of taskDetailLogs) {
        // if ActivityLog.Name starts with 'Step' and also matches our step var
        if (ActivityLog.Name.startsWith('Step') && ActivityLog.Name.includes(step)) {
          // if The NON step: portion of the name (our step var) does not occur in any section under ActivityLog.Children stringified 
          // then we can assume that the top level Name corresponds to the actual step task history and pull it
          // else we can assume that we need to loop over children and .children to find the Step match instead and pull the time/status etc out of there
        } else {
          continue
        }
      }
    },
    async getStepHistory () {
      // idea here is to use the store of tasks and grab all details needed from each task detail output and create a line with it
      const stepTasks = []
      let taskLine
      for (taskLine of this.$store.state.data.projectTasks) {
        const stepLine = []
        const taskId = taskLine[0]
        const taskDetail = await this.getData('api/tasks/' + taskId + '/details')
        this.getStepFromTask(taskDetail.ActivityLogs, this.selectedStep)
        console.log(stepTasks)
        console.log(stepLine)
        console.log(taskDetail)
      }
    }
  }

}
</script>
<style>

* {
    padding: 0;
    margin: 0;
    box-sizing: border-box;
    scrollbar-width: thin;
}
#appindex {
  background: #192a56;
  height: 100vh;
  display: flex;
  flex-flow: column;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.topbar {
  background-color: #273c75;
  color: #dcdde1;
  padding: 1rem;
  margin-bottom: 1rem;
  text-align: left;
  border-bottom: 1px solid #dcdde133;
}

.url_input_area {
  padding: 1rem;
}

.url_input_area .urlinput {
  font-size: 1.25rem;
  background: transparent;
  border: none;
  outline: none;
  border-bottom: 2px solid #dcdde1;
  width: 25rem;
  color: #dcdde17c;
  padding-bottom: .25rem;
}

.url_input_area .sslcheck {
  font-size: 1rem;
  background: transparent;
  border: none;
  outline: none;
  color: #dcdde17c;
}

.url_input_area .sslcheckbox {
  margin-left: .5rem;
  width: .75rem;
  height: .75rem;
}

.url_input_area .apiinput {
  margin-left: 1.5rem;
  font-size: 1.25rem;
  background: #273c75;
  outline: none;
  border: 1px solid #dcdde136;
  border-radius: .5rem;
  width: 18rem;
  color: #dcdde17c;
  padding: .25rem;
}

.url_input_area .connect {
  margin-left: 1rem;
  padding: .3rem;
  font-size: 1.25rem;
  background: #273c75;
  border: 1px solid #dcdde136;
  border-radius: 1rem;
  outline: none;
  color: #dcdde1da;
}

.resp_code {
  margin-left: 2rem;
  color: #dcdde167;
}

.selection_area {
  padding: 1rem;
  background-color: #273c75;
  margin: 1rem;
  height: 5rem;
  border: 1px solid #273c75;
  box-shadow: -1px 1px 5px #00000079;
  display: flex;
  align-items: center;
}

.selector {
  width: 10rem;
  margin-left: 10rem;
}
.dropdown {
  font-size: 1.25rem;
  background: transparent;
  border: none;
  outline: none;
  width: auto;
  color: #dcdde17c;
}

.dropdown option {
  background-color: #273c75;
}

.dvpane {
  margin: 1rem;
  padding: .5rem;
  flex: 1;
  overflow: hidden;
  overflow-y: auto;
  border: 1px solid #273c75;
  box-shadow: -1px 1px 5px #00000079;
  background-color: #273c75;
}

.dvpane::-webkit-scrollbar {
  width: 5px;
}
/* Track */
.dvpane::-webkit-scrollbar-track {
  background: #192a56;
}

/* Handle */
.dvpane::-webkit-scrollbar-thumb {
  background: #888;
}

/* Handle on hover */
.dvpane::-webkit-scrollbar-thumb:hover {
  background: #555;
}

</style>
