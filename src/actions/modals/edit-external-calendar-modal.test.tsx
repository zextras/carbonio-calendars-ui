/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import * as commons from '@zextras/carbonio-ui-commons';
import { useFolder, useFoldersMap } from '@zextras/carbonio-ui-commons';

import { EditExternalCalendarModal } from './edit-external-calendar-modal';
import { screen, setupTest } from '@test-setup';

vi.mock('@zextras/carbonio-ui-commons', async () => {
	const actual = await vi.importActual('@zextras/carbonio-ui-commons');
	return {
		...actual,
		useFolder: vi.fn(),
		useFoldersMap: vi.fn()
	};
});

describe('EditExternalCalendarModal', () => {
	beforeEach(() => {
		vi.mocked(useFolder).mockReturnValue({
			id: '123',
			name: 'External calendar',
			view: 'appointment',
			color: 2,
			f: '#y',
			url: 'https://example.com/ext.ics'
		} as never);
		vi.mocked(useFoldersMap).mockReturnValue({
			'123': {
				id: '123',
				name: 'External calendar',
				view: 'appointment'
			},
			'124': {
				id: '124',
				name: 'Team calendar',
				view: 'appointment'
			}
		} as never);
	});

	test('renders edit external modal form', () => {
		setupTest(<EditExternalCalendarModal folderId={'123'} onClose={vi.fn()} />);

		expect(screen.getByText('Edit calendar')).toBeVisible();
		expect(screen.getByText(/URL: https:\/\/example.com\/ext.ics/i)).toBeVisible();
		expect(screen.getByRole('textbox', { name: 'Calendar name*' })).toBeVisible();
		expect(screen.getByText('Select color')).toBeVisible();
	});

	test('copies external URL when copy button is clicked', async () => {
		const copySpy = vi.spyOn(commons, 'copyToClipboard').mockResolvedValue(undefined);
		const { user } = setupTest(<EditExternalCalendarModal folderId={'123'} onClose={vi.fn()} />);

		await user.click(screen.getByTestId('icon: Copy'));

		expect(copySpy).toHaveBeenCalledWith('https://example.com/ext.ics');
	});
});
