export const state = () => ({
  responseCode: '',
  allProjects: [],
  projectDeployments: {},
  projectSteps: [],
  projectTasks: [],
  stepHistory: []
})

export const mutations = {
  SET_CODE (state, code) {
    state.responseCode = code
  },
  SET_PROJECTS (state, projects) {
    state.allProjects = projects
  },
  SET_DEPLOYMENTS (state, deployments) {
    state.projectDeployments = deployments
  },
  SET_STEPS (state, steps) {
    state.projectSteps = steps
  },
  SET_TASKS (state, tasks) {
    state.projectTasks = tasks
  },
  SET_STEPHISTORY (state, lines) {
    state.stepHistory = lines
  },
  ADD_STEPHISTORY (state, line) {
    state.stepHistory.push(line)
  }
}
