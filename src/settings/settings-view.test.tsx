/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import * as shell from '@zextras/carbonio-shell-ui';
import { usePrefs } from '@zextras/carbonio-ui-commons';
import { Mock } from 'vitest';

import { saveSettings } from './save-settings';
import CalendarSettingsView from './settings-view';
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

				await user.type(
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
});
