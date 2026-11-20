import { test as base, type APIRequestContext } from '@playwright/test';
import { BookApi } from '../api/book.api';
import { CategoryApi } from '../api/category.api';
import { FileApi } from '../api/file.api';
import { bookAuthHeader } from '../utils/auth';
import { env } from '../utils/env.config';
import { type Book, type BookBody } from '../utils/book-data';
import { buildBook, buildCategoryName } from '../utils/factories';

/** Sách vừa tạo: body đã gửi (có slug), bản server lưu (có id) và mã trạng thái của lần tạo */
export type CreatedBook = { body: BookBody; saved: Book; status: number };

export type ApiFixtures = {
  /** Request context đã gắn token Book: mọi request đi qua nó đều có header Authorization */
  authRequest: APIRequestContext;
  bookApi: BookApi;
  categoryApi: CategoryApi;
  fileApi: FileApi;
  /** Tạo sách qua API. Sau test TỰ XOÁ mọi sách và danh mục mà nó đã tạo */
  createBook: (overrides?: Partial<BookBody>) => Promise<CreatedBook>;
};

export const test = base.extend<ApiFixtures>({
  authRequest: async ({ playwright }, use) => {
    // Context mới KHÔNG tự lấy baseURL của project. Ghi rõ địa chỉ Book: client Book luôn gọi Book,
    // kể cả khi test chạy ở project trình duyệt (baseURL là CRM)
    const context = await playwright.request.newContext({ baseURL: env.bookURL, extraHTTPHeaders: bookAuthHeader() });
    await use(context);
    await context.dispose();
  },

  bookApi: async ({ authRequest }, use) => {
    await use(new BookApi(authRequest));
  },

  categoryApi: async ({ authRequest }, use) => {
    await use(new CategoryApi(authRequest));
  },

  fileApi: async ({ authRequest }, use) => {
    await use(new FileApi(authRequest));
  },

  createBook: async ({ bookApi, categoryApi }, use) => {
    const bookIds: string[] = [];
    const categories = new Set<string>();

    await use(async (overrides = {}) => {
      const body = buildBook(buildCategoryName(), overrides);
      body.categories.forEach((name) => categories.add(name));

      const created = await bookApi.create(body);
      if (created.status < 200 || created.status > 299) {
        throw new Error(`Không tạo được sách để chuẩn bị test: ${created.status} ${JSON.stringify(created.body)}`);
      }
      // POST không trả id: đọc lại theo slug để biết id
      const { body: saved } = await bookApi.get(body.slug);
      bookIds.push(saved.id);
      return { body, saved, status: created.status };
    });

    // Teardown: test đỏ hay xanh cũng chạy tới đây. Sách test tự xoá rồi thì server trả 404, bỏ qua
    for (const id of bookIds) await bookApi.remove(id);
    for (const name of categories) await categoryApi.remove(name);
  },
});
