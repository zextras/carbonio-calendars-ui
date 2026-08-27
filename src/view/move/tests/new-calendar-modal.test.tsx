/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { faker } from '@faker-js/faker';
import { FOLDER_VIEW } from '@zextras/carbonio-ui-commons';

import { NewModal } from '../new-calendar-modal';
import { screen, setupTest } from '@test-setup';
import { generateFolder } from '@test-utils/folders/folders-generator';
import { populateFoldersStore } from '@test-utils/store/folders';

const defaultCalendarFolder = generateFolder({
	id: faker.number.int({ min: 100 }).toString(),
	name: 'DefaultCalendar',
	color: faker.number.int({ min: 0, max: 9 })
});

describe('NewModal', () => {
	beforeEach(() => {
		populateFoldersStore({
			view: FOLDER_VIEW.appointment,
			noSharedAccounts: true,
			customFolders: [defaultCalendarFolder]
		});
	});

	it('renders the new calendar creation form', () => {
		setupTest(<NewModal onClose={vi.fn()} folderId={defaultCalendarFolder.id} />);

		expect(screen.getByText('New calendar creation')).toBeVisible();
		expect(screen.getByRole('textbox', { name: 'Choose a representative name*' })).toBeVisible();
	});

	it('close button is a no-op while the color picker custom-color popover is open', async () => {
		const onClose = vi.fn();
		const { user } = setupTest(<NewModal onClose={onClose} folderId={defaultCalendarFolder.id} />);

		await user.click(screen.getByTestId('icon: PlusCircleOutline'));
		expect(screen.getByRole('button', { name: 'Close' })).toBeVisible();

		await user.click(screen.getByTestId('icon: CloseOutline'));
		expect(onClose).not.toHaveBeenCalled();
	});

	it('close button calls onClose when the color picker popover is closed', async () => {
		const onClose = vi.fn();
		const { user } = setupTest(<NewModal onClose={onClose} folderId={defaultCalendarFolder.id} />);

		await user.click(screen.getByTestId('icon: CloseOutline'));
		expect(onClose).toHaveBeenCalledTimes(1);
	});
});
