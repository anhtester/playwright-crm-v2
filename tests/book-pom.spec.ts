import { test, expect } from '../fixtures';

test.describe('Book demo - Menu và bảng dữ liệu qua Component Object', () => {
  test('Menu trái có đủ 6 mục và đưa tới đúng trang', async ({ userPage, promotionPage }) => {
    await userPage.goto();
    await userPage.expectLoaded();
    await expect(userPage.menu.links)
      .toHaveText(['Dashboard', 'User', 'Book', 'Promotion', 'File', 'Database']);

    await test.step('User -> Promotion', async () => {
      await userPage.menu.open('Promotion');
      await promotionPage.expectLoaded();
    });

    await test.step('Promotion -> User', async () => {
      await promotionPage.menu.open('User');
      await userPage.expectLoaded();
    });
  });

  test('Bảng Promotion đúng cột, có dữ liệu, cột Start đúng định dạng ngày', async ({ promotionPage }) => {
    await promotionPage.goto();
    await promotionPage.expectLoaded();

    await expect(promotionPage.table.headers)
      .toHaveText(['CODE', 'Name', 'Type', 'Active', 'Value', 'Start', 'End', 'Created']);
    await expect(promotionPage.table.rows).not.toHaveCount(0); // chờ dữ liệu về

    const startDates = await promotionPage.table.columnValues('Start');
    console.log(`Số dòng: ${startDates.length} | Ô Start đầu tiên: ${JSON.stringify(startDates[0])}`);
    for (const value of startDates) {
      expect(value, 'Cột Start phải bắt đầu bằng ngày dạng "24 Th08 2026"').toMatch(/^\d{2} Th\d{2} \d{4}/);
    }
  });

  test('Bảng User dùng lại đúng component của bảng Promotion', async ({ userPage }) => {
    await userPage.goto();
    await userPage.expectLoaded();

    await expect(userPage.table.headers)
      .toHaveText(['Name', 'Phone', 'Address', 'Active', 'Created', 'Updated']);
    await expect(userPage.table.rows).not.toHaveCount(0);
    expect(await userPage.table.rows.count()).toBeLessThanOrEqual(5); // mặc định 5 dòng mỗi trang
  });
});
