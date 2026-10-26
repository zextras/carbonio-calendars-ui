/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { waitFor } from '@testing-library/react';
import * as shell from '@zextras/carbonio-shell-ui';
import { usePrefs } from '@zextras/carbonio-ui-commons';
import { http, HttpResponse } from 'msw';
import { Mock } from 'vitest';

import { saveSettings } from './save-settings';
import CalendarSettingsView from './settings-view';
import { getSetupServer } from '@jest-setup';
import { screen, setupTest } from '@test-setup';
import { createSoapAPIInterceptor } from '@test-utils/network/msw/create-api-interceptor';

const SettingsHeader = vi.fn(({ title, onSave, onCancel, isDirty }) => (
	<div data-testid="settings-header">
		<h1>{title}</h1>
		<button onClick={onSave} disabled={!isDirty}>
			Save
		</button>
		<button onClick={onCancel}>Cancel</button>
	</div>
));

vi.mock('@zextras/carbonio-ui-commons', async () => ({
	...(await vi.importActual('@zextras/carbonio-ui-commons')),
	usePrefs: vi.fn()
}));

const defaultSettings = {
	zimbraPrefCalendarForwardInvitesTo: '',
	zimbraPrefCalendarDefaultApptDuration: '60m',
	zimbraPrefCalendarWorkingHours:
		'1:N:0800:1700,2:Y:0800:1700,3:Y:0800:1700,4:Y:0800:1700,5:Y:0800:1700,6:Y:0800:1700,7:N:0800:1700'
};

beforeAll(() => {
	(shell.SettingsHeader as Mock) = vi.fn(SettingsHeader);
	(usePrefs as Mock).mockReturnValue(defaultSettings);
});

vi.mock('./save-settings', () => ({
	saveSettings: vi.fn()
}));

