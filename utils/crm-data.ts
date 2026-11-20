import { uniqueName } from './data';

/** Dữ liệu của form Add new customer. Chỉ company là bắt buộc */
export interface CustomerData {
  company: string;
  vat?: string;
  phone?: string;
  website?: string;
  address?: string;
  city?: string;
  country?: string;
}

/** Dữ liệu của form Add new project. customer là tên công ty đã có trong CRM */
export interface ProjectData {
  name: string;
  customer: string;
  estimatedHours?: string;
}

/** Một dòng đọc từ CSV hoặc Excel (mọi ô là chuỗi) thành dữ liệu của form Customer */
export function toCustomer(row: Record<string, string>): CustomerData {
  return {
    company: row.company,
    phone: row.phone,
    city: row.city,
    country: row.country,
  };
}

/** Thêm thời điểm chạy vào tên công ty: dữ liệu trong file giữ nguyên, mỗi lần chạy vẫn ra tên không trùng */
export function withUniqueCompany(customer: CustomerData): CustomerData {
  return { ...customer, company: uniqueName(customer.company) };
}
