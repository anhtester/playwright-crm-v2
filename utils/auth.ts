import fs from 'node:fs';
import path from 'node:path';

/** Thư mục chứa file trạng thái đăng nhập. Đã có trong .gitignore (/playwright/.auth/), KHÔNG commit */
const AUTH_DIR = path.resolve(__dirname, '..', 'playwright', '.auth');

/** Mỗi vai trò một file Storage State, do tests/auth.setup.ts tạo ra */
export const STORAGE = {
  admin: path.join(AUTH_DIR, 'admin.json'),
  pm: path.join(AUTH_DIR, 'pm.json'),
  customer: path.join(AUTH_DIR, 'customer.json'),
  /** Token đăng nhập API Book { accessToken, exp }, do tests/book-api.setup.ts tạo ra */
  bookToken: path.join(AUTH_DIR, 'book-token.json'),
  /** Cookie của lần đăng nhập API Book (có refetchToken), cũng do tests/book-api.setup.ts tạo ra */
  bookApi: path.join(AUTH_DIR, 'book-api.json'),
} as const;

/** Đọc accessToken Book đã lưu. Chưa có file thì báo rõ phải chạy setup trước */
export function bookToken(): string {
  if (!fs.existsSync(STORAGE.bookToken)) {
    throw new Error('Chưa có token Book. Chạy trước: npx playwright test --project=api-setup');
  }
  const saved = JSON.parse(fs.readFileSync(STORAGE.bookToken, 'utf8')) as { accessToken: string };
  return saved.accessToken;
}

/** Header xác thực cho các API Book cần đăng nhập */
export function bookAuthHeader(): { Authorization: string } {
  return { Authorization: `Bearer ${bookToken()}` };
}
