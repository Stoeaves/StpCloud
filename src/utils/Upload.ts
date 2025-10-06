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
 * 将 Blob 转换为 Base64
 * @param {Blob} blob - 要转换的 Blob 对象
 * @return {Promise<string>} - 返回 Base64 编码的字符串
 */
export async function chunkBlobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      // 提取纯Base64数据（去除data URL前缀）
      const base64String = (reader.result as string).split(',')[1];
      resolve(base64String);
    };

    reader.onerror = () => {
      reject(new Error(`Failed to convert blob to Base64: ${reader.error?.message || 'Unknown error'}`));
    };

    reader.readAsDataURL(blob);
  });
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
