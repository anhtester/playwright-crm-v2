import { mergeTests } from '@playwright/test';
import { test as commonTest } from './common.fixture';
import { test as pagesTest } from './pages.fixture';
import { test as rolesTest } from './roles.fixture';
import { test as apiTest } from './api.fixture';

/** Điểm nhập DUY NHẤT của các file test: import { test, expect } from '../fixtures'; */
export const test = mergeTests(commonTest, pagesTest, rolesTest, apiTest);

export { expect } from '@playwright/test';
