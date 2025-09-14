<template>
  <Header>
    <HeaderButton
      text="搜索"
      icon="search"
    ></HeaderButton>

    <router-link
      to="/admin"
      class="no-underline"
    >
      <HeaderButton
        text="管理"
        icon="gear"
      ></HeaderButton>
    </router-link>
  </Header>

  <PathBar></PathBar>

  <FileList></FileList>
</template>

<script setup>
  import Header from '@/contents/Header.vue';
  import PathBar from '@/contents/PathBar.vue';
  import FileList from '@/contents/FileList.vue';
  import HeaderButton from '@/components/HeaderButton.vue';
</script>
