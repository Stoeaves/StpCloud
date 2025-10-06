<template>
  <div
    id="upload-area"
    class="border-dashed border-2 rounded-[12px] p-[40px] text-center cursor-pointer transition-all duration-300"
    :class="{
      'border-(--primary)': isDragging,
      'border-(--light-gray)': !isDragging,
    }"
    v-if="!isUploading"
    @dragover.prevent="handleDragOver"
    @dragleave.prevent="handleDragLeave"
    @drop.prevent="handleDrop"
  >
    <font-awesome-icon
      icon="fa-solid fa-cloud-upload-alt"
      class="text-[60px] text-(--primary) mb-[15px]"
    ></font-awesome-icon>
    <div class="text-[18px] font-[500] mb-[10px]">拖拽到此处上传</div>
    <div class="mb-[20px] text-(--gray)">或</div>
    <button
      class="bg-(--primary) text-white border-none px-[24px] py-[12px] rounded-[8px] font-[500] cursor-pointer transition-all duration-300 hover:bg-(--secondary)"
      @click="clickInput"
    >
      选择文件
    </button>
    <input
      type="file"
      class="hidden"
      multiple
      @change="uploadFiles"
    />
  </div>

  <div
    id="fileList"
    class="grid overflow-y-scroll"
    v-if="isUploading && fileList.length > 0"
  >
    <div
      id="file-item"
      class="mx-[20px] my-[10px] px-[20px] py-[15px] bg-white rounded-[12px] shadow-(--shadow)"
      v-for="(file, index) in fileList"
      v-show="!file.completed"
      :key="index"
    >
      <div
        id="fileName"
        class="w-full whitespace-nowrap overflow-hidden text-ellipsis mb-[5px] font-[500]"
      >
        {{ file.file.name }}
      </div>
      <div
        id="fileSize"
        class="font-[500] text-(--gray) overflow-hidden text-ellipsis whitespace-nowrap"
      >
        {{ formatFileSize(file.file.size) }}
      </div>
      <div id="progress">
        进度: <span>{{ file.progress }}%</span>
      </div>
      <Progress
        :progress="file.progress"
        class="mt-[10px]"
      ></Progress>
    </div>
  </div>
</template>

<style scoped>
  #fileList {
    background: linear-gradient(135deg, #f8f9fa, #e9ecef);
  }
</style>

