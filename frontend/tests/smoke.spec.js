import { test, expect } from '@playwright/test';

test('app loads and shows health indicator', async ({ page }) => {
  await page.goto('/');
  const indicator = page.locator('#health-indicator');
  await expect(indicator).toBeVisible();
});

test('controls exist and respond', async ({ page }) => {
  await page.goto('/');
  const modeSelect = page.locator('#mode-select');
  await expect(modeSelect).toBeVisible();
  await modeSelect.selectOption('network');
  const centerBtn = page.locator('#btn-center');
  await expect(centerBtn).toBeVisible();
  await centerBtn.click();
  const slider = page.locator('#influence-range');
  await expect(slider).toBeVisible();
  await slider.focus();
});

test('details panel opens on shortcut', async ({ page }) => {
  await page.goto('/');
  // Switch to network mode to ensure nodes exist
  await page.selectOption('#mode-select', 'network');
  // Trigger helper shortcut
  await page.keyboard.press('n');
  await expect(page.locator('#details-panel')).toBeVisible();
});
