<template>
  <div id="app">
    <h1>Welcome to Your Vue.js App</h1>
    <LoadingSpinner v-if="isLoading" />
    <AIMessage :text="aiResponse" />
  </div>
</template>

<script>
  import AIMessage from './components/AIMessage.vue';
  import LoadingSpinner from './components/LoadingSpinner.vue';

  export default {
    name: 'App',
    components: {
      AIMessage,
      LoadingSpinner
    },
    data() {
      return {
        aiResponse: '这是AI的回答，将会逐字展示效果。',
        isLoading: false
      };
    },
    methods: {
      simulateLoading() {
        this.isLoading = true;
        setTimeout(() => {
          this.isLoading = false;
        }, 2000); // Simulate a 2-second loading time
      }
    },
    mounted() {
      this.simulateLoading();
    }
  };
</script>

<style>
  #app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    text-align: center;
    color: #2c3e50;
    margin-top: 60px;
  }
</style>