<template>
  <div id="appindex">
  <div class="topbar">
    <h2>Octopus Deploy Step History Tool</h2>
  </div>
  <div class="url_input_area">
    <form @submit.prevent="setUrl">
      <input class="urlinput" type="text" v-model="url" name="url" placeholder="Octopus Server Url">
      <input class="apiinput" type="password" v-model="apiKey" name="apiKey" placeholder="Api Key">
      <input class="connect" type="submit" value="connect">
      <span class="resp_code">Last Response Code: {{ $store.state.data.responseCode }}</span>
    </form>
  </div>
  <div class="selection_area">
    <div class="selector">
      <select class="dropdown" name="add_name">
        <option>Select A Project:</option>
        <option value="value1">option1</option>
        <option value="value2">option2</option>
      </select>
    </div>
    <div class="selector">
      <select class="dropdown" name="add_name">
        <option>Select Release Step:</option>
        <option value="value1">option1</option>
        <option value="value2">option2</option>
      </select>
    </div>
  </div>
  <div class="dvpane"><DataView /></div>
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
      apiKey: ''
    }
  },
  methods: {
    async setUrl (submitEvent) {
      this.url = submitEvent.target.elements.url.value
      this.apiKey = submitEvent.target.elements.apiKey.value
      const config = {
        headers: {
          Accept: 'application/json',
          'X-NuGet-ApiKey': this.apiKey,
          OctUrl: `${this.url}/api/serverstatus/health`
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
        console.log(res.data.data)
        console.log(res.data.status)
      } catch (error) {
        this.$store.commit('data/SET_CODE', 'Error')
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
  width: 35rem;
  color: #dcdde17c;
  padding-bottom: .25rem;
}

.url_input_area .apiinput {
  margin-left: 1.5rem;
  font-size: 1.25rem;
  background: #273c75;
  outline: none;
  border: 1px solid #dcdde136;
  border-radius: .5rem;
  width: 25rem;
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
