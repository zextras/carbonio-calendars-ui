/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { screen, waitFor } from '@testing-library/react';
import { UserEvent } from '@testing-library/user-event';
import { values } from 'lodash';

import { setupTest } from '@test-setup';
import { generateEditor } from 'commons/editor-generator';
import { RECURRENCE_FREQUENCY } from 'constants/recurrence';
import { reducers } from 'store/redux';
import { CustomRecurrenceModal } from 'view/editor/parts/recurrence/views/custom-recurrence-modal';

const createStoreWithEditor = (): {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	store: any;
	editor: ReturnType<typeof generateEditor>;
} => {
	const store = configureStore({ reducer: combineReducers(reducers) });
	const editor = generateEditor({ context: { dispatch: store.dispatch, folders: {} } });
	return { store, editor };
};

const getCustomizeButton = (): HTMLElement =>
	screen.getByRole('button', { name: 'editor.repeat.set-custom-repeat' });

const getCancelButton = (): HTMLElement => screen.getByRole('button', { name: 'label.cancel' });

const selectFrequency = async (
	user: UserEvent,
	frequency: 'day' | 'week' | 'month' | 'year'
): Promise<void> => {
	const frequencyDisplayMap: Record<string, string> = {
		day: 'Day',
		week: 'Week',
		month: 'Month',
		year: 'Year'
	};

	// Find the current displayed frequency text (Day, Week, Month, or Year)
	const currentFrequency = screen.getByText(/^(Day|Week|Month|Year)$/);
	// Click on its parent container to open the dropdown
	// eslint-disable-next-line testing-library/no-node-access
	const dropdownContainer = currentFrequency.closest('[tabindex="0"]');
	if (dropdownContainer) {
		await user.click(dropdownContainer as HTMLElement);
	}

	// Then find and click the frequency option from the dropdown menu
	const frequencyOption = await screen.findByText(frequencyDisplayMap[frequency]);
	await user.click(frequencyOption);
};

const clickCustomizeButton = async (user: UserEvent): Promise<void> => {
	await user.click(getCustomizeButton());
};

const getUpdatedEditor = (
	store: ReturnType<typeof createStoreWithEditor>['store']
): ReturnType<typeof generateEditor> => values(store.getState().editor.editors)[0];

const getIntervalInput = (): HTMLInputElement => {
	const inputContainer = screen.getByTestId('interval-input-container');
	// eslint-disable-next-line testing-library/no-node-access
	const intervalInput = inputContainer.querySelector('input');
	assert(intervalInput instanceof HTMLInputElement, 'Interval input not found');
	return intervalInput;
};

