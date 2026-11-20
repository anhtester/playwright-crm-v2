/** Trạng thái sách mà API Book chấp nhận */
export type BookStatus = 'AVAILABLE' | 'UNAVAILABLE';

/** Body gửi lên POST /api/book và PATCH /api/book/{id} */
export interface BookBody {
  name: string;
  slug: string;
  description: string;
  status: BookStatus;
  categories: string[];
  price: number;
  /** Luôn gửi mảng (có thể rỗng). Không gửi thì Book tự áp mọi khuyến mãi đang chạy vào giá bán */
  promotions: string[];
}

/** Một cuốn sách trong body GET /api/book và GET /api/book/{id} (chỉ các trường test dùng tới) */
export interface Book {
  id: string;
  name: string;
  /** Chỉ có trong body danh sách, body chi tiết không trả slug */
  slug?: string;
  description: string;
  status: BookStatus;
  categories: string[];
  price: number;
  currentPrice: number;
}

/** Slug theo cách Book làm: chữ thường, bỏ dấu, đổi khoảng trắng thành "-", bỏ ký tự khác */
export function toSlug(text: string): string {
  return text
    .replace(/[Đđ]/g, 'd')
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

/** Body của GET /api/book */
export interface BookList {
  list: Book[];
  pagination: { total: number; totalPage: number; currentPage: number; lengthData: number };
}

/** Tham số lọc của GET /api/book (đi trên URL dạng ?limit=5&page=2) */
export interface BookQuery {
  limit?: number;
  page?: number;
  search?: string;
  sort?: 'name' | 'price' | 'createdAt' | 'updatedAt' | 'viewCount';
  sortBy?: 'asc' | 'desc';
}