<script setup>
  import { ref, inject } from 'vue';
  import Progress from './Progress.vue';
  import { BetterPromise } from '../classes/BetterPromise';
  import { FileHash } from '../classes/FileHash';
  import { formatFileSize } from '../utils/FormatSize';
  import { sliceFile, applyToken } from '../utils/Upload';
  import request from '../utils/Request';

  const path = inject('path');
  const list = inject('list');

  const isUploading = ref(false);
  const isDragging = ref(false);

  const fileList = ref([]);

  const handleDragOver = (event) => {
    event.preventDefault();
    isDragging.value = true;
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    isDragging.value = false;
  };

  const handleDrop = (event) => {
    event.preventDefault();
    isDragging.value = false; // 拖拽结束，重置状态

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      uploadFiles(event, files);
    }
  };

  const clickInput = () => {
    const input = document.querySelector('input[type="file"]');
    if (input) {
      input.click();
    }
  };

  const uploadFiles = (event, files) => {
    files = files || event.target.files;

    if (files && files.length > 0) {
      isUploading.value = true;
      for (const file of files) {
        fileList.value.push({ file, progress: 0, completed: false });
      }

      var fileId = 0;
      const bpConfig = {
        concurrency: 5,
        maxRetries: 20,
        onProgress: (completed, total) => {
          const percent = Math.floor((completed / total) * 100);
          fileList.value[fileId].progress = percent;
        },
        onComplete: async () => {
          cocoMessage.success(`【${fileList.value[fileId].file.name}】上传成功！`);
          fileList.value[fileId].completed = true;

          uploadNext();
        },
        onError: (error, taskId) => {
          cocoMessage.error(`文件【${fileList.value[fileId].file.name}】上传失败：${error}`);
          console.error(`文件【${fileList.value[fileId].file.name}】分片【${taskId}】上传失败：${error}`);

          uploadNext();
        },
        onCancel: () => {
          bp.cancel();
        },
      };

      const uploadNext = async (isNext = true) => {
        if (isNext) fileId++;

        // 判断是否完全上传完毕
        if (fileId === fileList.value.length) {
          isUploading.value = false;

          for (const fileInfo of fileList.value) {
            const file = fileInfo.file;
            const hashGetter = new FileHash(file);
            const hash = await hashGetter.getHash();

            list.files.unshift({
              name: file.name,
              size: file.size,
              type: getFileTypeByName(file.name),
              date: Date.parse(new Date().toString()),
              sha: hash,
            });

            sessionStorage.setItem(`list_${path.value}`, JSON.stringify(list));
          }

          fileList.value = [];

          return;
        }

        const file = fileList.value[fileId].file;
        const hashGetter = new FileHash(file);
        const hash = await hashGetter.getHash();
        const chunks = sliceFile(file, 2 * 1024 * 1024);

        const at = await applyToken(path.value.slice(1, -1), {
          name: file.name,
          type: getFileTypeByName(file.name),
          date: Date.parse(new Date().toString()),
          size: file.size,
          sha: hash,
        });

        if (at === 201) {
          cocoMessage.info(`文件【${file.name}】已存在！`);
          fileList.value[fileId].progress = 100;
          fileList.value[fileId].completed = true;

          uploadNext();
          return;
        }

        for (let i = 0; i < chunks.length; i++) {
          const chunk = chunks[i];
          bp.add(() => {
            return new Promise(async (resolve, reject) => {
              const formData = new FormData();
              formData.append('path', path.value.slice(1, -1));
              formData.append('sha', hash);
              formData.append('chunk', chunk);
              formData.append('index', i.toString());

              try {
                const res = await request.post('/admin/upload', formData);
                if (res.code === 400) reject(`上传分片【${i}】失败：${res.message}`);

                resolve();
              } catch (error) {
                reject(`上传分片【${i}】时出错：${error}`);
              }
            });
          });

          bp.start();
        }
      };

      const bp = new BetterPromise(bpConfig);
      uploadNext(false);
    }
  };

  const getFileTypeByName = (filename) => {
    function getFileExtension(filename) {
      const match = filename.match(/\.([^.]+)$/);
      return match ? match[1] : '';
    }

    let extension = getFileExtension(filename);

    const fileTypeMap = {
      // 图像类型
      image: {
        name: '图像',
        extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico'],
      },
      // 音频类型
      audio: {
        name: '音频',
        extensions: ['mp3', 'wav', 'flac', 'aac', 'ogg', 'wma', 'm4a'],
      },
      // 视频类型
      video: {
        name: '视频',
        extensions: ['mp4', 'mov', 'avi', 'mkv', 'flv', 'wmv', 'mpg', 'mpeg'],
      },
      // 文档类型
      document: {
        name: '文档',
        extensions: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt', 'csv'],
      },
      // 表格文件
      excel: {
        name: '电子表格',
        extensions: ['xls', 'xlsx', 'csv'],
      },
      // 演示文稿
      powerpoint: {
        name: '演示文稿',
        extensions: ['ppt', 'pptx'],
      },
      // 压缩包
      archive: {
        name: '压缩包',
        extensions: ['zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz'],
      },
      // 可执行文件
      executable: {
        name: '可执行文件',
        extensions: ['exe', 'msi', 'bin', 'apk', 'app', 'dmg'],
      },
      // 字体文件
      font: {
        name: '字体文件',
        extensions: ['ttf', 'otf', 'woff', 'woff2', 'eot'],
      },
      // 代码文件
      code: {
        name: '代码文件',
        extensions: ['js', 'ts', 'html', 'htm', 'shtml', 'css', 'json', 'xml', 'py', 'java', 'c', 'cpp', 'sh', 'php'],
      },
    };

    extension = extension.toLowerCase();
    for (const [_, exts] of Object.entries(fileTypeMap)) {
      if (exts.extensions.includes(extension)) {
        return exts.name;
      }
    }
    return '文件';
  };
</script>
