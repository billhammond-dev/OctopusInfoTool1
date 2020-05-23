import axios from 'axios'
import Vue from 'vue'
export default function () {
  function axiosGet (url, config) {
    try {
      const res = axios.get(url, config)
    } catch (error) {
      console.log(error)
    }
    return res
  }
}
Vue.use(axiosGet)