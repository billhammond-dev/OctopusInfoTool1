export const state = () => ({
  responseCode: '',
  allProjects: []
})

export const mutations = {
  SET_CODE (state, code) {
    state.responseCode = code
  },
  SET_PROJECTS (state, projects) {
    state.allProjects = projects
  }
}
