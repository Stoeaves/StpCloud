<script setup lang="ts"></script>
<template>
  <header
    class="bg-white rounded-[12px] px-[30px] py-[20px] mb-[30px] shadow-(--shadow) flex justify-between items-center"
  >
    <a
      @click="$router.push('/')"
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
