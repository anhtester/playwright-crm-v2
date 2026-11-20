import { test, expect } from '../fixtures';

const CATEGORY_HREF = /\/knowledge-base\/category\/.+/;

test.describe('CRM - Khu khách hàng: đăng nhập, quên mật khẩu, Knowledge Base (POM + Fixture)', () => {
  test('CRM_CLIENT_TC_001 - Mở trang đăng nhập khách hàng thì thấy biểu mẫu đăng nhập',
    { tag: ['@smoke', '@ui'] }, async ({ page, clientLoginPage }) => {
      await clientLoginPage.goto();

      await clientLoginPage.expectLoaded();
      await expect(page).toHaveTitle('Please login');
    });

  test('CRM_CLIENT_TC_002 - Biểu mẫu đăng nhập khách hàng đủ thành phần và đúng trạng thái mặc định',
    { tag: ['@smoke', '@ui'] }, async ({ clientLoginPage }) => {
      await clientLoginPage.goto();

      await test.step('Mục 1: ngôn ngữ mặc định là English, danh sách có Vietnamese', async () => {
        await expect(clientLoginPage.languageSelect).toHaveValue('english');
        await expect(clientLoginPage.languageOptions.filter({ hasText: 'Vietnamese' })).toHaveCount(1);
      });

      await test.step('Mục 2: con trỏ nằm sẵn trong ô Email, ô Password che ký tự', async () => {
        await expect(clientLoginPage.emailInput).toBeFocused();
        await expect(clientLoginPage.passwordInput).toHaveAttribute('type', 'password');
      });

      await test.step('Mục 3: Remember me chưa tick, nút Login bấm được, có link Forgot Password?', async () => {
        await expect(clientLoginPage.rememberMeCheckbox).not.toBeChecked();
        await expect(clientLoginPage.loginButton).toBeEnabled();
        await expect(clientLoginPage.forgotPasswordLink).toBeVisible();
      });
    });

  test('CRM_CLIENT_TC_003 - Navbar có logo và đúng 2 mục menu theo thứ tự',
    { tag: ['@regression', '@ui'] }, async ({ clientLoginPage, baseURL }) => {
      await clientLoginPage.goto();
      const navbar = clientLoginPage.navbar;

      await expect(navbar.logoLink).toBeVisible();
      await expect(navbar.menuLinks).toHaveText(['Knowledge Base', 'Login']);
      await expect(navbar.knowledgeBaseLink).toHaveAttribute('href', /\/knowledge-base$/);
      await expect(navbar.loginLink).toHaveAttribute('href', `${baseURL}${clientLoginPage.path}`);
    });

  test('CRM_CLIENT_TC_004 - Link Forgot Password? mở đúng trang Quên mật khẩu của khách hàng',
    { tag: ['@smoke', '@navigation'] }, async ({ clientForgotPasswordPage, testEmail }) => {
      // clientForgotPasswordPage đã tự đi qua trang đăng nhập (Fixture Chaining)
      await clientForgotPasswordPage.expectLoaded();
      await expect(clientForgotPasswordPage.allTextboxes).toHaveCount(1);
      await expect(clientForgotPasswordPage.submitButton).toBeVisible();

      await clientForgotPasswordPage.fillEmail(testEmail); // chỉ điền, KHÔNG bấm Submit
      await expect(clientForgotPasswordPage.emailInput).toHaveValue(testEmail);
    });

  const protectedUrls = [
    { variant: 'a', name: 'Trang đăng ký (đang tắt)', path: '/authentication/register' },
    { variant: 'b', name: 'Khu vực sau đăng nhập', path: '/clients/' },
  ];
  for (const { variant, name, path } of protectedUrls) {
    test(`CRM_CLIENT_TC_005-${variant} - Mở thẳng URL khi chưa đăng nhập thì bị đưa về trang đăng nhập: ${name}`,
      { tag: ['@regression', '@security'] }, async ({ page, clientLoginPage }) => {
        await page.goto(path);

        await clientLoginPage.expectLoaded();
      });
  }

  test('CRM_CLIENT_TC_006 - Đi lại giữa trang đăng nhập và Knowledge Base bằng navbar',
    { tag: ['@smoke', '@navigation'] }, async ({ clientLoginPage, knowledgeBasePage }) => {
      await clientLoginPage.goto();

      await test.step('Đăng nhập -> Knowledge Base', async () => {
        await clientLoginPage.navbar.openKnowledgeBase();
        await knowledgeBasePage.expectLoaded();
      });

      await test.step('Knowledge Base -> Đăng nhập', async () => {
        await knowledgeBasePage.navbar.openLogin();
        await clientLoginPage.expectLoaded();
      });
    });

  test('CRM_CLIENT_TC_007 - Trang Knowledge Base có ô tìm kiếm và danh sách danh mục',
    { tag: ['@smoke', '@ui'] }, async ({ page, knowledgeBasePage }) => {
      await knowledgeBasePage.goto();
      await knowledgeBasePage.expectLoaded();

      await expect(page).toHaveTitle('Knowledge Base');
      await expect(knowledgeBasePage.searchInput).toBeEditable();
      await expect(knowledgeBasePage.searchButton).toBeEnabled();
      await expect(knowledgeBasePage.categoryLinks).not.toHaveCount(0);
      for (const link of await knowledgeBasePage.categoryLinks.all()) {
        await expect(link).toHaveAttribute('href', CATEGORY_HREF);
      }
    });

  test('CRM_CLIENT_TC_008 - Tìm từ khoá không có bài viết nào thì báo không tìm thấy',
    { tag: ['@regression', '@search'] }, async ({ knowledgeBasePage, runId }) => {
      const keyword = `khong-co-${runId}`; // runId: fixture phạm vi worker của common.fixture.ts
      await knowledgeBasePage.goto();

      const searchPage = await knowledgeBasePage.search(keyword);

      await searchPage.expectLoaded();
      await expect(searchPage.emptyMessage).toBeVisible();
      await expect(searchPage.articleLinks).toHaveCount(0);
      await expect(searchPage.searchInput).toHaveValue(keyword);
    });

  test('CRM_CLIENT_TC_009 - Mở danh mục đầu tiên thì tới đúng trang danh mục',
    { tag: ['@regression', '@navigation'] }, async ({ page, knowledgeBasePage }) => {
      await knowledgeBasePage.goto();
      await expect(knowledgeBasePage.categoryLinks).not.toHaveCount(0);
      const [firstCategory] = await knowledgeBasePage.categoryNames(); // đọc từ trang, không ghi cứng

      const categoryPage = await knowledgeBasePage.openCategory(firstCategory);

      await categoryPage.expectLoaded();
      await expect(page).toHaveTitle(firstCategory);
    });

  test('CRM_CLIENT_TC_010 - Ba trang công khai không có lỗi JavaScript',
    { tag: ['@regression', '@ui'] }, async ({ clientLoginPage, clientForgotPasswordPage, knowledgeBasePage, consoleErrors }) => {
      // clientForgotPasswordPage đã mở trang đăng nhập rồi trang Quên mật khẩu
      await clientForgotPasswordPage.expectLoaded();
      await knowledgeBasePage.goto();
      await knowledgeBasePage.expectLoaded();
      await clientLoginPage.goto();
      await clientLoginPage.expectLoaded();

      expect(consoleErrors, 'Các trang công khai của khu khách hàng không được có lỗi JavaScript').toEqual([]);
    });
});
