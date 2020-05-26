export const state = () => ({
  responseCode: '',
  allProjects: [],
  projectSteps: [],
  projectTasks: []
})

export const mutations = {
  SET_CODE (state, code) {
    state.responseCode = code
  },
  SET_PROJECTS (state, projects) {
    state.allProjects = projects
  },
  SET_STEPS (state, steps) {
    state.projectSteps = steps
  },
  SET_TASKS (state, tasks) {
    state.projectTasks = tasks
  }
}
