import request from './Request';

export type atFileInfo = {
  name: string;
  type: string;
  date: number;
  size: number;
  sha: string;
};
/**
 *
 * @param file 文件
 * @param chunkSize 分片大小
 * @returns 分片文件
 */
export function sliceFile(file: File, chunkSize: number = 2 * 1024 * 1024): Blob[] {
  const chunks = [];
  let start = 0;
  let end = 0;

  while (start < file.size) {
    // 计算当前分片结束位置（确保不超出文件）
    end = Math.min(start + chunkSize, file.size);

    // 切割文件片段
    const chunk = file.slice(start, end);
    chunks.push(chunk);

    // 移动下一个分片起点
    start = end;
  }

  return chunks;
}

/**
 * 申请上传资格
 * @param file 目标文件
 * @returns 状态码
 */
export async function applyToken(path: string, fileInfo: atFileInfo) {
  const res = await request.post<{ code: number }>('/admin/applyToken', {
    adminPass: localStorage.getItem('adminPassword'),
    path,
    ...fileInfo,
  });

  return res.code;
}
