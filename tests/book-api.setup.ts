import fs from 'node:fs';
import path from 'node:path';
import { test as setup, expect } from '@playwright/test';
import { bookAccount } from '../utils/env.config';
import { STORAGE } from '../utils/auth';

/**
 * Đăng nhập API Book MỘT lần, lưu token ra file.
 * Các test API đọc lại token này để gửi kèm header Authorization, không gửi mật khẩu nữa.
 */
setup('Đăng nhập API Book và lưu token', async ({ request }) => {
  const { email, password } = bookAccount();

  // Project api-setup có baseURL là Book, nên chỉ cần ghi đường dẫn
  const response = await request.post('/api/login', { data: { email, password } });

  // Sai tài khoản thì setup đỏ ngay tại đây, không lưu file.
  // Thông báo lỗi kèm body server trả về (msg, fields) để biết vì sao bị từ chối
  expect(response.status(), `Đăng nhập Book thất bại: ${await response.text()}`).toBe(200);
  const body = await response.json();
  expect(body.accessToken).toBeTruthy();

  fs.mkdirSync(path.dirname(STORAGE.bookToken), { recursive: true });
  fs.writeFileSync(STORAGE.bookToken, JSON.stringify({ accessToken: body.accessToken, exp: body.exp }, null, 2));
  // Lưu thêm cookie server trả về (nếu có), dùng ở bài xác thực
  await request.storageState({ path: STORAGE.bookApi });
});
