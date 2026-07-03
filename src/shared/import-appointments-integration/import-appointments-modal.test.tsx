/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { waitFor } from '@testing-library/react';
import { JSNS } from '@zextras/carbonio-shell-ui';
import { FOLDERS } from '@zextras/carbonio-ui-commons';

import { ImportAppointmentsModalComp } from './import-appointments-modal';
import { setupTest, screen } from '@test-setup';
import { generateFolder } from '@test-utils/folders/folders-generator';
import { createSoapAPIInterceptor } from '@test-utils/network/msw/create-api-interceptor';
import { populateFoldersStore } from '@test-utils/store/folders';
import { generateApiErrorResponse } from 'test/generators/api';
import {
	ImportAppointmentsRequest,
	ImportAppointmentsResponse
} from 'types/soap/importAppointments';

const successResponse: ImportAppointmentsResponse = {
	appt: [{ n: 1, ids: '0001' }],
	_jsns: JSNS.mail
};

const seedCalendars = (): void => {
	populateFoldersStore({
		view: 'appointment',
		noSharedAccounts: true,
		customFolders: [
			generateFolder({ id: '2001', name: 'Work', view: 'appointment', l: FOLDERS.USER_ROOT }),
			generateFolder({ id: '2002', name: 'Personal', view: 'appointment', l: FOLDERS.USER_ROOT })
		]
	});
};

describe('ImportAppointmentsModal', () => {
	beforeEach(() => {
		seedCalendars();
	});

	it('renders the title, filename description, calendar selector and actions', () => {
		setupTest(
			<ImportAppointmentsModalComp
				messageId="123"
				part="2"
				fileName="Coffee_party.ics"
				onClose={vi.fn()}
			/>
		);

		expect(screen.getByText('Import to Calendars')).toBeVisible();
		expect(
			screen.getByText(
				'The appointments contained in "Coffee_party.ics" will be imported into the selected calendar.'
			)
		).toBeVisible();
		expect(screen.getByText('Select the destination calendar:')).toBeVisible();
		expect(screen.getByText('Destination calendar')).toBeVisible();
		expect(screen.getByRole('button', { name: /^import$/i })).toBeVisible();
	});

	it('imports the attachment into the default calendar and notifies success', async () => {
		const importInterceptor = createSoapAPIInterceptor<
			ImportAppointmentsRequest,
			ImportAppointmentsResponse
		>('ImportAppointments', successResponse);
		createSoapAPIInterceptor('NoOp', {});
		const onClose = vi.fn();

		const { user } = setupTest(
			<ImportAppointmentsModalComp messageId="123" part="2" fileName="a.ics" onClose={onClose} />
		);

		await user.click(screen.getByRole('button', { name: /^import$/i }));

		const params = await importInterceptor;
		expect(params).toEqual({
			_jsns: JSNS.mail,
			ct: 'text/calendar',
			l: FOLDERS.CALENDAR,
			content: { mid: '123', part: '2' }
		});
		expect(onClose).toHaveBeenCalled();
		await waitFor(() => expect(screen.getByText('Import successful')).toBeVisible());
	});

	it('imports into the calendar chosen in the destination selector', async () => {
		const importInterceptor = createSoapAPIInterceptor<
			ImportAppointmentsRequest,
			ImportAppointmentsResponse
		>('ImportAppointments', successResponse);
		createSoapAPIInterceptor('NoOp', {});

		const { user } = setupTest(
			<ImportAppointmentsModalComp messageId="55" part="3" fileName="a.ics" onClose={vi.fn()} />
		);

		// open the destination-calendar select (its default value is the primary "Calendar")
		await user.click(screen.getByText('Calendar'));
		await user.click(screen.getByText('Work'));
		await user.click(screen.getByRole('button', { name: /^import$/i }));

		const params = await importInterceptor;
		expect(params).toMatchObject({ l: '2001', content: { mid: '55', part: '3' } });
	});

	it('notifies an error when the import fails', async () => {
		createSoapAPIInterceptor('ImportAppointments', generateApiErrorResponse());

		const { user } = setupTest(
			<ImportAppointmentsModalComp messageId="1" part="2" fileName="a.ics" onClose={vi.fn()} />
		);

		await user.click(screen.getByRole('button', { name: /^import$/i }));

		await waitFor(() =>
			expect(screen.getByText('Something went wrong, please try again')).toBeVisible()
		);
	});

	it('closes without importing when the close icon is clicked', async () => {
		const onClose = vi.fn();

		const { user } = setupTest(
			<ImportAppointmentsModalComp messageId="1" part="2" fileName="a.ics" onClose={onClose} />
		);

		await user.click(screen.getByTestId('icon: Close'));

		expect(onClose).toHaveBeenCalled();
	});
});
