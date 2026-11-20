import { test, expect } from '../../fixtures';
import { buildBook, buildCategoryName } from '../../utils/factories';

// Bản viết lại của bài trước: gọi API qua client (bookApi), dữ liệu tạo qua fixture createBook (tự dọn)
test.describe('Book API - tạo, sửa, xoá sách (POST, PATCH, DELETE)', () => {
  test('BK_BOOK_TC_066 - Tạo sách rồi đọc lại đúng dữ liệu', async ({ bookApi, createBook }) => {
    const { body, saved } = await createBook();

    const { status, body: book } = await bookApi.get(saved.id);

    expect(status).toBe(200);
    expect(book).toMatchObject({
      name: body.name,
      status: 'AVAILABLE',
      price: body.price,
      categories: body.categories,
    });
  });

  test('BK_BOOK_TC_102 - Tạo sách thành công trả 201 như Swagger khai báo', async ({ createBook }) => {
    // Bản cũ trả 200 (bug, từng đánh dấu test.fail). Bản mới trả đúng 201 Created như Swagger nên bỏ test.fail

    const { status } = await createBook();

    expect(status).toBe(201);
  });

  test('BK_BOOK_TC_126 - Sửa giá và trạng thái được lưu', async ({ bookApi, createBook }) => {
    const { body, saved } = await createBook();
    // Book đặt lại các trường KHÔNG gửi về mặc định, nên gửi đủ cả body
    const updated = { ...body, price: body.price + 10_000, status: 'UNAVAILABLE' as const };

    const result = await bookApi.update(saved.id, updated);

    expect(result.status).toBe(200);
    const { body: book } = await bookApi.get(saved.id);
    expect(book.price).toBe(updated.price);
    expect(book.status).toBe('UNAVAILABLE');
  });

  test('BK_BOOK_TC_086 - Xoá sách, đọc lại thì 404', async ({ bookApi, createBook }) => {
    const { saved } = await createBook();

    const result = await bookApi.remove(saved.id);

    expect(result.status).toBe(200);
    expect((await bookApi.get(saved.id)).status).toBe(404);
  });

  test('BK_BOOK_TC_067 - Tạo sách không gửi token bị từ chối 401', async ({ request }) => {
    // Cố ý dùng request gốc (không token) thay cho bookApi
    const response = await request.post('/api/book', { data: buildBook(buildCategoryName()) });

    expect(response.status()).toBe(401);
    expect((await response.json()).msg).toBe('Missing or invalid Authorization header');
  });

  test('BK_BOOK_TC_071 - Tạo sách với categories rỗng bị từ chối 422', async ({ bookApi }) => {
    const { status, body } = await bookApi.create(buildBook('khong-dung', { categories: [] }));

    expect(status).toBe(422);
    expect(body.msg).toBe('Invalid data.');
  });
});
