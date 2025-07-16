/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { saveSettings } from './save-settings';
import { createSoapAPIInterceptor } from '@test-utils/network/msw/create-api-interceptor';

describe('saveSettings', () => {
	test('if mods are empty it will create an empty BatchRequest', async () => {
		const mods = {};
		const BatchRequestInterceptor = createSoapAPIInterceptor('Batch');
		await saveSettings(mods);
		const request = await BatchRequestInterceptor;
		expect(request).toContain('<BatchRequest xmlns="urn:zimbra" onerror="stop"></BatchRequest>');
	});
	test.each([
		{ zimbraPrefCalendarInitialView: 'day' },
		{ zimbraPrefCalendarDefaultApptDuration: '30m' },
		{ zimbraPrefCalendarFirstDayOfWeek: '0' },
		{ zimbraPrefCalendarApptVisibility: 'public' },
		{ zimbraPrefCalendarAutoAddInvites: 'TRUE' },
		{ zimbraPrefCalendarShowDeclinedMeetings: 'TRUE' },
		{ zimbraPrefDeleteInviteOnReply: 'TRUE' },
		{ zimbraPrefCalendarForwardInvitesTo: 'mail@mail.com' },
		{ zimbraPrefCalendarShowPastDueReminders: 'TRUE' },
		{ zimbraPrefCalendarReminderSoundsEnabled: 'TRUE' },
		{ zimbraPrefMailFlashTitle: 'TRUE' },
		{ zimbraPrefCalendarToasterEnabled: 'TRUE' }
	])('When pref is %o it will create a BatchRequest with ModifyPrefsRequest', async (pref) => {
		const mods = {
			prefs: pref
		};
		const BatchRequestInterceptor = createSoapAPIInterceptor('Batch');
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		await saveSettings(mods);
		const request = await BatchRequestInterceptor;
		expect(request).toContain(
			`<ModifyPrefsRequest xmlns="urn:zimbraAccount"><pref name="${Object.keys(pref)[0]}">${Object.values(pref)[0]}</pref></ModifyPrefsRequest>`
		);
	});
	test('if a new permission is set, the old one is revoked and a new one requested', async () => {
		const mods = {
			permissions: {
				freeBusy: {
					current: [
						{
							right: 'viewFreeBusy',
							gt: 'dom',
							zid: '012',
							d: 'mail@mail.com'
						} as const
					],
					new: {
						gt: 'all',
						zid: '123',
						deny: true
					}
				}
			}
		};
		const BatchRequestInterceptor = createSoapAPIInterceptor('Batch');
		await saveSettings(mods);
		const request = await BatchRequestInterceptor;
		expect(request).toContain(
			`<RevokeRightsRequest xmlns="urn:zimbraAccount" requestId="0"><ace right="viewFreeBusy" gt="${mods.permissions.freeBusy.current[0].gt}" zid="${mods.permissions.freeBusy.current[0].zid}" d="${mods.permissions.freeBusy.current[0].d}"/></RevokeRightsRequest>`
		);
		expect(request).toContain(
			`<GrantRightsRequest xmlns="urn:zimbraAccount" requestId="1"><ace right="viewFreeBusy" gt="${mods.permissions.freeBusy.new.gt}" deny="1"/></GrantRightsRequest>`
		);
	});
});
