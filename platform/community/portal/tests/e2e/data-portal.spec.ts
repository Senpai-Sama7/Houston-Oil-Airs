// E2E test for data portal page
import { test, expect } from '@playwright/test';

test.describe('Data Portal', () => {
  test('should load data portal page', async ({ page }) => {
    await page.goto('/data-portal');
    
    await expect(page).toHaveTitle(/Data Portal/);
    await expect(page.locator('h1:has-text("Data Portal")')).toBeVisible();
  });

  test('should filter datasets by category', async ({ page }) => {
    await page.goto('/data-portal');
    
    // Select environmental category
    await page.selectOption('select#category', 'environment');
    
    // Wait for filter to apply
    await page.waitForTimeout(500);
    
    // Check that filtered results are shown
    const resultsText = page.locator('text=/Showing .* of .* datasets/');
    await expect(resultsText).toBeVisible();
  });

  test('should search datasets', async ({ page }) => {
    await page.goto('/data-portal');
    
    // Type in search box
    await page.fill('input#search', 'air quality');
    
    // Wait for search to apply
    await page.waitForTimeout(500);
    
    // Verify search results
    const resultsText = page.locator('text=/Showing .* of .* datasets/');
    await expect(resultsText).toBeVisible();
  });

  test('should have accessible forms', async ({ page }) => {
    await page.goto('/data-portal');
    
    // Check search input has label
    const searchInput = page.locator('input#search');
    await expect(searchInput).toHaveAttribute('aria-label');
    
    // Check category select has label
    const categorySelect = page.locator('select#category');
    await expect(categorySelect).toHaveAttribute('aria-label');
  });
});
