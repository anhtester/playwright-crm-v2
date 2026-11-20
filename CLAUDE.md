# playwright-crm

Project học Playwright TypeScript của khoá Anh Tester: test giao diện CRM demo (`https://crm.anhtester.com`),
test giao diện và API của Book (`https://book.anhtester.com`). Kiến trúc POM + Component + Fixture,
config nhiều môi trường bằng `.env.<môi trường>`, HTML Report + Allure 3, CI bằng GitHub Actions.

## Quy tắc chi tiết
Quy tắc riêng của project nằm ở `.claude/rules/project_*.md` (tự nạp ở đầu phiên):
config + CI + chạy song song (`project_config_rules.md`), locator (`project_locator_rules.md`),
POM (`project_pom_rules.md`), data test (`project_data_rules.md`), API Book (`project_api_rules.md`),
report (`project_report_rules.md`). Chỗ nào khác mẫu của bộ kit claude-testing-skills thì làm theo các file này.

## Cấu trúc (KHÔNG đổi chỗ thư mục: workflow CI, import và quy tắc trỏ vào đúng các đường dẫn này)
- `tests/` test giao diện (`*.spec.ts`), `tests/api/` test API (`*.api.spec.ts`), `tests/*.setup.ts` đăng nhập.
- `pages/`, `components/` Page Object, `fixtures/` (test import `{ test, expect }` từ `../fixtures`),
  `api/` client API, `utils/` env, data, factory, `data/` file data test.
- KHÔNG tạo thư mục `src/`, không dựng thêm một project Playwright thứ hai bên trong project này.

## Bí mật
- KHÔNG mở, in, chép giá trị trong `.env.*` (trừ `.env.example`) và `playwright/.auth/*`.
  Cần biết có biến nào thì đọc `.env.example`.
- KHÔNG commit `.env.*` (trừ `.env.example`), `playwright/.auth/`, `test-results/`, `playwright-report/`, `allure-*`.
- KHÔNG ghi email, mật khẩu, token vào code, README, file này hay workflow. Trên CI tài khoản lấy từ GitHub Secrets.

## Khi sửa test
- KHÔNG nới phép kiểm cho test xanh: không đổi giá trị mong đợi để né bug, không xoá `expect`,
  không thêm `retries`, không tăng `timeout` chung, không `test.only`, không `waitForTimeout`.
- Test mới có mã TC trong tên (`CRM_LOGIN_TC_001 - ...`, `BK_BOOK_TC_066 - ...`) khi bộ TC có mã đó.
- Dữ liệu tạo mới có tiền tố `AT Auto` và được dọn trong fixture.

## Lệnh
- `npm run typecheck` kiểm kiểu TypeScript. `npx playwright test --list` đếm test trước khi chạy.
- `npm run test:smoke` chạy nhanh các test `@smoke` (chromium + api).
- `npx playwright test --project=api` test API Book. `npx playwright test --project=chromium` test giao diện.
- `npm run test:setup` đăng nhập CRM lại khi phiên trong `playwright/.auth/` hết hạn.
- Report: `npm run report` (HTML), `npm run allure:generate -- --clean` rồi `npm run allure:open` (Allure).
- Sửa code xong: chạy `npm run typecheck` và các test liên quan trước khi báo xong.
