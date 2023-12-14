import { processEnv } from '#app/env-schema.js';
import { requestInterceptor } from '#app/interceptor.js';
import puppeteer from 'puppeteer';

(async () => {
	const browser = await puppeteer.launch({
		// headless: 'new',
		headless: 'new',
		args: [
			// '--disable-web-security',
			// '--disable-features=IsolateOrigins,site-per-process',
		],
	});
	const page = await browser.newPage();

	await page.setRequestInterception(true);

	// Setup interceptors
	page.on('request', requestInterceptor);

	await page.goto(processEnv.ECOM_HOST);

	// Set screen size
	await page.setViewport({ width: 1080, height: 1024 });

	const links = await page
		.$$(`a[href^="${processEnv.ECOM_HOST}/products/"`)
		.then(async (elements) => {
			const links = [];

			for (const element of elements) {
				const href = await element.evaluate((el) => el.getAttribute('href'));

				links.push(href);
			}

			return links;
		});

	console.log(links);

	await browser.close();
})();
