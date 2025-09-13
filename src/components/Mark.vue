<template>
  <div class="flex fixed top-0 left-0 w-full h-full bg-black/50 z-999 justify-center items-center">
    <div class="bg-white rounded-[16px] w-[90%] max-w-[500px] max-h-[500px] shadow-(--shadow) overflow-x-hidden">
      <div
        class="p-[20px] border-b-[1px] border-(--light-gray) flex justify-between items-center sticky top-0 bg-white z-10"
      >
        <div class="text-[22px] font-[600] text-(--primary)">{{ title }}</div>
        <button
          class="bg-transparent border-none text-[24px] text-(--gray) cursor-pointer w-[40px] h-[40px] flex justify-center items-center border-radius-[50%]"
          @click="hide"
        >
          <font-awesome-icon icon="fa-solid fa-times" />
        </button>
      </div>

      <div class="p-[20px]">
        <slot></slot>
      </div>
    </div>
  </div>
</template>
<script setup>
defineProps({
  title: {
    type: String,
    required: true,
  },
});
const emit = defineEmits(['close']);
const hide = () => {
  emit('close');
};
</script>
