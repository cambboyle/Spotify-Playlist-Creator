crate/tests/user-flow.spec.js
// Basic Playwright E2E test scaffold for user flow: Connect → Search → Add tracks → Save playlist

const { test, expect } = require('@playwright/test');

test.describe('Crate App User Flow', () => {
  test('Connect, search, add tracks, and save playlist', async ({ page }) => {
    // Go to the app
    await page.goto('/');

    // Step 1: Connect to Spotify (mock or skip if not available in test env)
    // NOTE: This step may require mocking OAuth or running against a test account.
    // For now, check if the Connect button exists and click it.
    const connectBtn = page.locator('button', { hasText: /connect to spotify/i });
    if (await connectBtn.isVisible()) {
      await connectBtn.click();
      // TODO: Handle OAuth flow or mock login for test environment
      // For now, skip actual login for scaffold
    }

    // Step 2: Search for a track
    const searchInput = page.locator('input[type="search"], input[placeholder*="Search"]');
    await expect(searchInput).toBeVisible();
    await searchInput.fill('Daft Punk');
    await searchInput.press('Enter');

    // Step 3: Wait for search results and add the first track
    const addButtons = page.locator('button', { hasText: /add/i });
    await expect(addButtons.first()).toBeVisible();
    await addButtons.first().click();

    // Step 4: Save the playlist
    const saveBtn = page.locator('button', { hasText: /save to spotify/i });
    await expect(saveBtn).toBeVisible();
    await saveBtn.click();

    // Step 5: Confirm success (look for a success message or playlist reset)
    // This will depend on your app's UI feedback
    // Example: expect a toast, alert, or playlist name reset
    // await expect(page.locator('.success-message')).toBeVisible();
    // For now, just check that the playlist name resets to "New Playlist"
    const playlistNameInput = page.locator('input', { hasValue: 'New Playlist' });
    await expect(playlistNameInput).toBeVisible();
  });
});
