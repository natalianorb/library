<template>
  <div id="app">
    <router-view />
  </div>
</template>

<style lang="less">
#app {
  font-family: "Roboto", sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #000000;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
}

input {
  outline: none;
  color: #000000;
  font-size: 14px;

  &::placeholder {
    color: #9b9b9b;
  }
}

button {
  padding: 0;
  border: none;
  outline: none;
  color: #000000;
  cursor: pointer;
}
</style>
