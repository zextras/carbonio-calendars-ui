/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { waitFor } from '@testing-library/react';
import { useFolder } from '@zextras/carbonio-ui-commons';
import { Mock } from 'vitest';

import { generateFolder } from '@test-utils/folders/folders-generator';
import { setupTest, screen } from '@test-setup';
import { populateFoldersStore } from '@test-utils/store/folders';
import * as calendarActions from '../../store/actions/calendar-actions';
import { EditCaldavCalendarModal } from './edit-caldav-calendar-modal';

vi.mock('@zextras/carbonio-ui-commons', async () => ({
	...(await vi.importActual('@zextras/carbonio-ui-commons')),
	useFolder: vi.fn()
}));

const FOLDER_NAME = 'My CalDAV';
const FOLDER_ID = 'caldav-child-1';

const mockFolder = generateFolder({ id: FOLDER_ID, name: FOLDER_NAME, view: 'appointment' });

describe('EditCaldavCalendarModal', () => {
	beforeEach(() => {
		(useFolder as Mock).mockReturnValue(mockFolder);
		populateFoldersStore({ customFolders: [mockFolder] });
	});

	it('renders the modal with title and name input pre-filled', () => {
		setupTest(<EditCaldavCalendarModal folderId={FOLDER_ID} onClose={vi.fn()} />);
		expect(screen.getByText('Edit name')).toBeVisible();
		expect(screen.getByDisplayValue(FOLDER_NAME)).toBeVisible();
	});

	it('Save Changes button is enabled when name is pre-filled', () => {
		setupTest(<EditCaldavCalendarModal folderId={FOLDER_ID} onClose={vi.fn()} />);
		expect(screen.getByRole('button', { name: 'Save Changes' })).toBeEnabled();
	});

	it('Save Changes button is disabled when name is cleared', async () => {
		const { user } = setupTest(<EditCaldavCalendarModal folderId={FOLDER_ID} onClose={vi.fn()} />);
		await user.clear(screen.getByDisplayValue(FOLDER_NAME));
		expect(screen.getByRole('button', { name: 'Save Changes' })).toBeDisabled();
	});

	it('shows duplicate name error when name matches an existing calendar', async () => {
		const other = generateFolder({ name: 'Other Calendar', view: 'appointment' });
		populateFoldersStore({ customFolders: [mockFolder, other] });
		const { user } = setupTest(<EditCaldavCalendarModal folderId={FOLDER_ID} onClose={vi.fn()} />);
		await user.clear(screen.getByDisplayValue(FOLDER_NAME));
		await user.type(screen.getByRole('textbox'), 'Other Calendar');
		expect(screen.getByText('A calendar with the same name already exists')).toBeVisible();
		expect(screen.getByRole('button', { name: 'Save Changes' })).toBeDisabled();
	});

	it('does not show duplicate warning when keeping the current name', () => {
		const sameNameFolder = generateFolder({
			id: 'same-name-folder',
			name: FOLDER_NAME,
			view: 'appointment'
		});
		populateFoldersStore({ customFolders: [mockFolder, sameNameFolder] });

		setupTest(<EditCaldavCalendarModal folderId={FOLDER_ID} onClose={vi.fn()} />);

		expect(
			screen.queryByText('A calendar with the same name already exists')
		).not.toBeInTheDocument();
		expect(screen.getByRole('button', { name: 'Save Changes' })).toBeEnabled();
	});

	it('shows success snackbar and closes without folderAction when name is unchanged', async () => {
		const folderActionSpy = vi.spyOn(calendarActions, 'folderAction');
		const onClose = vi.fn();
		const { user } = setupTest(<EditCaldavCalendarModal folderId={FOLDER_ID} onClose={onClose} />);
		await user.click(screen.getByRole('button', { name: 'Save Changes' }));
		expect(folderActionSpy).not.toHaveBeenCalled();
		await waitFor(() => expect(screen.getByText('Changes saved')).toBeVisible());
		expect(onClose).toHaveBeenCalledTimes(1);
	});

	it('calls folderAction with RENAME and shows success snackbar on save', async () => {
		vi.spyOn(calendarActions, 'folderAction').mockResolvedValue({} as never);
		const onClose = vi.fn();
		const { user } = setupTest(<EditCaldavCalendarModal folderId={FOLDER_ID} onClose={onClose} />);
		await user.clear(screen.getByDisplayValue(FOLDER_NAME));
		await user.type(screen.getByRole('textbox'), 'New Name');
		await user.click(screen.getByRole('button', { name: 'Save Changes' }));
		await waitFor(() =>
			expect(calendarActions.folderAction).toHaveBeenCalledWith(
				expect.objectContaining({ op: 'rename', name: 'New Name', id: FOLDER_ID })
			)
		);
		await waitFor(() => expect(screen.getByText('Changes saved')).toBeVisible());
		await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
	});

	it('shows error snackbar when folderAction returns a Fault', async () => {
		vi.spyOn(calendarActions, 'folderAction').mockResolvedValue({ Fault: 'err' } as never);
		const onClose = vi.fn();
		const { user } = setupTest(<EditCaldavCalendarModal folderId={FOLDER_ID} onClose={onClose} />);
		await user.clear(screen.getByDisplayValue(FOLDER_NAME));
		await user.type(screen.getByRole('textbox'), 'New Name');
		await user.click(screen.getByRole('button', { name: 'Save Changes' }));
		await waitFor(() =>
			expect(screen.getByText('Something went wrong, please try again')).toBeVisible()
		);
		expect(onClose).not.toHaveBeenCalled();
		expect(screen.getByRole('button', { name: 'Save Changes' })).toBeEnabled();
	});

	it('shows error snackbar when folderAction rejects', async () => {
		vi.spyOn(calendarActions, 'folderAction').mockRejectedValue(new Error('net error'));
		const onClose = vi.fn();
		const { user } = setupTest(<EditCaldavCalendarModal folderId={FOLDER_ID} onClose={onClose} />);
		await user.clear(screen.getByDisplayValue(FOLDER_NAME));
		await user.type(screen.getByRole('textbox'), 'New Name');
		await user.click(screen.getByRole('button', { name: 'Save Changes' }));
		await waitFor(() =>
			expect(screen.getByText('Something went wrong, please try again')).toBeVisible()
		);
		expect(screen.getByRole('button', { name: 'Save Changes' })).toBeEnabled();
	});

	it('calls onClose when close icon is clicked', async () => {
		const onClose = vi.fn();
		const { user } = setupTest(<EditCaldavCalendarModal folderId={FOLDER_ID} onClose={onClose} />);
		await user.click(screen.getByTestId('icon: CloseOutline'));
		expect(onClose).toHaveBeenCalledTimes(1);
	});
});
