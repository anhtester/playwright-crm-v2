# Quy tắc cấu hình riêng của project (Playwright TypeScript)

> Chỗ nào khác với mẫu `playwright.config.ts` trong bộ kit (vị trí thư mục, số project,
> viewport, số worker) thì LÀM THEO FILE NÀY. Các quy tắc còn lại của bộ kit giữ nguyên.

## Cấu hình chung
- File cấu hình duy nhất là `playwright.config.ts` ở gốc project, viết bằng `defineConfig`.
- Test nằm ở `tests/` (KHÔNG phải `src/tests/`), tên file `*.spec.ts`. Không đổi `testDir`, `testMatch`.
- `timeout` của một test 30 giây, `expect.timeout` 5 giây. Test chậm thì dùng `test.slow()`,
  KHÔNG tăng timeout chung của cả project.
- `retries` chỉ bật trên CI (`process.env.CI ? 2 : 0`). Ở máy mình test đỏ phải đỏ ngay để còn sửa.
- Giữ `forbidOnly: !!process.env.CI`. Không commit `test.only`.
- Kiểm kiểu bằng `npm run typecheck` (`tsc --noEmit`, đọc `tsconfig.json` ở gốc). Playwright chạy file `.ts`
  mà KHÔNG kiểm kiểu, nên sửa code xong phải chạy lệnh này. KHÔNG thêm `// @ts-ignore`, `as any` để qua lỗi.
- Tag `@smoke`: chỉ 1–2 test đường chính của mỗi khu (trang đăng nhập CRM, khu khách hàng, Customers,
  Book API, Book UI). Chạy bằng `npm run test:smoke`. KHÔNG gắn `@smoke` cho mọi test mới.

## Projects
- Ba project trình duyệt máy tính: `chromium`, `firefox`, `webkit`, dùng `devices[...]` có sẵn.
- Project điện thoại `mobile-chrome` (`devices['Pixel 7']`) chỉ chạy test `@smoke` của khu khách hàng.
  Thêm file vào project này thì sửa `testMatch` của project, KHÔNG viết `if (isMobile)` trong test.
- Muốn chạy một trình duyệt thì chọn bằng dòng lệnh (`--project=chromium` hoặc `npm run test:chromium`),
  KHÔNG xoá project khỏi file cấu hình.
- Giao diện khác nhau giữa máy tính và điện thoại (menu thu gọn...) thì xử lý trong Page Object
  hoặc Component, KHÔNG sửa test.

## Khối use
- Thiết lập dùng chung đặt ở `use` của `defineConfig`. Project chỉ ghi đè thứ riêng của nó
  (thường là `...devices[...]`). Một file test cần khác thì dùng `test.use({...})` ở đầu file.
- Nhớ thứ tự thắng: `test.use()` > `use` của project > `use` chung. `devices[...]` đã có `viewport`,
  nên KHÔNG đặt `viewport` ở `use` chung (bị project ghi đè, không có tác dụng).
- Địa chỉ CRM lấy từ `baseURL`. Trong Page Object và test chỉ viết đường dẫn tương đối
  (`'/admin/authentication'`). Cần địa chỉ đầy đủ (so `href`) thì xin fixture `baseURL`.
- `locale: 'en-US'`, `timezoneId: 'Asia/Ho_Chi_Minh'` cố định để máy nào chạy cũng ra cùng kết quả.
- Bằng chứng khi lỗi: `screenshot: 'only-on-failure'`, `video: 'retain-on-failure'`,
  `trace: 'retain-on-failure'`. KHÔNG để `'on'` cho cả bộ test (chậm và tốn dung lượng).
- KHÔNG đặt `headless: false` trong file cấu hình. Muốn xem trình duyệt thì gõ `--headed`.

## Biến môi trường (.env)
- Địa chỉ hệ thống và tài khoản KHÔNG viết trong code. Chúng nằm ở file `.env.<môi trường>` tại gốc project:
  `.env.dev`, `.env.staging`, `.env.prod`. Chọn file bằng biến `TEST_ENV` (mặc định `dev`).
- Chỉ `utils/env.config.ts` được đọc `process.env` (trừ `process.env.CI` trong file cấu hình).
  Nơi khác import `env` hoặc `account()` từ file đó. Biến bắt buộc đi qua `required()`,
  KHÔNG dùng `process.env.X!` và KHÔNG đặt giá trị dự phòng cho địa chỉ, mật khẩu.
- Thêm biến mới thì thêm ĐỦ 3 chỗ: `utils/env.config.ts`, `.env.example` (giá trị mẫu, mật khẩu để trống)
  và mọi file `.env.<môi trường>` đang có.
- `.gitignore` luôn có `.env`, `.env.*`, `!.env.example`. Chỉ commit `.env.example`.
- Script chạy theo môi trường viết bằng `cross-env` (`cross-env TEST_ENV=staging playwright test`),
  KHÔNG viết `export`, `set` hay `TEST_ENV=... lệnh` trong `package.json`.
- AI KHÔNG mở, không in, không chép giá trị trong các file `.env.*`. Cần biết có biến nào thì đọc `.env.example`.

## Đăng nhập và Storage State
- Đăng nhập DUY NHẤT ở `tests/auth.setup.ts` (project `setup`), mỗi vai trò một file
  `playwright/.auth/<vai-trò>.json`. Đường dẫn lấy từ `STORAGE` trong `utils/auth.ts`, không viết cứng.
