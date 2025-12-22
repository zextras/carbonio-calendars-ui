/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { faker } from '@faker-js/faker';
import { screen } from '@testing-library/react';
import { FOLDER_VIEW, FOLDERS } from '@zextras/carbonio-ui-commons';

import mockedData from '../../../test/generators';
import { EventType } from '../../../types/event';
import { MoveModal } from '../move-modal';
import { setupTest } from '@test-setup';
import { generateFolder } from '@test-utils/folders/folders-generator';
import { populateFoldersStore } from '@test-utils/store/folders';

const mockToggleModal = vi.fn();
const mockOnClose = vi.fn();
const mockAction = vi.fn();

const mockEvent = mockedData.getEvent({ title: 'Test Event' });
const defaultCalendarFolder = generateFolder({
	id: faker.number.int({ min: 100 }).toString(),
	name: 'DefaultCalendar',
	color: faker.number.int({ min: 0, max: 9 })
});

describe('MoveModal', () => {
	beforeEach(() => {
		populateFoldersStore({
			view: FOLDER_VIEW.appointment,
			noSharedAccounts: true,
			customFolders: [defaultCalendarFolder]
		});
	});

	it('renders the modal with the correct title for moving an event', () => {
		setupTest(
			<MoveModal
				toggleModal={mockToggleModal}
				onClose={mockOnClose}
				event={mockEvent}
				currentFolder={defaultCalendarFolder}
				action={mockAction}
			/>
		);

		expect(screen.getByText('label.move Test Event')).toBeInTheDocument();
	});

	it('renders the modal with the correct title for restoring an event if in trash', () => {
		const trashEvent: EventType = {
			...mockEvent,
			resource: {
				...mockEvent.resource,
				calendar: {
					id: FOLDERS.TRASH,
					name: 'trash',
					color: {
						color: '',
						background: '',
						label: undefined
					}
				}
			}
		};

		setupTest(
			<MoveModal
				toggleModal={mockToggleModal}
				onClose={mockOnClose}
				event={trashEvent}
				currentFolder={defaultCalendarFolder}
				action={mockAction}
			/>
		);

		expect(screen.getByText('label.restore Test Event')).toBeInTheDocument();
	});

	it('calls the action and onClose when confirming a valid folder destination', async () => {
		const { user } = setupTest(
			<MoveModal
				toggleModal={mockToggleModal}
				onClose={mockOnClose}
				event={mockEvent}
				currentFolder={defaultCalendarFolder}
				action={mockAction}
			/>
		);

		const moveButton = screen.getByRole('button', { name: 'label.move' });

		expect(moveButton).toBeDisabled();

		const destinationFolder = screen.getByText(/emailed contacts/i);
		await user.click(destinationFolder);

		expect(moveButton).toBeEnabled();

		await user.click(moveButton);
		expect(mockAction).toHaveBeenCalledTimes(1);
		expect(mockOnClose).toHaveBeenCalledTimes(1);
	});

	it('disables the confirm button if no folder is selected', () => {
		setupTest(
			<MoveModal
				toggleModal={mockToggleModal}
				onClose={mockOnClose}
				event={mockEvent}
				currentFolder={defaultCalendarFolder}
				action={mockAction}
			/>
		);

		const moveButton = screen.getByRole('button', { name: 'label.move' });
		expect(moveButton).toBeDisabled();
	});

	it('disables the confirm button if the selected folder is the current folder', async () => {
		const { user } = setupTest(
			<MoveModal
				toggleModal={mockToggleModal}
				onClose={mockOnClose}
				event={mockEvent}
				currentFolder={defaultCalendarFolder}
				action={mockAction}
			/>
		);

		const destinationFolder = screen.getByText(defaultCalendarFolder.name);
		await user.click(destinationFolder);

		const moveButton = screen.getByRole('button', { name: 'label.move' });
		expect(moveButton).toBeDisabled();
	});
});
