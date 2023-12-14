import { countries } from '#app/countries.js';
import { HTTPRequest } from 'puppeteer';

export const requestInterceptor = (interceptedRequest: HTTPRequest) => {
	if (interceptedRequest.isInterceptResolutionHandled()) {
		return;
	}

	if (
		interceptedRequest.url().startsWith('http://localhost:8080/api/bundles')
	) {
		interceptedRequest.respond({
			body: JSON.stringify({
				data: [],
				links: {
					first: 'http://localhost:8080/api/bundles?page=1',
					last: 'http://localhost:8080/api/bundles?page=1',
					prev: null,
					next: null,
				},
				meta: {
					current_page: 1,
					from: 1,
					last_page: 1,
					links: [
						{
							url: null,
							label: '&laquo; Previous',
							active: false,
						},
						{
							url: 'http://localhost:8080/api/bundles?page=1',
							label: '1',
							active: true,
						},
						{
							url: null,
							label: 'Next &raquo;',
							active: false,
						},
					],
					path: 'http://localhost:8080/api/bundles',
					per_page: 250,
					to: 198,
					total: 198,
				},
			}),
		});
	} else if (
		interceptedRequest.url().startsWith('http://localhost:8080/api/coupons')
	) {
		interceptedRequest.respond({
			body: JSON.stringify({
				data: [],
				links: {
					first: 'http://localhost:8080/api/coupons?page=1',
					last: 'http://localhost:8080/api/coupons?page=1',
					prev: null,
					next: null,
				},
				meta: {
					current_page: 1,
					from: 1,
					last_page: 1,
					links: [
						{
							url: null,
							label: '&laquo; Previous',
							active: false,
						},
						{
							url: 'http://localhost:8080/api/coupons?page=1',
							label: '1',
							active: true,
						},
						{
							url: null,
							label: 'Next &raquo;',
							active: false,
						},
					],
					path: 'http://localhost:8080/api/coupons',
					per_page: 500,
					to: 170,
					total: 170,
				},
			}),
		});
	} else if (
		interceptedRequest.url().startsWith('http://localhost:8080/api/offers')
	) {
		interceptedRequest.respond({
			body: JSON.stringify({
				data: [],
				links: {
					first: 'http://localhost:8080/api/offers?page=1',
					last: 'http://localhost:8080/api/offers?page=3',
					prev: null,
					next: 'http://localhost:8080/api/offers?page=2',
				},
				meta: {
					current_page: 1,
					from: 1,
					last_page: 3,
					links: [
						{
							url: null,
							label: '&laquo; Previous',
							active: false,
						},
						{
							url: 'http://localhost:8080/api/offers?page=1',
							label: '1',
							active: true,
						},
						{
							url: 'http://localhost:8080/api/offers?page=2',
							label: '2',
							active: false,
						},
						{
							url: 'http://localhost:8080/api/offers?page=3',
							label: '3',
							active: false,
						},
						{
							url: 'http://localhost:8080/api/offers?page=2',
							label: 'Next &raquo;',
							active: false,
						},
					],
					path: 'http://localhost:8080/api/offers',
					per_page: 250,
					to: 250,
					total: 590,
				},
			}),
		});
	} else if (
		interceptedRequest.url().startsWith('http://localhost:8080/api/plans')
	) {
		interceptedRequest.respond({
			body: JSON.stringify({
				data: [],
				links: {
					first: 'http://localhost:8080/api/plans?page=1',
					last: 'http://localhost:8080/api/plans?page=1',
					prev: null,
					next: null,
				},
				meta: {
					current_page: 1,
					from: 1,
					last_page: 1,
					links: [
						{
							url: null,
							label: '&laquo; Previous',
							active: false,
						},
						{
							url: 'http://localhost:8080/api/plans?page=1',
							label: '1',
							active: true,
						},
						{
							url: null,
							label: 'Next &raquo;',
							active: false,
						},
					],
					path: 'http://localhost:8080/api/plans',
					per_page: 500,
					to: 100,
					total: 100,
				},
			}),
		});
	} else if (
		interceptedRequest.url().startsWith('http://localhost:8080/api/countries')
	) {
		interceptedRequest.respond({
			body: JSON.stringify(countries),
		});
	} else if (
		interceptedRequest
			.url()
			.startsWith('http://localhost:8080/api/orders/reasons-refund')
	) {
		interceptedRequest.respond({
			body: JSON.stringify([
				{
					key: 'cdp_changed_mind_plan_not_sent',
					value: 'CDP - Changed Mind (Plan Not Sent)',
				},
				{
					key: 'cdp_trainer_issue_plan_sent',
					value: 'CDP - Trainer Issue (Plan Sent)',
				},
				{
					key: 'cdp_unsatisfied_plan_sent',
					value: 'CDP - Unsatisfied (Plan Sent)',
				},
				{
					key: 'changed_mind',
					value: 'Changed Mind',
				},
				{
					key: 'claims_scam_fraud_never_ordered',
					value: "Claims It's a Scam/Fraud/Never Ordered",
				},
				{
					key: 'claims_overcharged',
					value: 'Claims They Were Overcharged',
				},
				{
					key: 'damaged_defective',
					value: 'Damaged/Defective',
				},
				{
					key: 'duplicate',
					value: 'Duplicate Order',
				},
				{
					key: 'hard_decline',
					value: 'Hard Decline',
				},
				{
					key: 'high_ticket_sales_return',
					value: 'HTS - Return',
				},
				{
					key: 'hts_upgrade_digital',
					value: 'HTS Upgrade - Digital',
				},
				{
					key: 'hts_upgrade_physical',
					value: 'HTS Upgrade - Physical',
				},
				{
					key: 'login_password_issue',
					value: 'Login/Password Issue',
				},
				{
					key: 'lost_package',
					value: 'Lost Package',
				},
				{
					key: 'missing_item',
					value: 'Missing Item',
				},
				{
					key: 'ordered_by_mistake',
					value: 'Ordered By Mistake',
				},
				{
					key: 'mbg_money_back_guarantee',
					value: 'Qualified for Money-Back Guarantee',
				},
				{
					key: 'side_effects',
					value: 'Side Effects',
				},
				{
					key: 'soft_decline',
					value: 'Soft Decline',
				},
				{
					key: 'technical_error',
					value: 'Technical Error',
				},
				{
					key: 'threatening_bbb_review_legal',
					value: 'Threatening BBB Review/Legal Action',
				},
				{
					key: 'too_late_to_ship',
					value: 'Too Late To Ship',
				},
				{
					key: 'wrong_item',
					value: 'Wrong Item',
				},
			]),
		});
	} else {
		interceptedRequest.continue();
	}
};
