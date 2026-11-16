/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { waitFor } from '@testing-library/react';
import * as commons from '@zextras/carbonio-ui-commons';

import { EditExternalCalendarModal } from './edit-external-calendar-modal';
import * as calendarActions from '../../store/actions/calendar-actions';
import { screen, setupTest } from '@test-setup';
import { generateFolder } from '@test-utils/folders/folders-generator';
import { populateFoldersStore } from '@test-utils/store/folders';
import { FOLDER_OPERATIONS } from 'constants/api';

const CALENDAR_NAME_LABEL = 'Choose a representative name*';
const SAVE_CHANGES_LABEL = 'Save Changes';
const DEFAULT_FOLDER_ID = '123';
const DEFAULT_FOLDER_URL = 'https://example.com/ext.ics';
const EXCLUDE_FREE_BUSY_LABEL = 'Exclude this calendar when reporting the free/busy times';

type FolderSetupOptions = {
	folderId?: string;
	folderName?: string;
	folderUrl?: string | undefined;
	color?: number | undefined;
	rgb?: string | undefined;
	flags?: string;
	extraFolders?: Array<{ id: string; name: string }>;
};

const setupFolders = (options: FolderSetupOptions = {}): void => {
	const {
		folderId = DEFAULT_FOLDER_ID,
		folderName = 'External calendar',
		folderUrl = DEFAULT_FOLDER_URL,
		rgb,
		flags = '#y',
		extraFolders = [{ id: '124', name: 'Team calendar' }]
	} = options;
	const externalFolder = generateFolder({
		id: folderId,
		name: folderName,
		view: 'appointment',
		f: flags
	});

	externalFolder.url = folderUrl;
	if (Object.prototype.hasOwnProperty.call(options, 'color')) {
		externalFolder.color = options.color;
	} else {
		externalFolder.color = 2;
	}
	externalFolder.rgb = rgb;

	const customFolders = [
		externalFolder,
		...extraFolders.map((folder) =>
			generateFolder({
				id: folder.id,
				name: folder.name,
				view: 'appointment'
			})
		)
	];

	populateFoldersStore({ view: 'appointment', customFolders });
};

