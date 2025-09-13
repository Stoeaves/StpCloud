<template>
  <div class="h-[10px] bg-[#eeeeee] overflow-hidden">
    <div class="progressBar"></div>
  </div>
</template>

<style scoped>
.progressBar {
  width: v-bind(progress + "%");
  height: 100%;
  background: linear-gradient(to right, #4caf50, #8bc34a);
  transition: all 0.5s;
}
</style>

<script setup>
defineProps({
  progress: {
    type: Number,
    required: true,
  },
});
</script>
