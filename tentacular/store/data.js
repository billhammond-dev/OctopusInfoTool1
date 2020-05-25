export const state = () => ({
  responseCode: ''
})

export const mutations = {
  SET_CODE (state, code) {
    state.responseCode = code
  }
}