describe('EditExternalCalendarModal', () => {
	beforeEach(() => {
		vi.restoreAllMocks();
	});

	test('renders edit external modal form', () => {
		setupFolders();
		setupTest(<EditExternalCalendarModal folderId={DEFAULT_FOLDER_ID} onClose={vi.fn()} />);

		expect(screen.getByText('Edit calendar')).toBeVisible();
		expect(screen.getByText(new RegExp(`URL: ${DEFAULT_FOLDER_URL}`, 'i'))).toBeVisible();
		expect(screen.getByRole('textbox', { name: CALENDAR_NAME_LABEL })).toBeVisible();
		expect(
			screen.getByText('Choose a color to make this calendar easier to recognize')
		).toBeVisible();
	});

	test('shows loading placeholder when folder does not exist', () => {
		populateFoldersStore({ view: 'appointment' });

		setupTest(<EditExternalCalendarModal folderId={'missing-folder'} onClose={vi.fn()} />);

		expect(screen.getByText('Loading...')).toBeVisible();
	});

	test('shows duplicate calendar name error and keeps save disabled', async () => {
		setupFolders();
		const { user } = setupTest(
			<EditExternalCalendarModal folderId={DEFAULT_FOLDER_ID} onClose={vi.fn()} />
		);

		const nameInput = screen.getByRole('textbox', { name: CALENDAR_NAME_LABEL });
		await user.clear(nameInput);
		await user.pasteInto(nameInput, 'Team calendar');

		expect(screen.getByText('A calendar with the same name already exists')).toBeVisible();
		expect(screen.getByRole('button', { name: SAVE_CHANGES_LABEL })).toBeDisabled();
	});

	test('copy button is disabled when folder has no url', () => {
		setupFolders({ folderUrl: '' });
		setupTest(<EditExternalCalendarModal folderId={DEFAULT_FOLDER_ID} onClose={vi.fn()} />);

		// eslint-disable-next-line testing-library/no-node-access
		expect(screen.getByTestId('icon: Copy').closest('button')).toBeDisabled();
	});

	test('copies external URL when copy button is clicked', async () => {
		setupFolders();
		const copySpy = vi.spyOn(commons, 'copyToClipboard').mockResolvedValue(undefined);
		const { user } = setupTest(
			<EditExternalCalendarModal folderId={DEFAULT_FOLDER_ID} onClose={vi.fn()} />
		);

		await user.click(screen.getByTestId('icon: Copy'));

		await waitFor(() => {
			expect(copySpy).toHaveBeenCalledWith(DEFAULT_FOLDER_URL);
		});
		await waitFor(() => {
			expect(screen.getByText('URL copied')).toBeVisible();
		});
	});

	test('shows an error snackbar when copy to clipboard fails', async () => {
		setupFolders();
		vi.spyOn(commons, 'copyToClipboard').mockRejectedValue(new Error('copy failed'));
		const { user } = setupTest(
			<EditExternalCalendarModal folderId={DEFAULT_FOLDER_ID} onClose={vi.fn()} />
		);

		await user.click(screen.getByTestId('icon: Copy'));

		await waitFor(() => {
			expect(screen.getByText('Something went wrong, please try again')).toBeVisible();
		});
	});

	test('close button is a no-op while the color picker custom-color popover is open', async () => {
		setupFolders();
		const onClose = vi.fn();
		const { user } = setupTest(
			<EditExternalCalendarModal folderId={DEFAULT_FOLDER_ID} onClose={onClose} />
		);

		await user.click(screen.getByTestId('icon: PlusCircleOutline'));
		expect(screen.getByRole('button', { name: 'Close' })).toBeVisible();

		await user.click(screen.getByTestId('icon: CloseOutline'));
		expect(onClose).not.toHaveBeenCalled();
	});

	test('closes immediately without submitting when no values changed', async () => {
		setupFolders({ color: undefined, rgb: '#5AC8FA' });
		const onClose = vi.fn();
		const folderActionSpy = vi.spyOn(calendarActions, 'folderAction');
		const { user } = setupTest(
			<EditExternalCalendarModal folderId={DEFAULT_FOLDER_ID} onClose={onClose} />
		);

		await user.click(screen.getByRole('button', { name: SAVE_CHANGES_LABEL }));

		expect(folderActionSpy).not.toHaveBeenCalled();
		expect(onClose).toHaveBeenCalledTimes(1);
	});

	test('rgb-only folder maps to color index and does not trigger color update on rename', async () => {
		setupFolders({ color: undefined, rgb: '#5AC8FA' });
		const onClose = vi.fn();
		const folderActionSpy = vi.spyOn(calendarActions, 'folderAction').mockResolvedValue({});
		const { user } = setupTest(
			<EditExternalCalendarModal folderId={DEFAULT_FOLDER_ID} onClose={onClose} />
		);

		const nameInput = screen.getByRole('textbox', { name: CALENDAR_NAME_LABEL });
		await user.clear(nameInput);
		await user.pasteInto(nameInput, 'Renamed rgb-only external calendar');
		await user.click(screen.getByRole('button', { name: SAVE_CHANGES_LABEL }));

		await waitFor(() => {
			expect(folderActionSpy).toHaveBeenCalledWith({
				op: FOLDER_OPERATIONS.RENAME,
				name: 'Renamed rgb-only external calendar',
				id: DEFAULT_FOLDER_ID
			});
		});
	});

	test('submits rename action and closes on success', async () => {
		setupFolders();
		const onClose = vi.fn();
		const folderActionSpy = vi.spyOn(calendarActions, 'folderAction').mockResolvedValue({});
		const { user } = setupTest(
			<EditExternalCalendarModal folderId={DEFAULT_FOLDER_ID} onClose={onClose} />
		);

		const nameInput = screen.getByRole('textbox', { name: CALENDAR_NAME_LABEL });
		await user.clear(nameInput);
		await user.pasteInto(nameInput, 'Renamed external calendar');
		await user.click(screen.getByRole('button', { name: SAVE_CHANGES_LABEL }));

		await waitFor(() => {
			expect(folderActionSpy).toHaveBeenCalledWith({
				op: FOLDER_OPERATIONS.RENAME,
				name: 'Renamed external calendar',
				id: DEFAULT_FOLDER_ID
			});
		});
		await waitFor(() => {
			expect(onClose).toHaveBeenCalledTimes(1);
		});
	});

	test('shows error snackbar and closes when API returns Fault', async () => {
		setupFolders();
		const onClose = vi.fn();
		vi.spyOn(calendarActions, 'folderAction').mockResolvedValue({ Fault: 'fault' });
		const { user } = setupTest(
			<EditExternalCalendarModal folderId={DEFAULT_FOLDER_ID} onClose={onClose} />
		);

		const nameInput = screen.getByRole('textbox', { name: CALENDAR_NAME_LABEL });
		await user.clear(nameInput);
		await user.pasteInto(nameInput, 'Broken save name');
		await user.click(screen.getByRole('button', { name: SAVE_CHANGES_LABEL }));

		await waitFor(() => {
			expect(screen.getByText('Something went wrong, please try again')).toBeVisible();
			// eslint-disable-next-line testing-library/no-wait-for-multiple-assertions
			expect(onClose).toHaveBeenCalledTimes(1);
		});
	});

	test('shows error snackbar, keeps modal open and re-enables save on rejected request', async () => {
		setupFolders();
		const onClose = vi.fn();
		vi.spyOn(calendarActions, 'folderAction').mockRejectedValue(new Error('network error'));
		const { user } = setupTest(
			<EditExternalCalendarModal folderId={DEFAULT_FOLDER_ID} onClose={onClose} />
		);

		const nameInput = screen.getByRole('textbox', { name: CALENDAR_NAME_LABEL });
		await user.clear(nameInput);
		await user.pasteInto(nameInput, 'Retry name');
		const saveButton = screen.getByRole('button', { name: SAVE_CHANGES_LABEL });
		await user.click(saveButton);

		await waitFor(() => {
			expect(screen.getByText('Something went wrong, please try again')).toBeVisible();
		});
		expect(onClose).not.toHaveBeenCalled();
		expect(screen.getByRole('button', { name: SAVE_CHANGES_LABEL })).toBeEnabled();
		expect(screen.getByRole('textbox', { name: CALENDAR_NAME_LABEL })).toBeEnabled();
	});

	describe('free/busy', () => {
		test('shows the exclude from free/busy checkbox unchecked when the folder has no b flag', () => {
			setupFolders();
			setupTest(<EditExternalCalendarModal folderId={DEFAULT_FOLDER_ID} onClose={vi.fn()} />);

			expect(screen.getByText(EXCLUDE_FREE_BUSY_LABEL)).toBeVisible();
			expect(screen.getByTestId('icon: Square')).toBeVisible();
		});

		test('shows the checkbox checked when the folder is excluded from free/busy', () => {
			setupFolders({ flags: '#yb' });
			setupTest(<EditExternalCalendarModal folderId={DEFAULT_FOLDER_ID} onClose={vi.fn()} />);

			expect(screen.getByTestId('icon: CheckmarkSquare')).toBeVisible();
		});

		test('excludes the calendar from free/busy when the checkbox is checked and saved', async () => {
			setupFolders();
			const onClose = vi.fn();
			const folderActionSpy = vi.spyOn(calendarActions, 'folderAction').mockResolvedValue({});
			const { user } = setupTest(
				<EditExternalCalendarModal folderId={DEFAULT_FOLDER_ID} onClose={onClose} />
			);

			await user.click(screen.getByText(EXCLUDE_FREE_BUSY_LABEL));
			await user.click(screen.getByRole('button', { name: SAVE_CHANGES_LABEL }));

			await waitFor(() => {
				expect(folderActionSpy).toHaveBeenCalledWith({
					op: FOLDER_OPERATIONS.FREE_BUSY,
					excludeFreeBusy: true,
					id: DEFAULT_FOLDER_ID
				});
			});
			await waitFor(() => {
				expect(onClose).toHaveBeenCalledTimes(1);
			});
		});

		test('includes the calendar in free/busy again when the checkbox is unchecked and saved', async () => {
			setupFolders({ flags: '#yb' });
			const folderActionSpy = vi.spyOn(calendarActions, 'folderAction').mockResolvedValue({});
			const { user } = setupTest(
				<EditExternalCalendarModal folderId={DEFAULT_FOLDER_ID} onClose={vi.fn()} />
			);

			await user.click(screen.getByText(EXCLUDE_FREE_BUSY_LABEL));
			await user.click(screen.getByRole('button', { name: SAVE_CHANGES_LABEL }));

			await waitFor(() => {
				expect(folderActionSpy).toHaveBeenCalledWith({
					op: FOLDER_OPERATIONS.FREE_BUSY,
					excludeFreeBusy: false,
					id: DEFAULT_FOLDER_ID
				});
			});
		});

		test('sends rename and free/busy together when both change', async () => {
			setupFolders();
			const folderActionSpy = vi.spyOn(calendarActions, 'folderAction').mockResolvedValue({});
			const { user } = setupTest(
				<EditExternalCalendarModal folderId={DEFAULT_FOLDER_ID} onClose={vi.fn()} />
			);

			const nameInput = screen.getByRole('textbox', { name: CALENDAR_NAME_LABEL });
			await user.clear(nameInput);
			await user.pasteInto(nameInput, 'Holidays');
			await user.click(screen.getByText(EXCLUDE_FREE_BUSY_LABEL));
			await user.click(screen.getByRole('button', { name: SAVE_CHANGES_LABEL }));

			await waitFor(() => {
				expect(folderActionSpy).toHaveBeenCalledWith([
					{ op: FOLDER_OPERATIONS.RENAME, name: 'Holidays', id: DEFAULT_FOLDER_ID },
					{ op: FOLDER_OPERATIONS.FREE_BUSY, excludeFreeBusy: true, id: DEFAULT_FOLDER_ID }
				]);
			});
		});
	});
});
