import { test, expect } from '../fixtures';
import mocks from '../data/book-list.mock.json';
import { type BookList } from '../utils/book-data';

/** Request danh sách sách mà trang Book Management gọi: GET /api/book?search=...&limit=36 */
const BOOK_LIST_API = '**/api/book?*';

test.describe('Book UI - theo dõi và giả lập API danh sách sách', () => {
  test('Đọc response thật của API danh sách, thẻ sách đầu tiên khớp dữ liệu', { tag: '@smoke' }, async ({ bookListPage }) => {
    // Đăng ký chờ TRƯỚC khi mở trang, nếu không response có thể về trước khi kịp chờ.
    // Trang gọi /api/book hai lần (3 cuốn nổi bật và lưới 20 cuốn): chờ đúng request của lưới
    const responsePromise = bookListPage.waitForGridResponse();
    await bookListPage.goto();
    const response = await responsePromise;

    expect(response.status()).toBe(200);
    expect(new URL(response.url()).searchParams.get('page')).toBe('1');

    const body: BookList = await response.json();
    await expect(bookListPage.bookTitle(body.list[0].name)).toBeVisible();
    // Tổng số sách trên giao diện khớp với pagination.total của API
    await expect(bookListPage.results).toContainText(`of ${body.pagination.total} books`);
  });

  test('Giả lập danh sách 2 cuốn: trang hiện đúng 2 cuốn đó', async ({ page, bookListPage }) => {
    await page.route(BOOK_LIST_API, (route) => route.fulfill({ json: mocks.twoBooks }));

    await bookListPage.goto();

    for (const book of mocks.twoBooks.list) {
      await expect(bookListPage.bookTitle(book.name)).toBeVisible();
    }
    await expect(bookListPage.noData).toBeHidden();
  });

  test('Giả lập danh sách rỗng: trang hiện No Data', async ({ page, bookListPage }) => {
    await page.route(BOOK_LIST_API, (route) => route.fulfill({ json: mocks.empty }));
    // "No Data" cũng hiện trong lúc trang ĐANG TẢI. Phải chờ trang nhận xong response giả rồi mới kiểm,
    // nếu không route sai pattern (không chạy) test vẫn xanh
    const listResponse = page.waitForResponse(BOOK_LIST_API);

    await bookListPage.goto();
    await listResponse;

    await expect(bookListPage.noData).toBeVisible();
  });

  test('Giả lập server lỗi 500: trang báo lỗi bằng thông báo của server', async ({ page, bookListPage }) => {
    await page.route(BOOK_LIST_API, (route) =>
      route.fulfill({ status: 500, json: { msg: 'Lỗi giả lập từ test' } }),
    );

    await bookListPage.goto();

    // Trang gọi /api/book hai lần, cả hai đều nhận lỗi 500 nên có hai thông báo giống nhau
    await expect(bookListPage.notifications.getByText('Lỗi giả lập từ test').first()).toBeVisible();
    await expect(bookListPage.noData).toBeVisible();
  });

  test('Chặn hẳn request (mất mạng): trang không vỡ, hiện No Data', async ({ page, bookListPage }) => {
    await page.route(BOOK_LIST_API, (route) => route.abort('internetdisconnected'));
    // Request bị chặn thì không có response: chờ sự kiện requestfailed thay cho waitForResponse
    const failed = page.waitForEvent('requestfailed', (request) => request.url().includes('/api/book?'));

    await bookListPage.goto();
    // Chỉ kiểm "có lỗi mạng": chữ báo lỗi mỗi trình duyệt một kiểu (WebKit: "Blocked by Web Inspector")
    expect((await failed).failure()).not.toBeNull();

    await expect(bookListPage.heading).toBeVisible();
    await expect(bookListPage.noData).toBeVisible();
  });

  test('Sửa một phần response thật: đổi tên cuốn đầu tiên', async ({ page, bookListPage }) => {
    const fakeName = 'Tên đã bị test sửa';
    await page.route(BOOK_LIST_API, async (route) => {
      const response = await route.fetch(); // gửi request thật lên server
      const body: BookList = await response.json();
      body.list[0].name = fakeName;
      await route.fulfill({ response, json: body }); // trả lại cho trang, giữ status và header thật
    });

    await bookListPage.goto();

    await expect(bookListPage.bookTitle(fakeName)).toBeVisible();
  });
});

test.describe('Book - kết hợp API và UI', () => {
  test('Sách tạo qua API hiện đúng tên và giá trên trang chi tiết', async ({ createBook, bookDetailPage }) => {
    // Arrange bằng API: nhanh, không phụ thuộc form tạo sách. Fixture tự xoá sách sau test
    const { body } = await createBook({ price: 123_000 });

    await bookDetailPage.open(body.slug);

    await bookDetailPage.expectLoaded();
    await expect(bookDetailPage.name).toHaveText(body.name);
    await expect(bookDetailPage.currentPrice).toHaveText('123.000 ₫');
  });

  test('Sửa giá qua API, mở lại trang thì thấy giá mới', async ({ page, createBook, bookApi, bookDetailPage }) => {
    const { body, saved } = await createBook({ price: 100_000 });
    await bookDetailPage.open(body.slug);
    await expect(bookDetailPage.currentPrice).toHaveText('100.000 ₫');

    // Đổi dữ liệu ở phía server bằng API, rồi kiểm giao diện phản ánh đúng
    const updated = await bookApi.update(saved.id, { ...body, price: 250_000 });
    expect(updated.status).toBe(200);
    await page.reload();

    await expect(bookDetailPage.currentPrice).toHaveText('250.000 ₫');
  });
});
