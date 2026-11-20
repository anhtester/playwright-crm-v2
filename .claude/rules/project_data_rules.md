# Quy tắc data test riêng của project (Playwright TypeScript)

> Chỗ nào khác với `skills-test-data-generator` của bộ kit (vị trí thư mục, định dạng file)
> thì LÀM THEO FILE NÀY. Các quy tắc còn lại của bộ kit giữ nguyên.

## Vị trí và định dạng
- File data nằm ở `data/` tại gốc project (KHÔNG phải `test-data/`): `.json`, `.csv`, `.xlsx`.
- JSON: `import x from '../data/<ten>.json'`, mỗi bộ dữ liệu một khoá có tên (`full`, `minimal`...).
- CSV và Excel: dòng đầu là tiêu đề cột, cột đầu tiên là `key` (không trùng) để test lấy đúng một dòng.
- Đọc CSV, Excel CHỈ qua `utils/data-reader.ts` (`readCsv`, `readExcel`, `findRow`). Không đọc file ở nơi khác.
- Excel: cột số điện thoại, mã số, mã bưu chính định dạng **Text**, nếu không Excel bỏ số 0 ở đầu.
- Dòng CSV/Excel đổi thành kiểu của form qua hàm trong `utils/crm-data.ts` (`toCustomer`). Không truyền
  thẳng `Record<string, string>` vào Page Object.

## Giá trị
- Dữ liệu phải không trùng giữa các lần chạy: tên công ty đi qua `withUniqueCompany()`.
  KHÔNG sửa file data để "đổi tên cho khỏi trùng".
- KHÔNG ghi email, mật khẩu của tài khoản thật vào file data. Tài khoản lấy từ `.env` qua `account()`.
- Data sai (email sai định dạng, ô trống...) cũng đặt trong file data, kèm kết quả mong đợi của từng dòng.

## Data-driven
- Một kịch bản chạy với nhiều bộ dữ liệu: vòng `for (const data of ...)` bao quanh `test(...)`,
  KHÔNG đặt vòng lặp bên trong một test (một dòng lỗi làm dừng cả các dòng sau, report chỉ có 1 test).
- Tên test phải khác nhau giữa các dòng: ghép mã TC + `key`/`id` của dòng (`CRM_CUSTOMER_TC_010-${row.key}`).
- JSON, CSV đọc đồng bộ nên lặp thẳng được. Excel đọc bằng `await`: lặp theo danh sách key,
  đọc file BÊN TRONG test. KHÔNG viết `await` ở ngoài cùng file test (lỗi `await is not defined`).

## Faker
- Data ngẫu nhiên chỉ sinh qua hàm trong `utils/factories.ts` (`buildCustomer`, `buildProject`),
  dùng `fakerVI`. Test không import `@faker-js/faker` trực tiếp.
- Giá trị không trùng theo mẫu của bộ kit: tiền tố `AT Auto` + `uniqueSuffix()` (thời điểm + 4 ký tự).
  Faker không tự bảo đảm không trùng.
- Ô mà test kiểm kết quả thì cố định bằng `overrides` (`buildCustomer({ country: 'Japan' })`).
- Data ngẫu nhiên phải đính vào report bằng `test.info().attach(...)` để test đỏ còn biết đã điền gì.
