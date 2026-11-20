import { BaseApi, type ApiResult } from './base.api';
import { type Book, type BookBody, type BookList, type BookQuery } from '../utils/book-data';

/** Thông báo ngắn Book trả về sau khi tạo, sửa, xoá */
type Message = { msg: string };

/** Client cho nhóm API /api/book. Mỗi hàm là một việc nghiệp vụ, trả về ApiResult */
export class BookApi extends BaseApi {
  /** Danh sách sách, có lọc, phân trang, sắp xếp */
  list(query: BookQuery = {}): Promise<ApiResult<BookList>> {
    return this.send('GET', '/api/book', { params: query });
  }

  /** Chi tiết một cuốn theo id hoặc slug */
  get(idOrSlug: string): Promise<ApiResult<Book>> {
    return this.send('GET', `/api/book/${idOrSlug}`);
  }

  create(book: BookBody): Promise<ApiResult<Message>> {
    return this.send('POST', '/api/book', { data: book });
  }

  /** Book đặt lại các trường không gửi về mặc định, nên luôn truyền đủ body */
  update(id: string, book: BookBody): Promise<ApiResult<Message>> {
    return this.send('PATCH', `/api/book/${id}`, { data: book });
  }

  remove(id: string): Promise<ApiResult<Message>> {
    return this.send('DELETE', `/api/book/${id}`);
  }
}
