<template>
  <input
    class="w-full h-[48px] border-2 border-[#eeeeee] rounded-[12px] p-2.5 text-[14px] outline-none transition-all duration-500 mb-5"
    type="text"
    id="folderName"
    placeholder="请输入文件夹名称"
  />
  <span>请选择文件夹权限：</span>
  <select
    class="w-full h-[48px] border-2 border-[#eeeeee] rounded-[12px] p-2.5 text-[14px] outline-none transition-all duration-500 mb-5"
    @change="togglePwdInput"
  >
    <option value="public">公开</option>
    <option value="private">私密</option>
  </select>
  <div v-show="isPrivate">
    <input type="text" id="folderPass" placeholder="请输入文件夹密码" />
  </div>
  <button
    @click="showMsg"
    class="w-full h-[48px] bg-[var(--primary)] text-white cursor-pointer rounded-[12px]"
  >
    创建
  </button>
</template>

<style scoped>
input[type="text"]:focus {
  border: solid 2px var(--primary);
}
</style>

<script setup>
import { ref } from "vue";

const isPrivate = ref(false);

const togglePwdInput = function (event) {
  const permission = event.target.value;
  if (permission === "private") {
    isPrivate.value = true;
  } else {
    isPrivate.value = false;
  }
  console.log(event.target.value, isPrivate.value);
};
</script>
