import { type Page } from '@playwright/test';
import { AdminListPage } from './admin-list.page';

/** Trang danh sách Projects của khu Admin */
export class ProjectListPage extends AdminListPage {
  constructor(page: Page) {
    super(page, '/admin/projects', 'projects');
  }
}
