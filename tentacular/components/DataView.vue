<template>
  <div class="pane">
    <div class = "viewtable">
      <table :style="{visibility: showTable ? 'visible' : 'hidden'}">
        <tr>
          <th v-for="column of octopusData[0]" :key="column">{{ column }}</th>
        </tr>
        <tr v-for="row of body" :key="row">
          <td v-for="element of row" :key="element">
            {{ element }}
          </td>
        </tr>
      </table>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DataView',
  props: {
    octopusData: {
      type: Array,
      default: () => []
    }
  },
  computed: {
    body () {
      return this.octopusData.slice(1)
    },
    showTable () {
      if (this.octopusData.length > 1) {
        return true
      } else {
        return false
      }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.pane {
  overflow-wrap: break-word;
  color: #dcdde1;
}

.viewtable {
  width: auto;
}

table {
  border-collapse: collapse;
}

th {
  position: sticky;
  border: none;
  background-color: #192a56;
}

tr:nth-child(odd) {
  background-color: #192a56;
}

th,td {
  padding: .5rem;
  white-space: nowrap;
}

td:last-child {
  width: 100%;
}
</style>
