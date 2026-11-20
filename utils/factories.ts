import { fakerVI as faker } from '@faker-js/faker';
import { type CustomerData, type ProjectData } from './crm-data';
import { type BookBody, toSlug } from './book-data';

/**
 * Phần đuôi không trùng theo quy ước của bộ kit: <thời điểm>_<4 ký tự ngẫu nhiên>.
 * Faker tự nó KHÔNG bảo đảm không trùng (tên công ty tiếng Việt rất ngắn, hay lặp).
 */
export function uniqueSuffix(): string {
  return `${Date.now()}_${faker.string.alphanumeric(4).toUpperCase()}`;
}

/** Customer ngẫu nhiên, đủ các ô. Truyền overrides để cố định ô mà test cần kiểm */
export function buildCustomer(overrides: Partial<CustomerData> = {}): CustomerData {
  return {
    company: `AT Auto ${faker.company.name()} ${uniqueSuffix()}`,
    vat: faker.string.numeric(10),
    phone: faker.phone.number(),
    website: faker.internet.url(),
    address: faker.location.streetAddress(),
    city: faker.location.city(),
    country: 'Vietnam',
    ...overrides,
  };
}

/** Project ngẫu nhiên gắn với một Customer đã có */
export function buildProject(customer: string, overrides: Partial<ProjectData> = {}): ProjectData {
  return {
    name: `AT Auto Dự án ${faker.commerce.productName()} ${uniqueSuffix()}`,
    customer,
    estimatedHours: String(faker.number.int({ min: 8, max: 200 })),
    ...overrides,
  };
}

/** Tên danh mục sách không trùng, ví dụ "AT Auto Cat K3F9Q2ZD". Book giới hạn tên danh mục tối đa 24 ký tự, nên không dùng uniqueSuffix() (dài 18 ký tự) */
export function buildCategoryName(): string {
  return `AT Auto Cat ${faker.string.alphanumeric(8).toUpperCase()}`;
}

/** Sách ngẫu nhiên thuộc một danh mục. Slug tính sẵn từ tên để test tìm lại được sách vừa tạo */
export function buildBook(category: string, overrides: Partial<BookBody> = {}): BookBody {
  // Truyền name riêng thì slug cũng tính theo name đó
  const name = overrides.name ?? `AT Auto Book ${uniqueSuffix()}`;
  return {
    name,
    slug: toSlug(name),
    description: faker.lorem.sentence(),
    status: 'AVAILABLE',
    categories: [category],
    price: faker.number.int({ min: 50, max: 500 }) * 1000,
    promotions: [],
    ...overrides,
  };
}
