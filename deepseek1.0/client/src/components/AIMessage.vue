<template>
  <div class="ai-message">
    <div class="message-content" v-html="renderedText"></div>
  </div>
</template>

<script>
  import { marked } from 'marked';

  export default {
    name: 'AIMessage',
    props: {
      text: {
        type: String,
        required: true
      }
    },
    computed: {
      renderedText() {
        return marked(this.text);
      }
    }
  };
</script>

<style>
  .ai-message {
    margin: 10px 0;
    padding: 10px;
    background: #f0f0f0;
    border-radius: 8px;
  }

  .message-content {
    white-space: pre-wrap;
  }

  .message-content :deep(*) {
    margin: 0;
    line-height: 1.5;
  }
</style>