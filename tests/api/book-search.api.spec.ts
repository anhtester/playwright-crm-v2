import { test, expect } from '../../fixtures';
import { buildCategoryName, uniqueSuffix } from '../../utils/factories';

test.describe('Book API - tham số tìm kiếm, sắp xếp, phân trang', () => {
  test('BK_BOOK_TC_094 - Tìm theo chuỗi thường khớp tên sách', async ({ request, createBook }) => {
    const { body } = await createBook();

    // params: Playwright tự ghép và mã hoá thành ?search=AT%20Auto%20Book...&limit=5
    const response = await request.get('/api/book', { params: { search: body.name, limit: 5 } });

    await expect(response).toBeOK();
    const { list } = await response.json();
    expect(list.map((book: { name: string }) => book.name)).toEqual([body.name]);
  });

  test('BK_BOOK_TC_061 - Sắp xếp theo giá tăng dần', async ({ bookApi, createBook }) => {
    const tag = uniqueSuffix();
    const category = buildCategoryName();
    for (const price of [300_000, 100_000, 200_000]) {
      await createBook({ name: `AT Auto Sort ${tag} ${price}`, price, categories: [category] });
    }

    const { status, body } = await bookApi.list({ search: tag, sort: 'price', sortBy: 'asc' });

    expect(status).toBe(200);
    expect(body.list.map((book) => book.price)).toEqual([100_000, 200_000, 300_000]);
  });

  test('BK_BOOK_TC_065 - Phân trang 5 sách, mỗi trang 2 cuốn', async ({ bookApi, createBook }) => {
    const tag = uniqueSuffix();
    const category = buildCategoryName();
    const created: string[] = [];
    for (let i = 1; i <= 5; i++) {
      const { saved } = await createBook({ name: `AT Auto Page ${tag} ${i}`, categories: [category] });
      created.push(saved.id);
    }

    // Đọc trang 1 trước để biết có bao nhiêu trang, rồi đọc lần lượt các trang còn lại
    const first = await bookApi.list({ search: tag, limit: 2, page: 1, sort: 'name', sortBy: 'asc' });
    expect(first.body.pagination).toMatchObject({ total: 5, totalPage: 3, currentPage: 1, lengthData: 2 });

    const seen = first.body.list.map((book) => book.id);
    for (let page = 2; page <= first.body.pagination.totalPage; page++) {
      const { body } = await bookApi.list({ search: tag, limit: 2, page, sort: 'name', sortBy: 'asc' });
      expect(body.pagination.currentPage).toBe(page);
      seen.push(...body.list.map((book) => book.id));
    }

    // Đi hết các trang: đủ 5 cuốn, không trùng, không sót
    expect(seen).toHaveLength(5);
    expect(new Set(seen)).toEqual(new Set(created));
  });

  test('BK_BOOK_TC_098 - limit không phải số bị từ chối 422', async ({ request }) => {
    const response = await request.get('/api/book', { params: { limit: 'abc' } });

    expect(response.status()).toBe(422);
    expect((await response.json()).fields).toHaveProperty('limit');
  });
});
