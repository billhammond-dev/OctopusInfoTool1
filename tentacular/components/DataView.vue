<template>
  <div class="pane">
    <span v-for="line in octopusData" :key="line.key">{{ line }}<br></span>
  </div>
</template>

<script>
export default {
  name: 'DataView',
  props: {
    octopusData: Array
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.pane {
  overflow-wrap: break-word;
  color: #dcdde1;
}
</style>
