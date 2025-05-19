import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('should navigate to login page', async ({ page }) => {
        await page.getByRole('link', { name: /login/i }).click();
        await expect(page).toHaveURL(/.*login/);
    });

    test('should show validation errors with invalid credentials', async ({ page }) => {
        await page.goto('/login');
        await page.getByLabel(/email/i).fill('invalid@test.com');
        await page.getByLabel(/password/i).fill('wrongpass');
        await page.getByRole('button', { name: /sign in/i }).click();

        await expect(page.getByText(/invalid credentials/i)).toBeVisible();
    });

    test('should allow user to sign up', async ({ page }) => {
        await page.goto('/sign-up');

        const testEmail = `test${Date.now()}@example.com`;
        await page.getByLabel(/name/i).fill('Test User');
        await page.getByLabel(/email/i).fill(testEmail);
        await page.getByLabel(/password/i).fill('Test123!@#');
        await page.getByRole('button', { name: /sign up/i }).click();

        // Should redirect to login after successful signup
        await expect(page).toHaveURL(/.*login/);
    });

    test('should allow user to login with valid credentials', async ({ page }) => {
        await page.goto('/login');
        await page.getByLabel(/email/i).fill(process.env.TEST_USER_EMAIL || 'test@example.com');
        await page.getByLabel(/password/i).fill(process.env.TEST_USER_PASSWORD || 'Test123!@#');
        await page.getByRole('button', { name: /sign in/i }).click();

        // Should redirect to dashboard after successful login
        await expect(page).toHaveURL(/.*dashboard/);
    });

    test('should allow password reset request', async ({ page }) => {
        await page.goto('/forgot-password');
        await page.getByLabel(/email/i).fill('test@example.com');
        await page.getByRole('button', { name: /reset password/i }).click();

        await expect(page.getByText(/check your email/i)).toBeVisible();
    });

    test('should show social login options', async ({ page }) => {
        await page.goto('/login');
        await expect(page.getByRole('button', { name: /continue with google/i })).toBeVisible();
        await expect(page.getByRole('button', { name: /continue with github/i })).toBeVisible();
    });
});
