import puppeteer, { Page } from 'puppeteer';

export async function noVNo(page: Page) {
	await page.$$('div.page-contents-lazy').then(async (elements) => {
		for (const element of elements) {
			await element.evaluate((el) => (el.style.display = 'block'));
		}
	});

	await page.$$('div.after-banner').then(async (elements) => {
		for (const element of elements) {
			await element.evaluate((el) => (el.style.display = 'block'));
		}
	});
}

export async function skipUpsells(page: Page) {
	const noThanksQuery =
		'//*[contains(translate(text(), "ABCDEFGHIJKLMNOPQRSTUVWXYZ", "abcdefghijklmnopqrstuvwxyz"), "no thanks")]';

	try {
		await noVNo(page);

		// loop until the no thanks button is no longer found on the page
		while (await page.waitForXPath(noThanksQuery, { timeout: 1000 })) {
			const [noThanks] = (await page.$x(
				noThanksQuery,
			)) as puppeteer.ElementHandle<HTMLElement>[];

			if (noThanks != null) {
				await Promise.all([page.waitForNavigation(), noThanks.click()]);
			} else {
				break;
			}

			await noVNo(page);
		}
	} catch {
		// do nothing
	}
}

export const waitFor = (ms: number) =>
	new Promise((resolve) => setTimeout(resolve, ms));
