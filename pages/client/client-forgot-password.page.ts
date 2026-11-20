import { type Page, type Locator } from '@playwright/test';
import { ClientBasePage } from './client-base.page';

export class ClientForgotPasswordPage extends ClientBasePage {
  readonly emailInput: Locator;
  readonly submitButton: Locator;
  readonly allTextboxes: Locator;

  constructor(page: Page) {
    super(page, '/authentication/forgot_password', 'Forgot Password');
    this.emailInput = page.getByLabel('Email Address');
    this.submitButton = page.getByRole('button', { name: 'Submit' });
    this.allTextboxes = page.getByRole('textbox');
  }

  /** Điền ô Email, KHÔNG bấm Submit */
  async fillEmail(email: string): Promise<void> {
    await this.emailInput.fill(email);
  }
}
