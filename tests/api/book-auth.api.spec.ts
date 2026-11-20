import { test, expect } from '../../fixtures';
import { STORAGE } from '../../utils/auth';

test.describe('Book API - xác thực bằng Bearer token', () => {
  test('BK_AUTH_TC_091 - Lấy thông tin tài khoản hiện tại bằng token đã lưu', async ({ authRequest }) => {
    // authRequest đã gắn sẵn header Authorization, test không phải tự thêm
    const response = await authRequest.get('/api/me');

    await expect(response).toBeOK();
    const me = await response.json();
    expect(me).toHaveProperty('id');
    expect(me).toHaveProperty('email');
  });

  test('BK_AUTH_TC_092 - Thông tin tài khoản không lộ mật khẩu', async ({ authRequest }) => {
    const me = await (await authRequest.get('/api/me')).json();

    expect(Object.keys(me)).not.toContain('password');
  });

  test('BK_AUTH_TC_094 - Không gửi token bị từ chối 401', async ({ request }) => {
    // request mặc định KHÔNG có header Authorization
    const response = await request.get('/api/me');

    expect(response.status()).toBe(401);
    expect((await response.json()).msg).toBe('Missing or invalid Authorization header');
  });

  test('BK_AUTH_TC_095 - Token sai bị từ chối 401', async ({ request }) => {
    const response = await request.get('/api/me', {
      headers: { Authorization: 'Bearer token-khong-hop-le' },
    });

    expect(response.status()).toBe(401);
  });

  test('BK_AUTH_TC_096 - Chỉ nhận token qua header, cookie accessToken không đủ', async ({ playwright, baseURL }) => {
    // Context mang cookie của lần đăng nhập (có accessToken) nhưng KHÔNG có header Authorization
    const cookieOnly = await playwright.request.newContext({ baseURL, storageState: STORAGE.bookApi });

    const response = await cookieOnly.get('/api/me');

    expect(response.status()).toBe(401);
    await cookieOnly.dispose();
  });
});
