<template>
  <router-view></router-view>
</template>
<script setup>
  import { provide, ref, reactive, watch } from 'vue';
  import request from './utils/Request';

  const list = reactive({
    folders: [],
    files: [],
  });
  const path = ref('/');
  const pathInfo = reactive([
    {
      path: '/',
      name: '首页',
    },
  ]);

  provide('list', list);
  provide('path', path);
  provide('pathInfo', pathInfo);

  // 加载文件列表
  (async () => {
    const filesRes = await request.get('/list');
    const foldersRes = await request.get('/folderList');

    list.files = filesRes;
    list.folders = foldersRes;

    watch(path, async (newPath) => {});
  })();
</script>
