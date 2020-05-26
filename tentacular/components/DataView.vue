<template>
  <div class="pane">
    {{octopusData}}
  </div>
</template>

<script>
export default {
  name: 'DataView',
  props: {
    octopusData: Object
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