- Test cần phiên thì khai báo `test.use({ storageState: STORAGE.admin })` ở đầu file hoặc trong `describe`.
  KHÔNG gọi `loginPage.login()` với tài khoản thật trong file test.
- Project trình duyệt máy tính có `dependencies: ['setup']`. Không xoá dòng này để "chạy cho nhanh".
- Cần vai trò thứ hai trong cùng một test thì dùng fixture ở `fixtures/roles.fixture.ts` (`pmPage`...).
  `browser.newContext()` kế thừa mọi mục của `use`, kể cả `storageState` của file: luôn truyền rõ
  `storageState` của vai trò cần dùng.
- `playwright/.auth/` nằm trong `.gitignore`. KHÔNG commit, không in nội dung file này ra log hay report.
- Mọi worker dùng chung MỘT phiên trên máy chủ:
  - KHÔNG viết test đăng xuất bằng Storage State dùng chung (làm hỏng phiên của các test khác).
  - KHÔNG kiểm thông báo thoáng qua lưu trong phiên ("... added successfully."). Kiểm kết quả lưu bền:
    URL có id, tiêu đề, dòng trong bảng.

## Chạy song song
- Giữ `fullyParallel: true`: mọi test, kể cả các test trong cùng một file, đều có thể chạy cùng lúc ở các worker khác nhau.
- Số worker lấy từ `WORKERS` trong `.env` (`env.workers`). Để trống thì Playwright tự chọn. Đổi tạm thì gõ `--workers=<số>`.
- Mỗi test phải tự đứng được: tự mở trang, tự tạo dữ liệu nó cần. KHÔNG dùng biến `let` ngoài test để
  truyền dữ liệu từ test này sang test khác (chạy song song thì test sau nằm ở worker khác, biến rỗng).
- Dữ liệu tạo mới luôn không trùng: `uniqueName()` (`utils/data.ts`) hoặc hàm trong `utils/factories.ts`.
- Chuỗi bước phụ thuộc nhau: viết thành MỘT test có `test.step` (`crm-roles.spec.ts`). Chỉ dùng
  `test.describe.configure({ mode: 'serial' })` khi thật sự cần các bước là test riêng, và ghi rõ lý do trong file.
- Test đỏ khi chạy song song mà xanh khi `--workers=1` là test SAI (dùng chung dữ liệu, phiên, biến).
  KHÔNG sửa bằng cách hạ worker về 1 hay bật `serial` cho cả file.

## CI (GitHub Actions)
- Workflow duy nhất: `.github/workflows/playwright.yml`. Trigger: `push` lên `main`, `pull_request`,
  `schedule` (có `timezone: 'Asia/Ho_Chi_Minh'`, thiếu dòng này thì cron tính theo UTC), `workflow_dispatch`.
- Cài bằng `npm ci` (KHÔNG `npm install`), Node 24 qua `actions/setup-node` có `cache: npm`.
  Ngay sau `npm ci` là bước `npm run typecheck`, trước khi cài trình duyệt.
- Repo public: `use` có `trace`, `video`, `screenshot` = `'off'` khi `process.env.CI` (trace của test đã đăng nhập
  có header Cookie `sp_session`, video và ảnh có dữ liệu CRM của người khác). Test đỏ trên CI thì chạy lại trên máy để debug.
  Chỉ cài trình duyệt CI dùng: `npx playwright install --with-deps chromium`.
- Biến thường (`ENV_NAME`, `CRM_URL`, `BOOK_URL`, `WORKERS`) ghi ở `env:` của job. Tài khoản lấy từ
  `${{ secrets.TEN_BIEN }}`, tên trùng tên biến trong `.env.example`. KHÔNG viết giá trị mật khẩu trong YAML,
  KHÔNG `echo` secret, KHÔNG đưa `${{ github.event.* }}` thẳng vào `run:`.
- Đăng nhập chạy ở bước riêng: `npx playwright test --project=setup --reporter=list` (không HTML Report,
  không Allure: các bước `Fill "..."` chứa mật khẩu). Bước test sau đó có `--no-deps`.
- Project `setup`, `api-setup` có `trace: 'off'`, `screenshot: 'off'`, `video: 'off'`. KHÔNG upload `test-results/`.
  KHÔNG thêm cờ `--trace` vào lệnh trên CI: cờ dòng lệnh thắng cả `trace: 'off'` của project.
- Bước test KHÔNG gõ `--reporter=...` (ghi đè `reporter` của config, mất HTML Report và Allure).
- Sinh và upload report có `if: ${{ !cancelled() }}`, `retention-days`. Repo public: ai cũng tải được artifact.
- Book chưa chạy trên CI: `book.anhtester.com` còn bản cũ. Khi Book lên bản mới thì thêm `--project=api`
  và bỏ bộ lọc `tests/crm-` ở bước test (bước đăng nhập thêm `--project=api-setup`).
- Bộ lọc file ở dòng lệnh so với CẢ đường dẫn tuyệt đối của file. Viết kèm thư mục (`tests/crm-`), KHÔNG viết
  `crm-` trơn: trên runner đường dẫn có tên repo (`/home/runner/work/playwright-crm-v2/...`), `crm-` khớp mọi file.
