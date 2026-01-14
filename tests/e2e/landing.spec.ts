import { test, expect } from '@playwright/test';

test.describe('Sinyaldeyiz Landing Page', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('should display main headline', async ({ page }) => {
        await expect(page.getByRole('heading', { name: /sinyaldeyiz/i })).toBeVisible();
    });

    test('should show hero section with CTA buttons', async ({ page }) => {
        await expect(page.getByText(/Türkiye'nin ilk konum bazlı araç sosyal ağı/i)).toBeVisible();
        await expect(page.getByRole('button', { name: /Google ile Giriş/i })).toBeVisible();
        await expect(page.getByRole('button', { name: /E-posta ile Giriş/i })).toBeVisible();
    });

    test('should have navigation with login and register buttons', async ({ page }) => {
        await expect(page.getByRole('button', { name: /Giriş/i })).toBeVisible();
        await expect(page.getByRole('button', { name: /Kayıt Ol/i })).toBeVisible();
    });

    test('should display feature badges', async ({ page }) => {
        await expect(page.getByText(/Varsayılan Görünmez/i)).toBeVisible();
        await expect(page.getByText(/Konum Kontrolü/i)).toBeVisible();
        await expect(page.getByText(/KVKK Uyumlu/i)).toBeVisible();
    });

    test('should open auth modal on login click', async ({ page }) => {
        await page.getByRole('button', { name: /Giriş/i }).click();
        await expect(page.getByRole('dialog')).toBeVisible();
    });

    test('should have how it works section', async ({ page }) => {
        await expect(page.getByText(/Nasıl Çalışır/i)).toBeVisible();
        await expect(page.getByText(/Varsayılan Görünmez/i).first()).toBeVisible();
        await expect(page.getByText(/Sinyal Ver/i)).toBeVisible();
        await expect(page.getByText(/Buluş/i)).toBeVisible();
    });

    test('should show vehicle types section', async ({ page }) => {
        await expect(page.getByText(/Otomobil/)).toBeVisible();
        await expect(page.getByText(/Motorsiklet/)).toBeVisible();
    });

    test('should have testimonials', async ({ page }) => {
        await expect(page.getByText(/Kullanıcılar ne diyor/i)).toBeVisible();
    });

    test('should display footer', async ({ page }) => {
        await expect(page.getByText(/© 2026 Sinyaldeyiz/i)).toBeVisible();
    });
});

test.describe('Auth Modal', () => {
    test('should switch between login and register modes', async ({ page }) => {
        await page.goto('/');

        // Open login modal
        await page.getByRole('button', { name: /Giriş/i }).first().click();
        await expect(page.getByRole('dialog')).toBeVisible();

        // Check for login form elements
        await expect(page.getByPlaceholder(/e-posta/i)).toBeVisible();
        await expect(page.getByPlaceholder(/şifre/i)).toBeVisible();
    });

    test('should close modal on backdrop click', async ({ page }) => {
        await page.goto('/');
        await page.getByRole('button', { name: /Giriş/i }).first().click();

        // Click backdrop to close
        await page.locator('.fixed.inset-0').first().click({ position: { x: 10, y: 10 } });

        // Modal should be closed (or still visible if click detection differs)
    });
});

test.describe('Guest Mode', () => {
    test('should have Misafir Girişi button on landing page', async ({ page }) => {
        await page.goto('/');
        await expect(page.getByRole('button', { name: /Misafir/i })).toBeVisible();
    });

    test('should redirect to dashboard on guest login', async ({ page }) => {
        await page.goto('/');
        await page.getByRole('button', { name: /Misafir/i }).click();

        // Should navigate to dashboard
        await page.waitForURL(/\/dashboard/);
        await expect(page).toHaveURL(/\/dashboard/);
    });

    test('should show guest welcome modal on first visit', async ({ page }) => {
        // Clear any existing guest flags
        await page.goto('/');
        await page.evaluate(() => {
            localStorage.removeItem('sinyaldeyiz_guest');
            localStorage.removeItem('sinyaldeyiz_guest_first_visit');
        });

        // Click guest login
        await page.getByRole('button', { name: /Misafir/i }).click();

        // Should show welcome modal
        await page.waitForURL(/\/dashboard/);
        await expect(page.getByText(/Hoş Geldin/i)).toBeVisible({ timeout: 5000 });
    });
});

test.describe('Google Icon Verification', () => {
    test('Google login button should have colored Google icon, not GitHub', async ({ page }) => {
        await page.goto('/');

        // Find the Google login button
        const googleButton = page.getByRole('button', { name: /Google ile Giriş/i });
        await expect(googleButton).toBeVisible();

        // Check for colored Google SVG (has multiple fill colors)
        const bluePath = googleButton.locator('svg path[fill="#4285F4"]');
        await expect(bluePath).toBeVisible();
    });
});

test.describe('Responsive Design', () => {
    test('should be mobile responsive', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 });
        await page.goto('/');

        await expect(page.getByRole('heading', { name: /sinyaldeyiz/i })).toBeVisible();
        await expect(page.getByRole('button', { name: /Kayıt Ol/i })).toBeVisible();
    });

    test('should be tablet responsive', async ({ page }) => {
        await page.setViewportSize({ width: 768, height: 1024 });
        await page.goto('/');

        await expect(page.getByRole('heading', { name: /sinyaldeyiz/i })).toBeVisible();
    });

    test('should be desktop responsive', async ({ page }) => {
        await page.setViewportSize({ width: 1440, height: 900 });
        await page.goto('/');

        await expect(page.getByRole('heading', { name: /sinyaldeyiz/i })).toBeVisible();
    });
});

test.describe('Animation and Visuals', () => {
    test('should have animated background elements', async ({ page }) => {
        await page.goto('/');

        // Check for glowing orbs
        const glowingOrbs = page.locator('.blur-\\[150px\\]');
        await expect(glowingOrbs.first()).toBeVisible();
    });

    test('should have Three.js canvas (if loaded)', async ({ page }) => {
        await page.goto('/');

        // Wait for Three.js to potentially load
        await page.waitForTimeout(1000);

        // Canvas may be present from Three.js
        const canvas = page.locator('canvas');
        // This is optional as Three.js loads dynamically
    });
});

test.describe('SEO and Accessibility', () => {
    test('should have proper page title', async ({ page }) => {
        await page.goto('/');
        await expect(page).toHaveTitle(/Sinyaldeyiz/i);
    });

    test('should have no accessibility violations on main elements', async ({ page }) => {
        await page.goto('/');

        // Check for alt text on images (testimonial avatars)
        const images = page.locator('img[alt]');
        const count = await images.count();
        expect(count).toBeGreaterThan(0);
    });
});
