// E2E test for landing page
import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
  test('should load successfully', async ({ page }) => {
    await page.goto('/');
    
    // Check page title
    await expect(page).toHaveTitle(/Houston EJ-AI Platform/);
    
    // Check main heading is present
    const header = page.locator('h1, h2').first();
    await expect(header).toBeVisible();
  });

  test('should have accessible navigation', async ({ page }) => {
    await page.goto('/');
    
    // Check navigation exists
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();
    
    // Check tabs are keyboard accessible
    const firstTab = page.locator('button:has-text("Live Data")');
    await firstTab.focus();
    await expect(firstTab).toBeFocused();
  });

  test('should switch between tabs', async ({ page }) => {
    await page.goto('/');
    
    // Click on VR Experience tab
    await page.click('button:has-text("VR Experience")');
    
    // Verify tab is active
    const vrTab = page.locator('button:has-text("VR Experience")');
    await expect(vrTab).toHaveClass(/border-blue-500/);
  });

  test('should have skip to main content link', async ({ page }) => {
    await page.goto('/');
    
    // Press Tab to focus skip link
    await page.keyboard.press('Tab');
    
    // Check skip link is visible when focused
    const skipLink = page.locator('a:has-text("Skip to main content")');
    await expect(skipLink).toBeFocused();
  });
});
