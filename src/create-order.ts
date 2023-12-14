import { processEnv } from '#app/env-schema.js';
import { skipUpsells, waitFor } from '#app/helpers.js';
import { requestInterceptor } from '#app/interceptor.js';
import { randEmail, randFirstName, randLastName } from '@ngneat/falso';
import axios from 'axios';
import { execa } from 'execa';
import { readFile } from 'node:fs/promises';
import { parseArgs } from 'node:util';
import puppeteer from 'puppeteer';

type OrderTemplate = {
	offers: Array<{
		offer_id: number;
		quantity: number;
	}>;
	billing: {
		address_1: string;
		city: string;
		state: string;
		zip_code: string;
	};
};

const args = parseArgs({
	options: {
		'order-template': {
			type: 'string',
		},
	},
});

if (args.values['order-template'] == null) {
	console.error('Order template is required');

	process.exit(1);
}

const orderTemplate: OrderTemplate = JSON.parse(
	await readFile(args.values['order-template'], 'utf-8'),
);

(async () => {
	const browser = await puppeteer.launch({
		// headless: 'new',
		headless: false,
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

	await page.click(`a[href="${processEnv.ECOM_HOST}/products/burn-pm"]`);

	const cookies = await page.cookies();
	const cookieHeader = cookies
		.map((cookie) => `${cookie.name}=${cookie.value}`)
		.join('; ');

	for (const offer of orderTemplate.offers) {
		await axios.post(
			`${processEnv.ECOM_HOST}/api/cart/offer`,
			{ offer_id: offer.offer_id, quantity: offer.quantity },
			{
				headers: {
					Cookie: cookieHeader,
				},
			},
		);
	}

	// The BUY NOW button takes some time to load
	// await page
	//   .locator('::-p-xpath(//button[contains(text(), "BUY NOW")])')
	//   .click();

	// Add Burn PM - Six Bottles to cart
	// await page.click('a[data-v-f70e427a]');

	await page.goto(`${processEnv.ECOM_HOST}/cart`);
	await page.locator('a[href="/checkout"]').click();

	await page.locator('input[type="email"]').fill(
		randEmail({
			provider: 'example',
			suffix: 'com',
		}),
	);

	await page.locator('input[id="first-name"]').fill(randFirstName());
	await page.locator('input[id="last-name"]').fill(randLastName());
	await page
		.locator('input[id="address-1"]')
		.fill(orderTemplate.billing.address_1);
	await page.locator('input[id="city"]').fill(orderTemplate.billing.city);
	await page.locator('select[id="state"]').fill(orderTemplate.billing.state);
	await page
		.locator('input[id="zip-code"]')
		.fill(orderTemplate.billing.zip_code);

	// Trigger the zip code lookup
	await page.keyboard.press('Tab');

	// Intercept to speed up?
	// How would I handle the `guest_id` field in the JSON response?
	await waitFor(2000);

	await page.locator('input[type="tel"]').fill('702-733-1957');
	await page.locator('input[type="password"]').fill('asdfasdf');

	// wait for input[id="credit-card-number"] within iframe
	await page.waitForSelector('iframe[name="braintree-hosted-field-number"]');
	const creditCardNumberFrameHandle = await page.$(
		'iframe[name="braintree-hosted-field-number"]',
	);
	const creditCardNumberFrame =
		await creditCardNumberFrameHandle?.contentFrame();

	await creditCardNumberFrame?.waitForSelector(
		'input[id="credit-card-number"]',
	);
	await creditCardNumberFrame
		?.locator('input[id="credit-card-number"]')
		.fill('4111111111111111');

	// ------------------------------

	await page.waitForSelector(
		'iframe[name="braintree-hosted-field-expirationMonth"]',
	);
	const creditCardExpirationMonthFrameHandle = await page.$(
		'iframe[name="braintree-hosted-field-expirationMonth"]',
	);
	const creditCardExpirationMonth =
		await creditCardExpirationMonthFrameHandle?.contentFrame();

	await creditCardExpirationMonth?.waitForSelector(
		'input[id="expiration-month"]',
	);
	await creditCardExpirationMonth
		?.locator('input[id="expiration-month"]')
		.fill('12');

	// ------------------------------

	await page.waitForSelector(
		'iframe[name="braintree-hosted-field-expirationYear"]',
	);
	const creditCardExpirationYearFrameHandle = await page.$(
		'iframe[name="braintree-hosted-field-expirationYear"]',
	);
	const creditCardExpirationYear =
		await creditCardExpirationYearFrameHandle?.contentFrame();

	await creditCardExpirationYear?.waitForSelector(
		'input[id="expiration-year"]',
	);
	await creditCardExpirationYear
		?.locator('input[id="expiration-year"]')
		.fill('2032');

	// ------------------------------

	await page.waitForSelector('iframe[name="braintree-hosted-field-cvv"');
	const creditCardFrameHandle = await page.$(
		'iframe[name="braintree-hosted-field-cvv"',
	);
	const creditCardCVVFrame = await creditCardFrameHandle?.contentFrame();

	await creditCardCVVFrame?.waitForSelector('input[id="cvv"]');
	await creditCardCVVFrame?.locator('input[id="cvv"]').fill('123');

	// ------------------------------

	await Promise.all([
		page.waitForNavigation(),
		page.locator('button[type="submit"]').click(),
	]);

	await skipUpsells(page);

	const orderIds = await page
		.$$('a[href^="/my-account/view-order"')
		.then(async (elements) => {
			const orderIds: string[] = [];

			for (const element of elements) {
				const href = await element.evaluate((el) => el.getAttribute('href'));
				const orderId = href?.split('/').pop();

				if (orderId != null) {
					orderIds.push(orderId);
				}
			}

			return Array.from(new Set(orderIds));
		});

	for (const orderId of orderIds) {
		const transactionRef = await execa(
			`${processEnv.ECOM_PATH}/vendor/bin/sail`,
			[
				'art',
				'tink',
				`--execute=use App\\Models\\Order; echo Order::find(${orderId})->payments()->first()->transaction_ref;`,
			],
			{
				cwd: processEnv.ECOM_PATH,
			},
		).then((res) => res.stdout);

		if (transactionRef === '') {
			console.log('Transaction ref not found for order', orderId);
			continue;
		}

		const settleResult = await execa(
			`${processEnv.ECOM_PATH}/vendor/bin/sail`,
			['art', 'test:transaction:settle', transactionRef],
			{
				cwd: processEnv.ECOM_PATH,
			},
		).then((res) => res.stdout);

		console.log(settleResult);
		console.log(
			`Order can be viewed at ${processEnv.ECOM_HOST}/nova/resources/orders/${orderId}`,
		);
	}

	await browser.close();
})();
