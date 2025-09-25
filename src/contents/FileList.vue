<template>
  <div
    id="file-container"
    class="bg-white rounded-[12px] p-[30px] shadow-(--shadow) mb-[30px]"
  >
    <div
      class="w-full h-[200px] grid"
      v-if="list.files.length === 0 && list.folders.length === 0"
    >
      <p class="place-self-center">暂无数据呢 :)</p>
    </div>
    <table
      id="files-table"
      class="w-full border-collapse table-fixed"
      v-else
    >
      <thead>
        <tr>
          <th class="w-[50%]">名称</th>
          <th class="w-[15%]">类型</th>
          <th class="w-[15%]">大小</th>
          <th class="w-[20%]">操作</th>
        </tr>
      </thead>

      <tbody id="file-list">
        <tr
          v-for="folder in list.folders"
          @click="openFolder(folder.id, folder.name, folder.permission)"
          class="hover:bg-[#4361ee0d] cursor-pointer"
        >
          <td>
            <div class="flex items-center w-full">
              <div class="file-icon bg-[#f7ff81]">
                <font-awesome-icon :icon="`fa-solid fa-folder`" />
              </div>
              <div class="overflow-hidden">
                <div class="file-name">{{ folder.name }}</div>
              </div>
            </div>
          </td>
          <td>文件夹</td>
          <td class="text-(--gray)">0 Byte</td>
          <td>
            <button
              class="index-btn"
              @click="openFolder(folder.id, folder.name, folder.permission)"
            >
              <font-awesome-icon :icon="`fa-solid fa-eye`" />
              查看
            </button>
          </td>
        </tr>
        <tr></tr>
        <tr
          v-for="file in list.files"
          class="hover:bg-[#4361ee0d] cursor-pointer"
          @click="$router.push(`/download/${file.sha}`)"
        >
          <td>
            <div class="flex items-center w-full">
              <div class="file-icon bg-(--primary)">
                <font-awesome-icon :icon="`fa-solid fa-file`" />
              </div>
              <div class="overflow-hidden">
                <div class="file-name">{{ file.name }}</div>
                <div class="file-date">上传于 {{ new Date(Number(file.date)).toLocaleString() }}</div>
              </div>
            </div>
          </td>

          <td>{{ file.type }}</td>
          <td class="text-(--gray)">{{ formatFileSize(Number(file.size)) }}</td>
          <td>
            <button
              class="index-btn"
              @click="$router.push(`/download/${file.sha}`)"
            >
              <font-awesome-icon :icon="`fa-solid fa-download`" />
              下载
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
  import { inject } from 'vue';
  import { formatFileSize } from '../utils/FormatSize';
  const list = inject('list');
  const path = inject('path');
  const pathInfo = inject('pathInfo');

  const openFolder = (id, name, permission) => {
    const fileName = 'folder-' + id;
    path.value = `/${fileName}`;
    if (pathInfo.length === 1) {
      pathInfo.push({
        path: '/folder-' + id,
        name,
      });
    }
  };
</script>

<style scoped>
  tr {
    cursor: pointer;
  }

  th {
    text-align: left;
    padding: 15px 10px;
    border-bottom: 2px solid var(--light-gray);
    font-weight: 600;
    color: var(--gray);
    cursor: pointer;
  }

  th:hover {
    color: var(--primary);
  }

  td {
    padding: 15px 10px;
    border-bottom: 1px solid var(--light-gray);
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .file-icon {
    height: 40px;
    width: 40px;
    border-radius: 8px;
    color: white;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 18px;
    margin-right: 15px;
    flex-shrink: 0;
  }

  .file-name {
    font-weight: 500;
    margin-bottom: 4px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    width: 100%;
    display: block;
  }

  .file-date {
    font-size: 13px;
    color: var(--gray);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .index-btn {
    background: var(--success);
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: var(--transition);
    display: flex;
    align-items: center;
    font-size: 16px;
    box-shadow: 0 4px 15px rgba(67, 97, 238, 0.3);
    gap: 5px;
  }

  @media (max-width: 768px) {
    th:nth-child(2),
    td:nth-child(2) {
      display: none;
    }

    th:nth-child(3),
    td:nth-child(3) {
      display: none;
    }

    .file-info {
      gap: 10px;
    }
  }

  @media (max-width: 530px) {
    th:nth-child(4),
    td:nth-child(4) {
      display: none;
    }
  }
</style>
