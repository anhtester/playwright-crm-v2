import { test, expect } from '../../fixtures';
import { buildCategoryName } from '../../utils/factories';

// Category của Book KHÔNG có id: tên chính là khoá. PUT đổi tên, DELETE xoá theo tên
test.describe('Book API - danh mục sách (POST, PUT, DELETE)', () => {
  test('Tạo, đổi tên rồi xoá một danh mục', async ({ categoryApi }) => {
    const name = buildCategoryName();
    const newName = `${name} v2`;
    let current = name; // tên đang tồn tại trên server, để finally dọn đúng

    try {
      await test.step('POST tạo danh mục', async () => {
        const result = await categoryApi.create(name);
        expect(result.status).toBe(201);
        expect(await categoryApi.names()).toContain(name);
      });

      await test.step('PUT đổi tên danh mục', async () => {
        expect((await categoryApi.rename(name, newName)).status).toBe(200);
        current = newName;
        const names = await categoryApi.names();
        expect(names).toContain(newName);
        expect(names).not.toContain(name);
      });

      await test.step('DELETE xoá danh mục theo tên', async () => {
        expect((await categoryApi.remove(newName)).status).toBe(200);
        current = '';
        expect(await categoryApi.names()).not.toContain(newName);
      });
    } finally {
      if (current) await categoryApi.remove(current);
    }
  });

  test('Tạo danh mục trùng tên bị từ chối 409', async ({ categoryApi }) => {
    const name = buildCategoryName();
    await categoryApi.create(name);

    try {
      const result = await categoryApi.create(name);
      // Bản cũ trả 400. Bản mới trả 409 Conflict, đúng nghĩa "trùng dữ liệu đã có"
      expect(result.status).toBe(409);
      expect(result.body.msg).toBe('Category already exists.');
    } finally {
      await categoryApi.remove(name);
    }
  });
});
