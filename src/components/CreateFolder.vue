<template>
  <input
    :class="inputClass"
    type="text"
    id="folderName"
    placeholder="请输入文件夹名称"
    @input="folderName = $event.target.value"
  />
  <span>请选择文件夹权限：</span>
  <select
    :class="inputClass"
    @change="togglePwdInput"
  >
    <option value="public">公开</option>
    <option value="private">私密</option>
  </select>
  <div v-show="isPrivate">
    <input
      :class="inputClass"
      type="text"
      id="folderPass"
      placeholder="请输入文件夹密码"
      @input="folderPass = $event.target.value"
    />
  </div>
  <button
    @click="createFolder"
    class="w-full h-[48px] bg-[var(--primary)] text-white cursor-pointer rounded-[12px]"
  >
    创建
  </button>
</template>

<style scoped>
  input[type='text']:focus {
    border: solid 2px var(--primary);
  }
</style>

<script setup>
  import { ref, inject } from 'vue';
  import request from '../utils/Request';

  const list = inject('list');
  const inputClass = `w-full h-[48px] border-2 border-[#eeeeee] rounded-[12px] p-2.5 text-[14px] outline-none transition-all duration-500 mb-5`;

  const folderName = ref('');
  const isPrivate = ref(false);
  const folderPass = ref('');

  const togglePwdInput = function (event) {
    const permission = event.target.value;
    isPrivate.value = permission === 'private' ? true : false;
  };

  const createFolder = async () => {
    if (folderName.value === '') {
      cocoMessage.info('请输入文件夹名称');
      return;
    }
    if (isPrivate.value && folderPass.value === '') {
      cocoMessage.info('请输入文件夹密码');
      return;
    }

    cocoMessage.info('正在创建文件夹中...');

    const res = await request.post('/admin/createFolder', {
      name: folderName.value,
      permission: isPrivate.value ? 'private' : 'public',
      folderPass: isPrivate.value ? folderPass.value : '',
    });

    if (res.code === 200) {
      cocoMessage.success(`文件夹【${folderName.value}】创建成功`);
      list.folders.unshift({
        name: folderName.value,
        permission: isPrivate.value ? 'private' : 'public',
        id: res.id,
      });
      folderName.value = '';
      folderPass.value = '';
      isPrivate.value = false;

      return;
    }

    cocoMessage.error('文件夹创建失败');
    console.error(`文件夹【${folderName.value}】创建失败：${res.message}`);
  };
</script>
