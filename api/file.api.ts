import fs from 'node:fs';
import path from 'node:path';
import { BaseApi, type ApiResult } from './base.api';

/** Loại file theo đuôi, dùng làm mimeType khi upload */
const MIME_TYPES: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.pdf': 'application/pdf',
  '.txt': 'text/plain',
};

/** Client cho /api/file: upload bằng multipart, xoá theo đường dẫn */
export class FileApi extends BaseApi {
  /** Upload một file trên máy vào thư mục `folder` của Book. Body trả về có `paths` là đường dẫn đã lưu */
  upload(filePath: string, folder: string): Promise<ApiResult<{ msg: string; paths?: string[]; fields?: object }>> {
    return this.send('POST', '/api/file', {
      multipart: {
        files: {
          name: path.basename(filePath),
          mimeType: MIME_TYPES[path.extname(filePath)] ?? 'application/octet-stream',
          buffer: fs.readFileSync(filePath),
        },
        path: folder,
      },
    });
  }

  /** Xoá file hoặc cả thư mục (đường dẫn tính từ thư mục upload của Book) */
  remove(filePath: string): Promise<ApiResult<{ msg: string }>> {
    return this.send('DELETE', '/api/file', { params: { path: filePath } });
  }
}
