/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
	getAppointmentSendErrorLabel,
	getDeniedDistributionLists
} from './send-to-distribution-list-denied';
import { getAppI18n } from '__test__/i18n/i18n-test-factory';
import {
	generateSendToDistributionListDeniedResponseBody,
	generateSoapErrorResponseBody
} from 'test/generators/utils';

const DL_1 = 'devs@test.com';
const DL_2 = 'sales@test.com';
const GENERIC_ERROR = 'Something went wrong, please try again';

const deniedFault = (invalid: Array<string>, unsent?: Array<string>): unknown =>
	generateSendToDistributionListDeniedResponseBody({ invalid, unsent }).Fault;

describe('getDeniedDistributionLists', () => {
	it('returns the invalid addresses of a denied distribution list fault', () => {
		expect(getDeniedDistributionLists(deniedFault([DL_1, DL_2], ['user@test.com']))).toEqual([
			DL_1,
			DL_2
		]);
	});

	it('strips the display name from the denied addresses', () => {
		expect(getDeniedDistributionLists(deniedFault([`"Devs, Team" <${DL_1}>`]))).toEqual([DL_1]);
	});

	it('keeps the address when the display name contains angle brackets', () => {
		expect(getDeniedDistributionLists(deniedFault([`"Devs <team>" <${DL_1}> `]))).toEqual([DL_1]);
	});

	it('accepts a single argument not wrapped in an array', () => {
		const fault = {
			Detail: {
				Error: {
					Code: 'mail.SEND_TO_DISTRIBUTION_LIST_DENIED',
					a: { n: 'invalid', t: 'STR', _content: DL_1 }
				}
			}
		};

		expect(getDeniedDistributionLists(fault)).toEqual([DL_1]);
	});

	it('returns undefined for other faults', () => {
		const fault = generateSoapErrorResponseBody({
			detailCode: 'mail.SEND_ABORTED_ADDRESS_FAILURE'
		}).Fault;

		expect(getDeniedDistributionLists(fault)).toBeUndefined();
	});

	it('returns undefined when there is no fault', () => {
		expect(getDeniedDistributionLists(undefined)).toBeUndefined();
	});
});

describe('getAppointmentSendErrorLabel', () => {
	const { t } = getAppI18n();

	it('names the denied distribution list when there is only one', () => {
		expect(getAppointmentSendErrorLabel(t, deniedFault([DL_1]))).toBe(
			`You can't invite ${DL_1}. Remove it and try again.`
		);
	});

	it('counts the denied distribution lists when there are more than one', () => {
		expect(getAppointmentSendErrorLabel(t, deniedFault([DL_1, DL_2]))).toBe(
			"You can't invite 2 distribution lists. Remove them and try again."
		);
	});

	it('counts the denied distribution lists when the locale has no plural rules', async () => {
		const i18n = getAppI18n();
		// Carbonio uses locales like "en_US", which Intl.PluralRules rejects
		await i18n.changeLanguage('en_US');

		expect(getAppointmentSendErrorLabel(i18n.t, deniedFault([DL_1, DL_2]))).toBe(
			"You can't invite 2 distribution lists. Remove them and try again."
		);
	});

	it('returns the generic error for other faults', () => {
		expect(getAppointmentSendErrorLabel(t, generateSoapErrorResponseBody().Fault)).toBe(
			GENERIC_ERROR
		);
	});

	it('returns the generic error when a denied fault has no invalid arguments', () => {
		expect(getAppointmentSendErrorLabel(t, deniedFault([]))).toBe(GENERIC_ERROR);
	});

	it('returns the generic error when there is no fault', () => {
		expect(getAppointmentSendErrorLabel(t, undefined)).toBe(GENERIC_ERROR);
	});
});
