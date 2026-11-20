import { test, type APIRequestContext } from '@playwright/test';

/** Kết quả của một lần gọi API: mã trạng thái và body đã đọc sẵn */
export interface ApiResult<T> {
  status: number;
  body: T;
}

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/** Tuỳ chọn gửi kèm request, đặt tên theo đúng option của Playwright */
export interface RequestOptions {
  params?: Record<string, string | number | boolean>;
  data?: unknown;
  form?: Record<string, string | number | boolean>;
  multipart?: Record<string, string | number | boolean | { name: string; mimeType: string; buffer: Buffer }>;
}

/**
 * Lớp cha của mọi client API. Chỉ giữ thứ client nào cũng cần:
 * request context (đã có baseURL và header xác thực) và hàm send().
 */
export class BaseApi {
  constructor(protected readonly request: APIRequestContext) {}

  /** Gửi request, gói trong test.step để report hiện "POST /api/book". Không tự expect: test quyết định thế nào là đúng */
  protected async send<T>(method: Method, url: string, options: RequestOptions = {}): Promise<ApiResult<T>> {
    return test.step(`${method} ${url}`, async () => {
      const response = await this.request.fetch(url, { method, ...options });
      const text = await response.text();
      return { status: response.status(), body: (text ? JSON.parse(text) : undefined) as T };
    });
  }
}
