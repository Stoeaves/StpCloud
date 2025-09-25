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

    sessionStorage.setItem('list', JSON.stringify(list));

    watch(path, async (newPath) => {
      const id = newPath.split('-').filter((item) => item)[1] ?? '';
      const folderInfo = foldersRes.map((item) => item).find((item) => item.id === Number(id));

      if (!id) {
        const sourceList = sessionStorage.getItem('list');
        const { folders, files } = JSON.parse(sourceList);

        list.folders.length = 0;
        list.files.length = 0;

        for (const file of files) {
          list.files.push(file);
        }

        for (const folder of folders) {
          list.folders.push(folder);
        }

        return;
      }

      if (folderInfo.permission === 'private') {
        // 非管理员
        if (!localStorage.getItem('adminPassword'))
          swal({
            title: '请输入密码',
            content: {
              element: 'input',
              attributes: {
                placeholder: '密码',
                type: 'password',
              },
            },
            buttons: true,
          }).then(async (password) => {
            if (!password) {
              returnIndex();
              return;
            }
            await enterPrivateFolder(password);
          });

        // 管理员
        await enterPrivateFolder(null);

        return;
      }

      list.folders.length = 0;
      list.files.length = 0;

      const filesRes = await request.get(`/list?path=${newPath}`);
      for (const file of filesRes) {
        list.files.push(file);
      }
    });
  })();

  const returnIndex = () => {
    path.value = '/';
    if (pathInfo.length > 1) {
      pathInfo.pop();
    }
  };

  const enterPrivateFolder = async (password) => {
    const pwd = password ?? '';
    const fileRes = await request.post('/list', { folderPass: pwd });
    if (fileRes.code === 401) {
      cocoMessage.error('验证失败');
      returnIndex();
      return;
    }

    list.folders.length = 0;
    list.files.length = 0;

    for (const file of fileRes) {
      list.files.push(file);
    }
  };
</script>
