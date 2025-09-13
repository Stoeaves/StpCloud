<template>
  <button :style="`background-color: ${colorStyle}`">
    <font-awesome-icon :icon="`fa-solid fa-${icon}`" />
    {{ text }}
  </button>
</template>

<style scoped>
  button {
    background: var(--primary);
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: var(--transition);
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 16px;
    box-shadow: 0 4px 15px rgba(67, 97, 238, 0.3);
  }
  button:hover {
    background: var(--secondary);
    transform: translateY(-2px);
  }
</style>

<script>
  export default {
    props: {
      text: {
        type: String,
        required: true,
      },
      colorStyle: {
        type: String,
        default: 'bg-(--primary)',
      },
      icon: {
        type: String,
        required: true,
      },
    },
  };
</script>
