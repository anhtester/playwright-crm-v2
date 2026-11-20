/** Email không trùng giữa các lần chạy, ví dụ tester+1763456789012@example.com */
export function uniqueEmail(prefix: string = 'tester'): string {
  return `${prefix}+${Date.now()}@example.com`;
}

/**
 * Tên không trùng kể cả khi nhiều test chạy song song trong cùng một mili giây:
 * "AT Auto Customer 1763456789012_K3F9". Chỉ Date.now() là chưa đủ (đã gặp 2 test ra cùng một tên)
 */
export function uniqueName(prefix: string): string {
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${prefix} ${Date.now()}_${random}`;
}

/** Chuỗi dài đúng `length` ký tự, dùng cho test giá trị biên */
export function textOfLength(length: number, char: string = 'a'): string {
  return char.repeat(length);
}
