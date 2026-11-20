import { BaseApi, type ApiResult } from './base.api';

type Message = { msg: string };

/** Client cho /api/category-book. Danh mục không có id: tên chính là khoá */
export class CategoryApi extends BaseApi {
  async names(): Promise<string[]> {
    const { body } = await this.send<{ list: { name: string }[] }>('GET', '/api/category-book');
    return body.list.map((category) => category.name);
  }

  create(name: string): Promise<ApiResult<Message>> {
    return this.send('POST', '/api/category-book', { data: { name } });
  }

  rename(name: string, newName: string): Promise<ApiResult<Message>> {
    return this.send('PUT', '/api/category-book', { data: { name, newName } });
  }

  /** Tên có dấu cách nên phải mã hoá trước khi ghép vào đường dẫn */
  remove(name: string): Promise<ApiResult<Message>> {
    return this.send('DELETE', `/api/category-book/${encodeURIComponent(name)}`);
  }
}
