<template>
  <div id="appindex">
  <div class="topbar">
    <div>
      <h2>Octopus Deploy Step History Tool</h2>
    </div>
    <div class="gitlink">
      <a href="https://github.com/billhammond-dev/OctopusInfoTool1" target="blank">github</a>
    </div>
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
      <span class="resp_code">Last Response: {{ $store.state.data.responseCode }} - {{ displayUrl }}</span>
    </form>
  </div>
  <div class="selection_area">
    <div :style="{visibility: showSpinner ? 'visible' : 'hidden'}" class="spinner"></div>
    <div class="stopbuttondiv" v-if="showProjectSelector">
      <img class="stopbutton" src='../static/stop.png' @click="stopStuff">
    </div>
    <div class="selector">
      <select v-if="showProjectSelector" v-model="selectedProject" @change="getProjectSteps" class="dropdown" :disabled="showSpinner === true">
        <option>Select A Project:</option>
        <option
          v-for="(item,key) in $store.state.data.allProjects"
          :key="key"
          :value="item.Id">
          {{item.Name}}
        </option>
      </select>
    </div>
    <div class="selector">
      <select v-if="showStepSelector" v-model="selectedStep" @change="getStepHistory" class="dropdown" :disabled="showSpinner === true">
        <option>Release Step:</option>
        <option
          v-for="(item,key) in $store.state.data.projectSteps"
          :key="key"
          :value="item">
          {{item[0]}}{{item[1]}} - {{item[2]}}
        </option>
      </select>
    </div>
    <div class="maxRecords" v-if="showStepSelector">
      <label for="maxRecords">Max Results</label>
      <input
        type="number"
        v-model="maxRecords"
        id="maxRecords"
        min="1"
        max="50"
        placeholder="5"
        default="5">
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
      selectedStep: ['', '', 'Release Step:'],
      showStepSelector: false,
      showProjectSelector: false,
      showSpinner: false,
      displayUrl: '',
      maxRecords: 5,
      stopRunning: false
    }
  },
  computed: {
    taskData () {
      if (this.selectedStep === 'Release Step:') {
        return [['Waiting For Step Selection...']]
      } else {
        return this.$store.state.data.stepHistory
      }
    },
    recMax () {
      return parseInt(this.maxRecords)
    }
  },
  created () {
    // later
    this.$store.commit('data/SET_CODE', '')
    this.$store.commit('data/SET_PROJECTS', undefined)
    this.$store.commit('data/SET_DEPLOYMENTS', undefined)
    this.$store.commit('data/SET_STEPS', undefined)
    this.$store.commit('data/SET_STEPHISTORY', [])
  },
  methods: {
    stopStuff () {
      if (this.stopRunning === false) {
        this.stopRunning = true
      }
    },
    async getData (apiEndpoint) {
      this.displayUrl = apiEndpoint
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
        return res.data.data
      } catch (error) {
        this.$store.commit('data/SET_CODE', 'Error')
      }
      this.displayUrl = ''
    },
    async setUrl (submitEvent) {
      this.showSpinner = true
      this.url = submitEvent.target.elements.url.value
      this.apiKey = submitEvent.target.elements.apiKey.value
      await this.getData('api/serverstatus/health')
      await this.getProjects()
      this.showSpinner = false
    },
    async getDeployments () {
      // so we need this populated for later. Its paginated so we will want to pull it in that way. I could try to pull out pagination into a function later
      const deployments = {}
      let getNext = true
      let pagedUrl = 'api/deployments/?projects=' + this.selectedProject.replace(/\s+/g, '')
      do {
        const depListRaw = await this.getData(pagedUrl)
        let deployment
        for (deployment of depListRaw.Items) {
          const depLine = {
            Version: deployment.Changes[0].Version,
            DeployedBy: deployment.DeployedBy,
            Name: deployment.Name,
            ReleaseNotes: deployment.Changes[0].ReleaseNotes
          }
          deployments[deployment.Id] = depLine
          if (!depListRaw.Links['Page.Next']) {
            getNext = false
          } else {
            pagedUrl = depListRaw.Links['Page.Next']
          }
        }
      }
      while (getNext === true && this.stopRunning === false)
      this.stopRunning = false
      this.$store.commit('data/SET_DEPLOYMENTS', deployments)
    },
    async getProjects () {
      this.showStepSelector = false
      this.showProjectSelector = false
      this.$store.commit('data/SET_PROJECTS', undefined)
      this.$store.commit('data/SET_DEPLOYMENTS', undefined)
      this.$store.commit('data/SET_STEPS', undefined)
      this.$store.commit('data/SET_STEPHISTORY', [])
      this.$store.commit('data/SET_PROJECTS', await this.getData('api/projects/all'))
      this.showProjectSelector = true
    },
    async getTasks () {
      // paginated obv
      const taskList = []
      let getNext = true
      let pagedUrl = 'api/tasks/?project=' + this.selectedProject.replace(/\s+/g, '')
      do {
        const taskListRaw = await this.getData(pagedUrl)
        let task
        for (task of taskListRaw.Items) {
          const taskLine = []
          taskLine[0] = task.Id
          taskLine[1] = task.Description
          taskLine[2] = task.State
          taskLine[3] = task.Completed
          taskLine[4] = task.Arguments.DeploymentId
          taskList.push(taskLine)
          if (!taskListRaw.Links['Page.Next']) {
            getNext = false
          } else {
            pagedUrl = taskListRaw.Links['Page.Next']
          }
        }
      }
      while (getNext === true && this.stopRunning === false)
      this.stopRunning = false
      this.$store.commit('data/SET_TASKS', taskList)
      // console.log(this.$store.state.data.projectTasks)
    },
    async getLastProjectDeployment () {
      try {
        // gets latest deployment process from a project
        // regex to get rid a a bug where spaces cause an issue
        const lastDep = await this.getData('api/deployments?projects=' + this.selectedProject.replace(/\s+/g, '') + '&take=1')
        const depDetails = await this.getData('api/deploymentprocesses/' + lastDep.Items[0].DeploymentProcessId)
        return depDetails
      } catch (error) {
        console.log(error)
      }
    },
    async getProjectSteps () {
      this.showSpinner = true
      this.showStepSelector = false
      try {
        await this.getDeployments()
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
              stepList.push([stepNum, '.' + substepNum, action.Name])
            } else {
              stepList.push([stepNum, '', action.Name])
            }
          }
        }
        this.$store.commit('data/SET_STEPS', stepList)
        await this.getTasks()
      } catch (error) {
        console.log(error)
      }
      this.showStepSelector = true
      this.showSpinner = false
    },
    getStepFromTask (taskDetailLogs, stepName, pattern, depId) {
      let ActivityLog
      for (ActivityLog of taskDetailLogs) {
        if (pattern.some(el => JSON.stringify(ActivityLog).includes(el))) {
          // so what we do here is look for an occurence of the patterns within the entire item first
          // then if found we see if the pattern also occurs in children, if so then we dont want this level of data and we call this recursively
          // if not found in children then this must be where the data is and we push it into the store
          if (pattern.some(el => JSON.stringify(ActivityLog.Children).includes(el))) {
            this.getStepFromTask(ActivityLog.Children, stepName, pattern, depId)
          } else {
            const pushLine = [
              ActivityLog.Ended,
              this.$store.state.data.projectDeployments[depId].Version,
              this.$store.state.data.projectDeployments[depId].DeployedBy,
              this.$store.state.data.projectDeployments[depId].Name,
              ActivityLog.Status,
              stepName,
              this.$store.state.data.projectDeployments[depId].ReleaseNotes
            ]
            // console.log(pushLine, depId, this.$store.state.data.projectDeployments[depId].Version)
            this.$store.commit('data/ADD_STEPHISTORY', pushLine)
          }
        } else {
          continue
        }
      }
    },
    async getStepHistory () {
      // idea here is to use the store of tasks and grab all details needed from each task detail output and create a line with it
      this.showSpinner = true
      const stepNum = this.selectedStep[0]
      const stepName = this.selectedStep[2]
      const pattern1 = '"Name":"Step ' + stepNum + ': ' + stepName + '"'
      const pattern2 = '"Name":"' + stepName + '"'
      const pattern = [pattern1, pattern2]
      this.$store.commit('data/SET_STEPHISTORY', [['Deployment Time', 'Release Version', 'Deployed By', 'Deployment Name', 'Status', 'StepName', 'Release Notes']])
      let taskLine
      for (taskLine of this.$store.state.data.projectTasks) {
        const taskId = taskLine[0]
        const depId = taskLine[4]
        const taskDetail = await this.getData('api/tasks/' + taskId + '/details')
        await this.getStepFromTask(taskDetail.ActivityLogs, stepName, pattern, depId)
        if (this.$store.state.data.stepHistory.length >= this.recMax + 1 || this.stopRunning === true) {
          this.stopRunning = false
          break
        }
      }
      this.showSpinner = false
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
  padding: .5rem;
  margin-bottom: 1rem;
  text-align: left;
  border-bottom: 1px solid #dcdde133;
  display: flex;
  justify-content: space-between;
}

