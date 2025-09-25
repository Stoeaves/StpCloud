<template>
  <div class="pathBar">
    <p>当前目录：</p>
    <a @click="returnIndex()">首页</a>
    <span v-if="pathInfo.length > 1">/</span>
    <a
      v-if="pathInfo.length > 1"
      @click="$router.push('/' + pathInfo[1].path)"
    >
      {{ pathInfo[1].name }}
    </a>
  </div>
</template>
<script setup>
  import { inject } from 'vue';
  const path = inject('path');
  const pathInfo = inject('pathInfo');

  const returnIndex = () => {
    path.value = '/';
    if (pathInfo.length > 1) pathInfo.pop();
  };
</script>
<style scoped>
  .pathBar {
    background: white;
    border-radius: 12px;
    padding: 30px;
    box-shadow: var(--shadow);
    margin-bottom: 30px;
    display: flex;
    gap: 5px;
  }

  .pathBar a {
    color: var(--primary);
    text-decoration: none;
    cursor: pointer;
  }

  .pathBar a:hover {
    text-decoration: underline;
  }
</style>