describe('Settings view', () => {
	describe('General', () => {
		it('should render the general settings view', () => {
			createSoapAPIInterceptor('GetRights', {});
			setupTest(<CalendarSettingsView />);

			expect(screen.getByText(/label.general/i)).toBeVisible();
			expect(screen.getByText(/label.default_view/i)).toBeVisible();
			expect(screen.getByText(/label.start_week_on/i)).toBeVisible();
			expect(screen.getByText(/label.time_format/i)).toBeVisible();
			expect(screen.getByText(/settings.hint.time_format/i)).toBeVisible();
			expect(screen.getByText(/label.default_appt_vsblty/i)).toBeVisible();
			expect(screen.getByText(/label.auto_add_rcvd_app/i)).toBeVisible();
			expect(screen.getByText(/label.show_declined_meetings/i)).toBeVisible();
		});

		it('should render Invitation Response settings', () => {
			createSoapAPIInterceptor('GetRights', {});
			setupTest(<CalendarSettingsView />);

			expect(screen.getByText(/settings.label.invitation_response/i)).toBeVisible();
			expect(screen.getByText(/settings.label.delete_invt_on_rply/i)).toBeVisible();
		});

		describe('Forward Invites Settings', () => {
			it('should render Forward Invites settings', () => {
				createSoapAPIInterceptor('GetRights', {});
				setupTest(<CalendarSettingsView />);

				expect(screen.getByText(/settings.label.forward_invites/i)).toBeVisible();
				expect(screen.getByRole('textbox', { name: /settings.label.enter_email/i })).toBeVisible();
			});

			it('should render a successful snackbar if the save button is clicked', async () => {
				(saveSettings as Mock).mockResolvedValue({});
				createSoapAPIInterceptor('GetRights', {});
				const { user } = setupTest(<CalendarSettingsView />);

				await user.pasteInto(
					screen.getByRole('textbox', { name: /settings.label.enter_email/i }),
					'test@demo.com'
				);
				await user.click(screen.getByRole('button', { name: /save/i }));
				expect(await screen.findByText(/label.settings_saved/i)).toBeVisible();
			});

			it('should render an error if it is not a valid email', async () => {
				createSoapAPIInterceptor('GetRights', {});
				const { user } = setupTest(<CalendarSettingsView />);

				await user.type(
					screen.getByRole('textbox', { name: /settings.label.enter_email/i }),
					'asd'
				);
				await user.click(screen.getByRole('button', { name: /save/i }));
				expect(screen.getByText(/settings.invalid_email/i)).toBeVisible();
			});

			it('should be able to remove a email set and save', async () => {
				(usePrefs as Mock).mockReturnValue({
					...defaultSettings,
					zimbraPrefCalendarForwardInvitesTo: 'test@demo.com'
				});

				(saveSettings as Mock).mockResolvedValue({});
				createSoapAPIInterceptor('GetRights', { ace: [] });

				const { user } = setupTest(<CalendarSettingsView />);
				const input = screen.getByRole('textbox', { name: /settings.label.enter_email/i });
				expect(input).toHaveValue('test@demo.com');
				await user.clear(input);
				expect(input).toHaveValue('');
				await user.click(screen.getByRole('button', { name: /save/i }));
				expect(await screen.findByText(/label.settings_saved/i)).toBeVisible();
				expect(screen.queryByText(/settings.invalid_email/i)).not.toBeInTheDocument();
			});
		});
	});

	describe('Work week', () => {
		it('should show the device timezone', () => {
			vi.setSystemTime(new Date('2026-07-01T10:00:00Z'));
			createSoapAPIInterceptor('GetRights', {});
			setupTest(<CalendarSettingsView />);

			expect(screen.getByText('label.timezone_device_msg')).toBeVisible();
			expect(screen.getByText('label.your_device_timezone_msg')).toBeVisible();
			expect(shell.t).toHaveBeenCalledWith(
				'label.your_device_timezone_msg',
				expect.objectContaining({ timezone: 'GMT +02:00 Europe/Berlin' })
			);
		});
	});

	describe('Permissions', () => {
		type FakeContact = {
			id: string;
			email: string;
			type: 'CONTACT';
			label: string;
			value: unknown;
		};
		const FakeContactInput = ({
			defaultValue,
			onChange
		}: {
			defaultValue: FakeContact[];
			onChange: (contacts: FakeContact[]) => void;
		}): React.JSX.Element => (
			<button
				onClick={(): void =>
					onChange([
						...defaultValue,
						{
							id: 'new@demo.com',
							email: 'new@demo.com',
							type: 'CONTACT',
							label: 'new@demo.com',
							value: {
								id: 'new@demo.com',
								label: 'new@demo.com',
								type: 'CONTACT',
								email: 'new@demo.com'
							}
						}
					])
				}
			>
				add contact
			</button>
		);
		const buildAce = (right: 'viewFreeBusy' | 'invite', d: string): Record<string, unknown> => ({
			right,
			gt: 'usr',
			d,
			zid: `zid-${d}`
		});

		/**
		 * GetRights answers with `first` on the first call and with `afterSave` on every following one,
		 * to simulate the server state before and after the permissions have been saved.
		 */
		const mockGetRights = (
			first: Array<Record<string, unknown>>,
			afterSave: Array<Record<string, unknown>>
		): { getCalledTimes: () => number } => {
			let calledTimes = 0;
			getSetupServer().use(
				http.post('/service/soap/GetRightsRequest', () => {
					calledTimes += 1;
					return HttpResponse.json({
						Body: { GetRightsResponse: { ace: calledTimes === 1 ? first : afterSave } }
					});
				})
			);
			return { getCalledTimes: () => calledTimes };
		};

		beforeEach(() => {
			(shell.useIntegratedComponent as Mock).mockImplementation(() => [FakeContactInput, true]);
			(saveSettings as Mock).mockResolvedValue({});
		});

		it('should disable save after the free/busy contact list has been saved', async () => {
			const oldContact = buildAce('viewFreeBusy', 'old@demo.com');
			const newContact = buildAce('viewFreeBusy', 'new@demo.com');
			const rights = mockGetRights([oldContact], [oldContact, newContact]);
			const { user } = setupTest(<CalendarSettingsView />);

			await user.click(await screen.findByRole('button', { name: /add contact/i }));
			const saveButton = screen.getByRole('button', { name: /save/i });
			expect(saveButton).toBeEnabled();

			await user.click(saveButton);
			expect(await screen.findByText(/label.settings_saved/i)).toBeVisible();

			await waitFor(() => expect(rights.getCalledTimes()).toBe(2));
			await waitFor(() => expect(screen.getByRole('button', { name: /save/i })).toBeDisabled());
		});

		it('should save the invite contact list when it changes and "allow following users" is already selected', async () => {
			const oldContact = buildAce('invite', 'old@demo.com');
			const newContact = buildAce('invite', 'new@demo.com');
			mockGetRights([oldContact], [oldContact, newContact]);
			const { user } = setupTest(<CalendarSettingsView />);

			await user.click(await screen.findByRole('button', { name: /add contact/i }));
			await user.click(screen.getByRole('button', { name: /save/i }));

			expect(saveSettings).toHaveBeenCalledWith({
				permissions: {
					inviteRight: {
						current: [expect.objectContaining({ d: 'old@demo.com' })],
						new: {
							gt: 'usr',
							deny: false,
							d: [{ email: 'old@demo.com' }, { email: 'new@demo.com' }]
						}
					}
				}
			});
			await waitFor(() => expect(screen.getByRole('button', { name: /save/i })).toBeDisabled());
		});

		it('should restore the saved contact list and disable save when changes are discarded', async () => {
			mockGetRights([buildAce('viewFreeBusy', 'old@demo.com')], []);
			const { user } = setupTest(<CalendarSettingsView />);

			await user.click(await screen.findByRole('button', { name: /add contact/i }));
			expect(screen.getByRole('button', { name: /save/i })).toBeEnabled();

			await user.click(screen.getByRole('button', { name: /cancel/i }));

			await waitFor(() => expect(screen.getByRole('button', { name: /save/i })).toBeDisabled());
		});
	});
});
