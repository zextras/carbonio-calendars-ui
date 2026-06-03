/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { waitFor } from '@testing-library/react';
import { useFolder } from '@zextras/carbonio-ui-commons';
import { Mock } from 'vitest';

import { setupTest, screen } from '@test-setup';
import { generateFolder } from '@test-utils/folders/folders-generator';
import { populateFoldersStore } from '@test-utils/store/folders';
import { CALENDARS_STANDARD_COLORS } from 'constants/calendar';
import { FOLDER_OPERATIONS } from 'constants/api';
import * as calendarActions from '../../store/actions/calendar-actions';
import { EditCaldavChildCalendarModal } from './edit-caldav-child-calendar-modal';

vi.mock('@zextras/carbonio-ui-commons', async () => ({
	...(await vi.importActual('@zextras/carbonio-ui-commons')),
	useFolder: vi.fn()
}));

vi.mock('@zextras/carbonio-design-system', async () => {
	const actual = await vi.importActual('@zextras/carbonio-design-system');

	return {
		...actual,
		Select: ({ label, items, disabled, onChange }: any): JSX.Element => (
			<label>
				{label}
				<select
					data-testid="mock-color-select"
					disabled={disabled}
					onChange={(event): void => onChange?.(event.target.value)}
				>
					{items?.map((item: { value: string; label: string }) => (
						<option key={item.value} value={item.value}>
							{item.label}
						</option>
					))}
				</select>
			</label>
		)
	};
});

const FOLDER_ID = 'caldav-child-1';
const FOLDER_NAME = 'Child Calendar';

const buildFolder = (overrides?: Record<string, unknown>): ReturnType<typeof generateFolder> =>
	generateFolder({
		id: FOLDER_ID,
		name: FOLDER_NAME,
		view: 'appointment',
		rgb: CALENDARS_STANDARD_COLORS[0].color,
		...overrides
	});

describe('EditCaldavChildCalendarModal', () => {
	beforeEach(() => {
		vi.restoreAllMocks();
	});

	it('renders disabled name input when calendar is read-only', () => {
		const folder = buildFolder({ perm: 'r' });
		(useFolder as Mock).mockReturnValue(folder);
		populateFoldersStore({ customFolders: [folder] });

		setupTest(<EditCaldavChildCalendarModal folderId={FOLDER_ID} onClose={vi.fn()} />);

		expect(screen.getByDisplayValue(FOLDER_NAME)).toBeDisabled();
	});

	it('calls onClose without folderAction when neither name nor color changed', async () => {
		const folder = buildFolder({ perm: 'rw' });
		(useFolder as Mock).mockReturnValue(folder);
		populateFoldersStore({ customFolders: [folder] });
		const onClose = vi.fn();
		const folderActionSpy = vi.spyOn(calendarActions, 'folderAction');

		const { user } = setupTest(
			<EditCaldavChildCalendarModal folderId={FOLDER_ID} onClose={onClose} />
		);
		await user.click(screen.getByRole('button', { name: 'Save Changes' }));

		expect(folderActionSpy).not.toHaveBeenCalled();
		expect(onClose).toHaveBeenCalledTimes(1);
	});

	it('submits COLOR action only when read-only calendar color is changed', async () => {
		const folder = buildFolder({ perm: 'r' });
		(useFolder as Mock).mockReturnValue(folder);
		populateFoldersStore({ customFolders: [folder] });
		const onClose = vi.fn();
		vi.spyOn(calendarActions, 'folderAction').mockResolvedValue({} as never);

		const { user } = setupTest(
			<EditCaldavChildCalendarModal folderId={FOLDER_ID} onClose={onClose} />
		);
		await user.selectOptions(screen.getByTestId('mock-color-select'), '1');
		await user.click(screen.getByRole('button', { name: 'Save Changes' }));

		await waitFor(() => {
			expect(calendarActions.folderAction).toHaveBeenCalledWith({
				op: FOLDER_OPERATIONS.COLOR,
				rgb: CALENDARS_STANDARD_COLORS[1].color,
				id: FOLDER_ID
			});
		});
		await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
	});

	it('submits both RENAME and COLOR actions when name and color change', async () => {
		const folder = buildFolder({ perm: 'rw' });
		(useFolder as Mock).mockReturnValue(folder);
		populateFoldersStore({ customFolders: [folder] });
		vi.spyOn(calendarActions, 'folderAction').mockResolvedValue({} as never);

		const { user } = setupTest(
			<EditCaldavChildCalendarModal folderId={FOLDER_ID} onClose={vi.fn()} />
		);
		await user.clear(screen.getByDisplayValue(FOLDER_NAME));
		await user.type(screen.getByRole('textbox'), 'Renamed Child Calendar');
		await user.selectOptions(screen.getByTestId('mock-color-select'), '1');
		await user.click(screen.getByRole('button', { name: 'Save Changes' }));

		await waitFor(() => {
			expect(calendarActions.folderAction).toHaveBeenCalledWith([
				{ op: FOLDER_OPERATIONS.RENAME, name: 'Renamed Child Calendar', id: FOLDER_ID },
				{ op: FOLDER_OPERATIONS.COLOR, rgb: CALENDARS_STANDARD_COLORS[1].color, id: FOLDER_ID }
			]);
		});
	});
});
