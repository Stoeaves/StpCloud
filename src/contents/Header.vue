<script setup>
  import { inject } from 'vue';

  const path = inject('path');
  const pathIndex = inject('pathIndex');
  const pathInfo = inject('pathInfo');
</script>
<template>
  <header class="custom-container flex justify-between items-center">
    <a
      @click="
        $router.push('/');
        path = '/';
        pathIndex = 0;
        pathInfo.length = 1;
      "
      class="text-[28px] font-bold text-(--primary) flex items-center gap-[12px] no-underline cursor-pointer"
    >
      <font-awesome-icon
        icon="fa-solid fa-cloud"
        class="text-[32px]"
      />
      StpCloud
    </a>
    <div class="flex gap-[15px] items-center">
      <slot></slot>
    </div>
  </header>
</template>
<style>
  @media (max-width: 580px) {
    header {
      flex-direction: column;
      gap: 20px;
      padding-inline: 0px;
    }
  }
</style>
