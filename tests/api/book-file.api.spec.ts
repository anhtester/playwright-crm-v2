import path from 'node:path';
import { test, expect } from '../../fixtures';
import { toSlug } from '../../utils/book-data';
import { uniqueSuffix } from '../../utils/factories';

const COVER = path.resolve(__dirname, '../../data/files/book-cover.png');
const TEXT_FILE = path.resolve(__dirname, '../../data/files/ghi-chu.txt');

test.describe('Book API - upload file bằng multipart/form-data', () => {
  test('Upload ảnh bìa, mở được ảnh, rồi xoá thư mục vừa tạo', async ({ request, fileApi }) => {
    // Mỗi test một thư mục riêng, xoá cả thư mục là dọn sạch
    const folder = `/${toSlug(`at-auto-upload-${uniqueSuffix()}`)}`;

    try {
      const uploaded = await fileApi.upload(COVER, folder);
      expect(uploaded.status).toBe(200);
      expect(uploaded.body.paths).toHaveLength(1);
      expect(uploaded.body.paths![0]).toContain('book-cover.png');

      // File đã lưu được phục vụ ở /view-file/<đường dẫn>
      const image = await request.get(`/view-file${uploaded.body.paths![0]}`);
      await expect(image).toBeOK();
      expect(image.headers()['content-type']).toContain('image/png');
    } finally {
      await fileApi.remove(folder);
    }
  });

  test('Upload file .txt bị từ chối 422', async ({ fileApi }) => {
    // Book chỉ nhận ảnh, zip, pdf. Bản cũ lưu cả .txt (bug, từng đánh dấu test.fail). Bản mới đã sửa nên bỏ test.fail
    const folder = `/${toSlug(`at-auto-upload-${uniqueSuffix()}`)}`;

    try {
      const uploaded = await fileApi.upload(TEXT_FILE, folder);
      expect(uploaded.status).toBe(422);
    } finally {
      // Server lỡ lưu file thì vẫn dọn. Server từ chối đúng thì thư mục không có, xoá trả 404, bỏ qua
      await fileApi.remove(folder);
    }
  });
});
