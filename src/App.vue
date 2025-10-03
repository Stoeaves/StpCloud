<template>
  <router-view></router-view>
</template>
<script setup>
  import { provide, ref, reactive, watch } from 'vue';
  import request from './utils/Request';

  // 清空sessionStorage
  sessionStorage.clear();

  const list = reactive({
    folders: [],
    files: [],
    requestStatus: 'pending',
  });
  const path = ref('/');
  const pathIndex = ref(0);
  const pathInfo = reactive([
    {
      path: '/',
      name: '首页',
      index: 0,
    },
  ]);

  provide('list', list);
  provide('path', path);
  provide('pathIndex', pathIndex);
  provide('pathInfo', pathInfo);

  // 加载文件列表
  const res = Promise.all([
    new Promise(async (resolve) => {
      const filesRes = await request.post('/list', { path: '/' });
      list.files = filesRes;
      resolve();
    }),
    new Promise(async (resolve) => {
      const foldersRes = await request.post('/folderList', { path: '/' });
      list.folders = foldersRes;
      resolve();
    }),
  ]);

  res
    .then(() => {
      sessionStorage.setItem('list_/', JSON.stringify(list));
      list.requestStatus = 'fulfilled';
    })
    .catch(() => {
      list.requestStatus = 'rejected';
      cocoMessage.error('加载失败');
    });

  watch(path, async (newPath) => {
    console.log(path.value, pathIndex.value, pathInfo);
    const id = newPath.split('/')[newPath.split('/').length - 2].split('-').pop() ?? '';
    const folderInfo = list.folders.map((item) => item).find((item) => item.id === Number(id));

    // 返回根目录
    if (!id) {
      const sourceList = sessionStorage.getItem('list_/');
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

    // 判断sessionStorage中是否存在
    if (sessionStorage.getItem(`list_${newPath}`)) {
      const sourceList = sessionStorage.getItem(`list_${newPath}`);
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
      if (!localStorage.getItem('adminPassword')) {
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
            backLastFolder();
            return;
          }
          await enterPrivateFolder(id, password);
        });

        return;
      }

      // 管理员
      await enterPrivateFolder(id, null);

      return;
    }

    // 公开文件夹

    list.folders.length = 0;
    list.files.length = 0;
    list.requestStatus = 'pending';

    Promise.all([
      new Promise(async (resolve) => {
        const filesRes = await request.post(`/list`, { path: `${newPath.slice(1, -1)}` });
        for (const file of filesRes) {
          list.files.push(file);
        }
        resolve();
      }),
      new Promise(async (resolve) => {
        const foldersRes = await request.post(`/folderList`, { path: `${newPath.slice(1, -1)}` });
        for (const folder of foldersRes) {
          list.folders.push(folder);
        }
        resolve();
      }),
    ]).then(() => {
      list.requestStatus = 'fulfilled';
      sessionStorage.setItem(`list_${newPath}`, JSON.stringify(list));
    });
  });

  const backLastFolder = () => {
    const pathItems = path.value.split('/').slice(1, -1);
    // 返回上一级
    if (pathItems.length > 1) {
      pathItems.length--;
      // 获取父目录
      const parentPath = `/${pathItems.join('/')}/`;
      path.value = parentPath;
      pathIndex.value--;
      pathInfo.pop();

      return;
    }

    returnIndex();
  };

  const returnIndex = () => {
    path.value = '/';
    pathIndex.value = 0;
    pathInfo.length = 1;
  };

  const enterPrivateFolder = async (folderID, password) => {
    list.requestStatus = 'pending';
    const pwd = password ?? '';

    list.folders.length = 0;
    list.files.length = 0;

    Promise.all([
      new Promise(async (resolve, reject) => {
        const filesRes = await request.post('/list', {
          path: `${path.value.slice(1, -1)}`,
          folderPass: pwd,
        });
        if (filesRes.code === 401) {
          reject();
          return;
        }
        for (const file of filesRes) {
          list.files.push(file);
        }
        resolve();
      }),
      new Promise(async (resolve, reject) => {
        const foldersRes = await request.post('/folderList', {
          path: `${path.value.slice(1, -1)}`,
          folderPass: pwd,
        });
        if (foldersRes.code === 401) {
          reject();
          return;
        }
        for (const folder of foldersRes) {
          list.folders.push(folder);
        }
        resolve();
      }),
    ])
      .then(() => {
        list.requestStatus = 'fulfilled';
        sessionStorage.setItem(`list_${path.value}`, JSON.stringify(list));
      })
      .catch(() => {
        list.requestStatus = 'rejected';
        cocoMessage.error('验证失败');
        backLastFolder();
      });
  };
</script>
