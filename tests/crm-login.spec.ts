import { test, expect } from '@playwright/test';

const LOGIN_URL = '/admin/authentication';
const FORGOT_URL = '/admin/authentication/forgot_password';
const LOGIN_TITLE = 'Perfex CRM | Anh Tester Demo - Login';

test.describe('CRM - Trang đăng nhập Admin', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(LOGIN_URL);
  });

  test('CRM_LOGIN_TC_001 - Mở trang đăng nhập khi chưa có phiên thì thấy biểu mẫu đăng nhập',
    { tag: ['@smoke', '@ui'] }, async ({ page }) => {
      await expect(page).toHaveURL(LOGIN_URL);
      await expect(page).toHaveTitle(LOGIN_TITLE);
      await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible();
    });

  test('CRM_LOGIN_TC_002 - Biểu mẫu đăng nhập đủ thành phần và đúng trạng thái mặc định',
    { tag: ['@smoke', '@ui'] }, async ({ page }) => {
      const emailInput = page.getByLabel('Email Address');
      const passwordInput = page.getByLabel('Password');
      const rememberCheckbox = page.getByRole('checkbox', { name: 'Remember me' });
      const loginButton = page.getByRole('button', { name: 'Login' });

      await test.step('Mục 1: đủ 5 thành phần', async () => {
        await expect(emailInput).toBeVisible();
        await expect(passwordInput).toBeVisible();
        await expect(rememberCheckbox).toBeVisible();
        await expect(loginButton).toBeVisible();
        await expect(page.getByRole('link', { name: 'Forgot Password?' })).toBeVisible();
      });

      await test.step('Mục 2: con trỏ nằm sẵn trong ô Email', async () => {
        await expect(emailInput).toBeFocused();
      });

      await test.step('Mục 3 và 4: Remember me chưa tick, nút Login bấm được', async () => {
        await expect(rememberCheckbox).not.toBeChecked();
        await expect(rememberCheckbox).toBeEnabled();
        await expect(loginButton).toBeEnabled();
      });

      await test.step('Mục 5: ô Password che ký tự', async () => {
        await passwordInput.fill('Abc12345');
        await expect(passwordInput).toHaveAttribute('type', 'password');
        await expect(passwordInput).toHaveValue('Abc12345');
      });

      await test.step('Mục 6: bấm vào chữ Remember me thì checkbox được tick', async () => {
        await page.getByText('Remember me').click();
        await expect(rememberCheckbox).toBeChecked();
      });
    });

  test.fail('CRM_LOGIN_TC_004 - Bấm logo trên trang đăng nhập thì về trang chủ công khai',
    {
      tag: ['@regression', '@ui'],
      annotation: { type: 'issue', description: 'BUG_login_1787226513_TC004: logo dẫn sang /authentication/login' },
    }, async ({ page }) => {
      await page.getByRole('link', { name: 'Perfex CRM | Anh Tester Demo' }).click();
      await expect(page).toHaveURL('/');
    });

  const protectedUrls = [
    { variant: 'a', name: 'Danh sách khách hàng', url: '/admin/clients', tag: '@smoke' },
    { variant: 'b', name: 'Trang Dashboard', url: '/admin/', tag: '@regression' },
  ];
  for (const { variant, name, url, tag } of protectedUrls) {
    test(`CRM_LOGIN_TC_021-${variant} - Mở thẳng URL nội bộ khi chưa đăng nhập thì bị đưa về trang đăng nhập: ${name}`,
      { tag: [tag, '@security'] }, async ({ page }) => {
        await page.goto(url);
        await expect(page).toHaveURL(LOGIN_URL);
        await expect(page).toHaveTitle(LOGIN_TITLE);
        await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
      });
  }

  test('CRM_LOGIN_TC_027 - Trang Quên mật khẩu mở đúng, đủ thành phần và không có lối quay lại đăng nhập',
    { tag: ['@regression', '@ui'] }, async ({ page, baseURL }) => {
      await page.getByRole('link', { name: 'Forgot Password?' }).click();

      await test.step('Mục 1: đúng URL', async () => {
        await expect(page).toHaveURL(FORGOT_URL);
      });

      await test.step('Mục 2: tiêu đề, đúng 1 ô nhập, nút Confirm', async () => {
        await expect(page.getByRole('heading', { name: 'Forgot Password' })).toBeVisible();
        await expect(page.getByRole('textbox')).toHaveCount(1);
        await expect(page.getByLabel('Email Address')).toBeVisible();
        await expect(page.getByRole('button', { name: 'Confirm' })).toBeVisible();
      });

      await test.step('Mục 3: link duy nhất trên trang là logo', async () => {
        await expect(page.getByRole('link')).toHaveCount(1);
        await expect(page.getByRole('link', { name: 'Perfex CRM | Anh Tester Demo' }))
          .toHaveAttribute('href', `${baseURL}/`);
      });
    });

  test('CRM_LOGIN_TC_038 - Điều hướng biểu mẫu đăng nhập hoàn toàn bằng bàn phím (dừng trước khi gửi biểu mẫu)',
    { tag: ['@regression', '@accessibility'] }, async ({ page }) => {
      const emailInput = page.getByLabel('Email Address');
      const passwordInput = page.getByLabel('Password');
      const rememberCheckbox = page.getByRole('checkbox', { name: 'Remember me' });

      await test.step('Bước 1-2: gõ ngay vào ô Email, không bấm chuột', async () => {
        await expect(emailInput).toBeFocused();
        await page.keyboard.type('tester@example.com');
        await expect(emailInput).toHaveValue('tester@example.com');
      });

      await test.step('Bước 3-4: Tab sang ô Password rồi gõ một chuỗi giả', async () => {
        await page.keyboard.press('Tab');
        await expect(passwordInput).toBeFocused();
        await page.keyboard.type('Abc12345');
        await expect(passwordInput).toHaveValue('Abc12345');
      });

      await test.step('Bước 5-6: Tab tới Remember me, phím Space tick được', async () => {
        await page.keyboard.press('Tab');
        await expect(rememberCheckbox).toBeFocused();
        await page.keyboard.press('Space');
        await expect(rememberCheckbox).toBeChecked();
      });

      await test.step('Bước 7 (nửa đầu): Tab tới nút Login rồi dừng, không nhấn Enter', async () => {
        await page.keyboard.press('Tab');
        await expect(page.getByRole('button', { name: 'Login' })).toBeFocused();
      });
    });

  test('CRM_LOGIN_TC_048 - Ô Email không tự cắt bớt ký tự khi dán chuỗi dài vào',
    { tag: ['@regression', '@boundary'] }, async ({ page }) => {
      const longText = 'a'.repeat(300);
      const emailInput = page.getByLabel('Email Address');

      await emailInput.fill(longText);

      await expect(emailInput).toHaveValue(longText);
      expect((await emailInput.inputValue()).length).toBe(300);
    });

  const viewports = [
    { variant: 'a', name: 'Màn hình lớn', width: 1920, height: 1080 },
    { variant: 'b', name: 'Màn hình chuẩn dự án', width: 1600, height: 750 },
    { variant: 'c', name: 'Laptop phổ thông', width: 1366, height: 700 },
    { variant: 'd', name: 'Máy tính bảng dọc', width: 768, height: 1024 },
    { variant: 'e', name: 'Điện thoại', width: 375, height: 700 },
  ];
  for (const { variant, name, width, height } of viewports) {
    test(`CRM_LOGIN_TC_049-${variant} - Trang đăng nhập giữ đúng bố cục: ${name} ${width}x${height}`,
      { tag: ['@regression', '@responsive'] }, async ({ page }) => {
        await page.setViewportSize({ width, height });
        await page.reload();

        await test.step('Bước 4: không cuộn ngang được', async () => {
          const size = await page.evaluate(() => ({
            scrollWidth: document.documentElement.scrollWidth,
            clientWidth: document.documentElement.clientWidth,
          }));
          expect(size.scrollWidth).toBeLessThanOrEqual(size.clientWidth);
        });

        await test.step('Bước 5: thấy đủ 7 thành phần', async () => {
          await expect(page.getByAltText('Perfex CRM | Anh Tester Demo')).toBeVisible();
          await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible();
          await expect(page.getByLabel('Email Address')).toBeVisible();
          await expect(page.getByLabel('Password')).toBeVisible();
          await expect(page.getByRole('checkbox', { name: 'Remember me' })).toBeVisible();
          await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
          await expect(page.getByRole('link', { name: 'Forgot Password?' })).toBeVisible();
        });
      });
  }
});
