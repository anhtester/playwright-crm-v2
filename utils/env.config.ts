import path from 'node:path';
import dotenv from 'dotenv';

/** Môi trường đang chạy. Không đặt biến TEST_ENV thì mặc định là dev. trim() bỏ dấu cách thừa do gõ lệnh */
export const TEST_ENV = (process.env.TEST_ENV ?? 'dev').trim();
const envFile = `.env.${TEST_ENV}`;

// __dirname là thư mục utils, lùi một cấp là gốc project.
// Nhờ vậy đứng ở thư mục nào gõ lệnh cũng đọc đúng file
dotenv.config({ path: path.resolve(__dirname, '..', envFile), quiet: true });

/** Đọc một biến bắt buộc. Thiếu hoặc để trống thì dừng ngay, nói rõ thiếu biến nào */
function required(name: string): string {
  const value = process.env[name]?.trim(); // giá trị chỉ toàn dấu cách cũng coi là thiếu
  if (!value) {
    throw new Error(`Thiếu biến môi trường ${name}. Kiểm tra file ${envFile} ở gốc project (mẫu: .env.example)`);
  }
  return value;
}

/** Đọc một biến số nguyên dương KHÔNG bắt buộc. Để trống thì trả về undefined */
function optionalPositiveInt(name: string): number | undefined {
  const raw = process.env[name]?.trim();
  if (!raw) return undefined;
  const value = Number(raw);
  if (!Number.isInteger(value) || value < 1) {
    throw new Error(`Biến ${name} phải là số nguyên dương, đang là "${raw}". Kiểm tra file ${envFile}`);
  }
  return value;
}

/** Cấu hình của môi trường đang chạy. Cả project chỉ đọc biến môi trường qua object này */
export const env = {
  name: TEST_ENV,
  label: required('ENV_NAME'),
  crmURL: required('CRM_URL'),
  bookURL: required('BOOK_URL'),
  /** Số worker chạy song song. Để trống thì Playwright tự chọn (một nửa số nhân CPU) */
  workers: optionalPositiveInt('WORKERS'),
} as const;

export type Role = 'ADMIN' | 'PM' | 'CUSTOMER';

/** Tài khoản CRM theo vai trò: account('ADMIN') đọc CRM_ADMIN_EMAIL và CRM_ADMIN_PASSWORD. Chỉ kiểm tra lúc được gọi, nên test không đăng nhập vẫn chạy khi chưa điền mật khẩu */
export function account(role: Role): { email: string; password: string } {
  return { email: required(`CRM_${role}_EMAIL`), password: required(`CRM_${role}_PASSWORD`) };
}

/** Tài khoản Book cho các API cần đăng nhập: đọc BOOK_EMAIL và BOOK_PASSWORD. Cũng chỉ kiểm tra lúc được gọi */
export function bookAccount(): { email: string; password: string } {
  return { email: required('BOOK_EMAIL'), password: required('BOOK_PASSWORD') };
}

// Chỉ in ở tiến trình chính. Các worker cũng nạp file này nhưng có biến TEST_WORKER_INDEX
if (process.env.TEST_WORKER_INDEX === undefined) {
  console.log(`[env] ${env.name} (${env.label}) | CRM: ${env.crmURL} | Book: ${env.bookURL}`);
}
