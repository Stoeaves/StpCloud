<template>
  <div class="container">
    <div class="row">
      <div class="w-full text-left">
        <a
          @click="$router.push('/')"
          class="cursor-pointer text-blue-500"
        >
          返回主页
        </a>
      </div>
      <div class="file-icon">
        <font-awesome-icon :icon="`fa-solid fa-file`" />
      </div>
      <div class="file-info">
        <div class="file-name">{{ name }}</div>
        <div class="file-meta">
          <span>
            <font-awesome-icon :icon="`fa-solid fa-calendar-alt`" />
            上传时间：<span id="uploadTime">{{ new Date(Number(date)).toLocaleString() }}</span>
          </span>
          <span>
            <font-awesome-icon :icon="`fa-solid fa-database`" />
            文件大小：<span id="fileSize">{{ formatFileSize(Number(size)) }}</span>
          </span>
        </div>
      </div>
      <button
        class="btn"
        id="download"
      >
        <font-awesome-icon :icon="`fa-solid fa-download`" />
        下载
      </button>
    </div>
  </div>
</template>

<script setup>
  import { ref } from 'vue';
  import { formatFileSize } from '../utils/FormatSize';
  import request from '../utils/Request';

  const sha = location.hash.replace('#/download/', '') ?? '';
  const name = ref('未知');
  const date = ref('946656000000');
  const size = ref('0');

  (async () => {
    const res = await request.post(`/fileInfo`, { fileName: sha });
    name.value = res.name;
    date.value = res.date;
    size.value = res.size;
  })();
</script>
<style>
  #app {
    display: grid;
  }
</style>
<style scoped>
  .container {
    max-width: 500px;
    width: 90%;
    place-self: center;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  }

  .row {
    width: 100%;
    display: flex;
    flex-direction: column;
    text-align: center;
    justify-content: center;
    align-items: center;
  }

  .file-icon {
    width: 80px;
    height: 80px;
    border-radius: 8px;
    background: #4361ee;
    color: white;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 32px;
    flex-shrink: 0;
    margin-bottom: 10px;
  }

  .file-info {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 5px;
    flex: 1;
    min-width: 0;
  }
  .file-name {
    font-size: clamp(16px, 3vw, 22px);
    font-weight: 600;
    word-break: break-all;
    overflow-wrap: break-word;
    margin-bottom: 5px;
  }

  .file-meta {
    width: 100%;
    font-size: 14px;
    color: #6c757d;
    display: flex;
    gap: 5px;
    flex-wrap: wrap;
    flex-direction: column;
  }
  .btn {
    width: 100%;
    height: 40px;
    background: #2ecc71;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.5s ease;
    display: flex;
    align-items: center;
    font-size: 16px;
    box-shadow: 0 4px 15px rgba(67, 97, 238, 0.3);
    justify-content: center;
    margin-top: 20px;
  }
</style>
