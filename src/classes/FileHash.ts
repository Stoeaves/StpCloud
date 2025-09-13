export class FileHash{
    file: File
    constructor(file: File){
        this.file = file;
    }

    async getHash(){
        return await this.calculateFileHash(this.file);
    }

    async calculateFileHash(file: File) {
        // 定义块大小（每个分片2MB）
        const CHUNK_SIZE = 2 * 1024 * 1024;
        const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
        
        // 初始化SHA-256哈希计算器
        const crypto = window.crypto;
        const sha256 = {
            buffer: new Uint8Array(0),
            remaining: null
        };
        
        // 处理每个分片
        for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
            // 计算当前分片的起始和结束位置
            const start = chunkIndex * CHUNK_SIZE;
            const end = Math.min(start + CHUNK_SIZE, file.size);
            
            // 读取分片
            const chunk = file.slice(start, end);
            const chunkBuffer = await this.readFileChunk(chunk) as ArrayBuffer;
            const chunkUint8 = new Uint8Array(chunkBuffer);
            
            // 更新哈希状态
            await this.updateHash(sha256, chunkUint8, crypto);
        }
        
        // 完成哈希计算
        const finalHash = await this.finalizeHash(sha256, crypto);
        return Array.from(finalHash).map((b: any) => 
            b.toString(16).padStart(2, '0')
        ).join('');
    }

    readFileChunk(chunk: Blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsArrayBuffer(chunk);
        });
    }

    async updateHash(sha256: { buffer: Uint8Array; remaining: Uint8Array | null; }, data: Uint8Array<ArrayBuffer>, crypto: Crypto) {
        // 如果有剩余数据，将其与当前数据连接
        if (sha256.remaining) {
            const combined = new Uint8Array(sha256.remaining.length + data.length);
            combined.set(sha256.remaining);
            combined.set(data, sha256.remaining.length);
            data = combined;
        }
        
        // 计算哈希
        sha256.buffer = new Uint8Array(
            await crypto.subtle.digest('SHA-256', data.buffer)
        );
        
        // 重置剩余数据
        sha256.remaining = null;
    }

    async finalizeHash(sha256: { buffer: Uint8Array; remaining: Uint8Array | null; }, crypto: Crypto) {
        // 如果还有剩余数据，计算其哈希
        if (sha256.remaining) {
            sha256.buffer = new Uint8Array(
                await crypto.subtle.digest('SHA-256', sha256.remaining.buffer)
            );
        }
        
        return sha256.buffer;
    }
}
