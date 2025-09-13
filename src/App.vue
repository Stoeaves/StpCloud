<template>
  <router-view></router-view>
</template>
<script setup>
  import { provide, ref, reactive } from 'vue';
  import request from './utils/Request';

  const list = reactive({
    folders: [],
    files: [],
  });
  const path = ref('/');
  const pathInfo = reactive({});

  provide('list', list);
  provide('path', path);
  provide('pathInfo', pathInfo);

  // 加载文件列表
  (async () => {
    const filesRes = await request.get('/list');
    const foldersRes = await request.get('/folderList');

    list.files = filesRes;
    list.folders = foldersRes;
  })();
</script>
