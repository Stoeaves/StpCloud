<template>
  <div
    class="login"
    v-if="!isLoggedIn"
  >
    <h1 class="text-[28px] font-bold">管理员登录</h1>
    <input
      type="password"
      id="password"
      placeholder="请输入管理员密码"
      @input="pwd = $event.target.value"
    />
    <button
      id="loginSubmit"
      @click="checkLogin(pwd)"
    >
      登录
    </button>
  </div>
  <div
    id="index"
    v-if="isLoggedIn"
  >
    <Header>
      <HeaderButton
        v-if="path === '/'"
        text="新建文件夹"
        icon="folder"
        colorStyle="#ff8e15"
        @click="showCreateFolder = true"
      ></HeaderButton>

      <HeaderButton
        text="上传"
        icon="upload"
        @click="showUpload = true"
      ></HeaderButton>
    </Header>

    <PathBar></PathBar>

    <FileList></FileList>

    <!-- Marks -->
    <Mark
      title="新建文件夹"
      v-if="showCreateFolder"
      @close="showCreateFolder = false"
    >
      <CreateFolder></CreateFolder>
    </Mark>

    <Mark
      title="上传文件"
      v-if="showUpload"
      @close="showUpload = false"
    >
      <Upload></Upload>
    </Mark>
  </div>
</template>

<script setup>
  import { inject, ref } from 'vue';
  import Header from '@/contents/Header.vue';
  import PathBar from '@/contents/PathBar.vue';
  import FileList from '@/contents/FileList.vue';

  import checkPassword from '../utils/Admin';

  import HeaderButton from '@/components/HeaderButton.vue';
  import Mark from '@/components/Mark.vue';
  import Upload from '@/components/Upload.vue';
  import CreateFolder from '@/components/CreateFolder.vue';

  const path = inject('path');

  const isLoggedIn = ref(false);
  const pwd = ref('');
  const showUpload = ref(false);
  const showCreateFolder = ref(false);

  const checkLogin = async (pwd) => {
    const res = await checkPassword(pwd);
    if (res.code === 200) {
      isLoggedIn.value = true;
      localStorage.setItem('adminPassword', pwd);
      cocoMessage.success('登录成功');
    } else {
      cocoMessage.error('验证失败');
    }
  };

  (async () => {
    const adPwd = localStorage.getItem('adminPassword');
    if (!adPwd) return;

    await checkLogin(adPwd);
  })();
</script>

<style>
  #app {
    display: grid;
  }
</style>

<style scoped>
  .login {
    display: grid;
    max-width: 360px;
    position: relative;
    z-index: 9999;
    text-align: center;
    gap: 20px;
    width: 100%;
    place-self: center;
    padding: 20px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  }
  .login input {
    padding: 10px;
    border: 1px solid #ced4da;
    border-radius: 4px;
    outline: none;
  }
  .login button {
    padding: 10px;
    border: none;
    border-radius: 4px;
    background: var(--primary);
    color: white;
    font-size: 16px;
    cursor: pointer;
    transition: background 0.3s;
  }
  .login button:hover {
    background: #0056b3;
  }
</style>
