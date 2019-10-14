<template>
  <iframe :src="druidPath" width="100%" height="100%"  frameborder="no"></iframe>
</template>

<script>
  export default {
    name: "sqlLog",
    data() {
      return {
        druidPath: this.GLOBAL.baseurl + '/druid'
      }
    }
  }
</script>

<style scoped>

</style>
