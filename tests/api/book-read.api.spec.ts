import { test, expect } from '../../fixtures';
import { type Book } from '../../utils/book-data';

// Các API đọc của Book là công khai: KHÔNG gửi token

/** Tham số lấy 1 cuốn tạo sớm nhất: ?limit=1&sort=createdAt&sortBy=asc */
const OLDEST_BOOK = { limit: 1, sort: 'createdAt', sortBy: 'asc' };

test.describe('Book API - đọc danh sách và chi tiết sách (GET)', () => {
  test('BK_BOOK_TC_090 - Lấy danh sách sách mặc định 10 cuốn, trang 1', { tag: '@smoke' }, async ({ request }) => {
    const response = await request.get('/api/book');

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('application/json');
    const body = await response.json();
    expect(body.list).toHaveLength(10);
    expect(body.pagination.currentPage).toBe(1);
    expect(body.pagination.total).toBeGreaterThanOrEqual(10);
  });

  test('BK_BOOK_TC_078 - Xem chi tiết sách theo id lấy từ danh sách', async ({ request }) => {
    // Không ghi cứng id. Lấy cuốn CŨ NHẤT: các test khác chạy song song đang tạo, xoá sách mới,
    // cuốn mới nhất có thể bị xoá ngay sau khi mình đọc danh sách
    const listBody = await (await request.get('/api/book', { params: OLDEST_BOOK })).json();
    const first: Book = listBody.list[0];

    const response = await request.get(`/api/book/${first.id}`);

    await expect(response).toBeOK();
    const book: Book = await response.json();
    // Body chi tiết khác body danh sách (picture, previewContent...), nên chỉ so các trường hai bên cùng nghĩa
    expect(book.id).toBe(first.id);
    expect(book.slug).toBe(first.slug);
    expect(book.name).toBe(first.name);
    expect(book.price).toBe(first.price);
  });

  test('BK_BOOK_TC_099 - Đường dẫn chi tiết nhận cả slug thay cho id', async ({ request }) => {
    const listBody = await (await request.get('/api/book', { params: OLDEST_BOOK })).json();
    const first: Book = listBody.list[0];

    const response = await request.get(`/api/book/${first.slug}`);

    await expect(response).toBeOK();
    expect((await response.json()).id).toBe(first.id);
  });

  test('BK_BOOK_TC_080 - Id không tồn tại trả 404 kèm thông báo', async ({ request }) => {
    const response = await request.get('/api/book/khong-ton-tai-123');

    expect(response.status()).toBe(404);
    expect(await response.json()).toEqual({ msg: 'Book not found.' });
  });
});
