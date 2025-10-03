<template>
  <div
    id="pathBar"
    class="custom-container flex gap-[5px]"
  >
    <p>当前目录：</p>
    <a @click="returnIndex()">首页</a>
    <div
      v-if="pathInfo.length > 1"
      v-for="pathItem in pathInfo.slice(1)"
      class="flex gap-[5px]"
    >
      <p>/</p>
      <a
        @click="
          console.log(pathInfo.slice(1), pathItem);
          changePath(pathItem);
        "
        >{{ pathItem.name }}</a
      >
    </div>
  </div>
</template>
<script setup>
  import { inject } from 'vue';
  const path = inject('path');
  const pathIndex = inject('pathIndex');
  const pathInfo = inject('pathInfo');

  const returnIndex = () => {
    path.value = '/';
    pathIndex.value = 0;
    pathInfo.length = 1;
  };

  const changePath = (pathItem) => {
    if (pathItem.path === path.value) return;
    path.value = pathItem.path;
    pathIndex.value = pathItem.index;
    pathInfo.length = pathItem.index + 1;
  };
</script>
<style scoped>
  #pathBar a {
    color: var(--primary);
    text-decoration: none;
    cursor: pointer;
  }

  #pathBar a:hover {
    text-decoration: underline;
  }
</style>