.gitlink {
  width: 10rem;
  text-align: center;
  padding-top: .5rem;
  font-weight: 100;
  font-size: .75rem;
}

.gitlink a:link, a:visited {
  color:rgb(180, 180, 180);
}

.url_input_area {
  padding: 1rem;
}
/* Change Autocomplete styles in Chrome - really? why do we still have to do stuff like this */
input:-webkit-autofill,
input:-webkit-autofill:hover,
input:-webkit-autofill:focus,
textarea:-webkit-autofill,
textarea:-webkit-autofill:hover,
textarea:-webkit-autofill:focus,
select:-webkit-autofill,
select:-webkit-autofill:hover,
select:-webkit-autofill:focus {
  -webkit-text-fill-color: #dcdde17c;
  -webkit-box-shadow: 0 0 0px 0px rgba(0, 0, 0, 0) inset;
  transition: background-color 5000s ease-in-out 0s;
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
  color: #ffffff71;
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
  color: #ffffff71;
}

.spinner {
  display: inline-block;
  position: relative;
  width: 20px;
  height: 20px;
}
.spinner:after {
  content: " ";
  display: block;
  border-radius: 50%;
  width: 0;
  height: 0;
  margin: 2px;
  box-sizing: border-box;
  border: 8px solid #fff;
  border-color: rgb(212, 212, 212) transparent rgb(212, 212, 212) transparent;
  animation: spinner .8s infinite;
}
@keyframes spinner {
  0% {
    transform: rotate(0);
    animation-timing-function: cubic-bezier(0.55, 0.055, 0.675, 0.19);
  }
  50% {
    transform: rotate(900deg);
    animation-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1);
  }
  100% {
    transform: rotate(1800deg);
  }
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
  margin-left: 8rem;
}

.stopbuttondiv {
  margin-left: 1rem;
}

.stopbutton {
  width: 1.5rem;
  filter: invert(60%);
}

.maxRecords {
  margin-left: 20rem;
  width: 15rem;
  font-size: 1rem;
  background: transparent;
  color: #dcdde17c;
}

.maxRecords input {
  background: transparent;
  border: none;
  outline: none;
  color: #dcdde1;
  font-size: 1rem;
  opacity: .75;
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
