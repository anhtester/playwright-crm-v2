# playwright-crm

[![Playwright Tests](https://github.com/anhtester/playwright-crm-v2/actions/workflows/playwright.yml/badge.svg)](https://github.com/anhtester/playwright-crm-v2/actions/workflows/playwright.yml)

Project mẫu của khoá **Playwright TypeScript + Ứng dụng AI** (Anh Tester). Test trên hai hệ thống demo:

| Hệ thống | Địa chỉ | Có gì |
|---|---|---|
| CRM (Perfex) | https://crm.anhtester.com | Test giao diện: trang đăng nhập Admin, khu khách hàng, Customers, Projects, nhiều vai trò |
| Book | https://book.anhtester.com | Test API (`/swagger`) và test giao diện, giả lập API bằng Network Interception |

Playwright Test 1.65 · TypeScript · Page Object Model + Component · Fixture · `.env` nhiều môi trường ·
data JSON/CSV/Excel + Faker · HTML Report + Allure 3 · GitHub Actions.

## 1. Cài đặt

Cần Node.js 24 LTS.

```bash
npm ci
npx playwright install chromium     # thêm firefox webkit nếu chạy các project đó
```

Tạo file môi trường từ file mẫu rồi điền tài khoản demo **của bạn** (file này không được commit):

```bash
cp .env.example .env.dev            # Windows CMD: copy .env.example .env.dev
```

Mật khẩu có dấu `#` hoặc dấu cách thì đặt trong ngoặc kép.

## 2. Chạy test

| Lệnh | Làm gì |
|---|---|
| `npm run typecheck` | Kiểm kiểu TypeScript (Playwright chạy file `.ts` mà không kiểm kiểu) |
| `npx playwright test --list` | Đếm test trước khi chạy |
| `npm run test:smoke` | Chỉ các test `@smoke` trên chromium và api |
| `npm run test:chromium` | Toàn bộ test giao diện trên Chromium |
| `npx playwright test --project=api` | Toàn bộ test API của Book |
| `npm test` | Mọi project trong `playwright.config.ts` |
| `npm run test:setup` | Đăng nhập CRM lại, lưu phiên vào `playwright/.auth/` (phiên hết hạn sau vài giờ) |
| `npm run test:ui` | UI Mode: chạy, xem lại từng bước |
| `npm run test:debug` | Chạy từng bước với Playwright Inspector |
| `npm run test:staging` | Chạy với file `.env.staging` |

Số worker đặt ở một chỗ: biến `WORKERS` trong `.env.dev` (CRM demo dùng chung, đừng để quá 4–8).

## 3. Xem report

```bash
npm run report                          # HTML Report
npm run allure:generate -- --clean      # sinh Allure Report từ allure-results/
npm run allure:open
```

Allure 3 cài sẵn trong project, không cần Java. Xoá `allure-results/` trước lần chạy cần report sạch.

## 4. CI (GitHub Actions)

Workflow `.github/workflows/playwright.yml` chạy khi push lên `main`, khi có Pull Request, 6h sáng thứ Hai
(giờ Việt Nam) và khi bấm **Run workflow**. Các lượt chạy: https://github.com/anhtester/playwright-crm-v2/actions

- Tài khoản CRM lấy từ **Settings → Secrets and variables → Actions**, tên trùng tên biến trong `.env.example`.
- Đăng nhập chạy ở bước riêng, không ghi trace và report (tránh lộ mật khẩu trong artifact).
- CI hiện chỉ chạy test CRM: test Book viết theo bản Book mới, `book.anhtester.com` chưa lên bản này.
- HTML Report và Allure Report được lưu thành artifact 14 ngày.

## 5. Cấu trúc

```text
playwright-crm/
├── .github/workflows/playwright.yml   CI
├── .claude/rules/project_*.md         quy tắc cho AI (Claude Code)
├── CLAUDE.md                          hướng dẫn chung cho Claude Code
├── api/                               client API của Book (BaseApi, BookApi...)
├── components/                        component dùng chung giữa các trang
├── data/                              data test (JSON, CSV, Excel, mock)
├── fixtures/                          fixture: page object, vai trò, API
├── pages/                             Page Object
├── tests/                             test giao diện, tests/api/ test API, *.setup.ts đăng nhập
├── utils/                             env, factory, đọc data, tiện ích
├── playwright.config.ts
└── .env.example                       mẫu biến môi trường (không có mật khẩu)
```

Không commit: `.env.*` (trừ `.env.example`), `playwright/.auth/`, `test-results/`, `playwright-report/`, `allure-*`.
