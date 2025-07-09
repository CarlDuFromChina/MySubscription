<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
  export default {
    name: 'my-subscription'
  }
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  background: #f5f7fa;
  color: #333;
}

#app {
  width: 100%;
  height: 100vh;
  overflow: auto;
}
</style>