describe('CustomRecurrenceModal', () => {
	describe('UI Elements', () => {
		it('should display cancel and customize buttons', () => {
			const { store, editor } = createStoreWithEditor();

			setupTest(<CustomRecurrenceModal editorId={editor.id} onClose={vi.fn()} />, {
				store
			});

			expect(getCancelButton()).toBeInTheDocument();
			expect(getCustomizeButton()).toBeInTheDocument();
		});
	});

	describe('User Interactions', () => {
		it('should call onClose when cancel button is clicked', async () => {
			const { store, editor } = createStoreWithEditor();
			const onCloseMock = vi.fn();

			const { user } = setupTest(
				<CustomRecurrenceModal editorId={editor.id} onClose={onCloseMock} />,
				{
					store
				}
			);

			await user.click(getCancelButton());

			expect(onCloseMock).toHaveBeenCalledTimes(1);
		});

		describe('Confirmation and State Persistence', () => {
			it('should save daily frequency when customized and confirmed', async () => {
				const { store, editor } = createStoreWithEditor();

				const { user } = setupTest(
					<CustomRecurrenceModal editorId={editor.id} onClose={vi.fn()} />,
					{
						store
					}
				);

				await clickCustomizeButton(user);

				const updatedEditor = getUpdatedEditor(store);

				expect(updatedEditor.recur).toStrictEqual({
					add: { rule: { freq: RECURRENCE_FREQUENCY.DAILY } }
				});
			});

			describe('weekly frequency', () => {
				it('should save weekly frequency with initial day auto-selected when customized and confirmed', async () => {
					const { store, editor } = createStoreWithEditor();

					const { user } = setupTest(
						<CustomRecurrenceModal editorId={editor.id} onClose={vi.fn()} />,
						{
							store
						}
					);

					await selectFrequency(user, 'week');
					await clickCustomizeButton(user);

					const updatedEditor = getUpdatedEditor(store);

					// Calculate the expected initial day from the editor's start date
					const startDate = new Date(editor.start ?? Date.now());
					const dayOfWeek = startDate.getDay(); // 0 = Sunday, 6 = Saturday
					const dayCodes = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
					const expectedInitialDay = dayCodes[dayOfWeek];

					// The recurrence should include the frequency and the auto-selected initial day
					expect(updatedEditor.recur?.add?.rule?.freq).toBe(RECURRENCE_FREQUENCY.WEEKLY);
					expect(updatedEditor.recur?.add?.rule?.byday?.wkday).toBeDefined();
					expect(updatedEditor.recur?.add?.rule?.byday?.wkday?.length).toBeGreaterThanOrEqual(1);

					// Verify the initial day is in the selected days
					const selectedDays =
						updatedEditor.recur?.add?.rule?.byday?.wkday?.map((d: { day: string }) => d.day) ?? [];
					expect(selectedDays).toContain(expectedInitialDay);
				});

				it('should save selected week days for weekly frequency when customized and confirmed', async () => {
					const { store, editor } = createStoreWithEditor();

					const { user } = setupTest(
						<CustomRecurrenceModal editorId={editor.id} onClose={vi.fn()} />,
						{
							store
						}
					);

					await selectFrequency(user, 'week');

					await user.click(screen.getByRole('button', { name: 'TUE' }));
					await user.click(screen.getByRole('button', { name: 'THU' }));

					await clickCustomizeButton(user);

					const updatedEditor = getUpdatedEditor(store);

					const actualDays = new Set(
						updatedEditor.recur?.add?.rule?.byday?.wkday?.map((d: { day: string }) => d.day) ?? []
					);

					expect(updatedEditor.recur?.add?.rule?.freq).toBe(RECURRENCE_FREQUENCY.WEEKLY);

					expect(actualDays.size).toBeGreaterThanOrEqual(2);

					expect(actualDays.has('TU')).toBe(true);
					expect(actualDays.has('TH')).toBe(true);
				});
			});

			it('should save monthly frequency when customized and confirmed', async () => {
				const { store, editor } = createStoreWithEditor();

				const { user } = setupTest(
					<CustomRecurrenceModal editorId={editor.id} onClose={vi.fn()} />,
					{
						store
					}
				);

				await selectFrequency(user, 'month');
				await clickCustomizeButton(user);

				const updatedEditor = getUpdatedEditor(store);

				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				const expectedDayOfMonth = new Date(editor.start).getDate();

				expect(updatedEditor.recur).toStrictEqual({
					add: {
						rule: {
							bymonthday: {
								modaylist: expectedDayOfMonth
							},
							freq: RECURRENCE_FREQUENCY.MONTHLY
						}
					}
				});
			});

			it('should save yearly frequency when customized and confirmed', async () => {
				const { store, editor } = createStoreWithEditor();

				const { user } = setupTest(
					<CustomRecurrenceModal editorId={editor.id} onClose={vi.fn()} />,
					{
						store
					}
				);

				await selectFrequency(user, 'year');
				await clickCustomizeButton(user);

				const updatedEditor = getUpdatedEditor(store);

				expect(updatedEditor.recur).toStrictEqual({
					add: { rule: { freq: RECURRENCE_FREQUENCY.YEARLY } }
				});
			});
		});

		describe('Frequency label Pluralization', () => {
			it('should show plural "Days" for day frequency with interval 10', async () => {
				const { store, editor } = createStoreWithEditor();

				const { user } = setupTest(
					<CustomRecurrenceModal editorId={editor.id} onClose={vi.fn()} />,
					{ store }
				);

				const intervalInput = getIntervalInput();
				await user.clear(intervalInput);
				await user.type(intervalInput, '10');

				await waitFor(() => {
					expect(screen.getByText('Days')).toBeInTheDocument();
				});
			});

			it('should show plural "Weeks" for week frequency with interval 3', async () => {
				const { store, editor } = createStoreWithEditor();

				const { user } = setupTest(
					<CustomRecurrenceModal editorId={editor.id} onClose={vi.fn()} />,
					{ store }
				);

				await selectFrequency(user, 'week');

				const intervalInput = getIntervalInput();
				await user.clear(intervalInput);
				await user.type(intervalInput, '3');

				await waitFor(() => {
					expect(screen.getByText('Weeks')).toBeInTheDocument();
				});
			});

			it('should show plural "Months" for month frequency with interval 7', async () => {
				const { store, editor } = createStoreWithEditor();

				const { user } = setupTest(
					<CustomRecurrenceModal editorId={editor.id} onClose={vi.fn()} />,
					{ store }
				);

				await selectFrequency(user, 'month');

				const intervalInput = getIntervalInput();
				await user.clear(intervalInput);
				await user.type(intervalInput, '7');

				await waitFor(() => {
					expect(screen.getByText('Months')).toBeInTheDocument();
				});
			});

			it('should show plural "Years" for year frequency with interval 99', async () => {
				const { store, editor } = createStoreWithEditor();

				const { user } = setupTest(
					<CustomRecurrenceModal editorId={editor.id} onClose={vi.fn()} />,
					{ store }
				);

				await selectFrequency(user, 'year');

				const intervalInput = getIntervalInput();
				await user.clear(intervalInput);
				await user.type(intervalInput, '99');

				await waitFor(() => {
					expect(screen.getByText('Years')).toBeInTheDocument();
				});
			});
		});
	});
});
