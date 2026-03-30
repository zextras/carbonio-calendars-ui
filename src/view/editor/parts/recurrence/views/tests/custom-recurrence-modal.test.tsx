/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { screen } from '@testing-library/react';
import { UserEvent } from '@testing-library/user-event';
import { values } from 'lodash';

import { setupTest } from '@test-setup';
import { generateEditor } from 'commons/editor-generator';
import { RECURRENCE_FREQUENCY } from 'constants/recurrence';
import { reducers } from 'store/redux';
import { CustomRecurrenceModal } from 'view/editor/parts/recurrence/views/custom-recurrence-modal';
import { calculateOrdinalPosition } from 'view/editor/parts/recurrence/views/monthly-options-utils';

// Test constants
const MONTHLY_OPTION_DAY_OF_MONTH = 'monthly-option-day-of-month';
const MONTHLY_OPTION_ORDINAL_WEEKDAY = 'monthly-option-ordinal-weekday';
const FIXED_MONDAY_START = new Date(2026, 0, 5, 9, 0, 0).getTime();

// Human-readable helper functions
const modal = {
	async cancel(user: UserEvent): Promise<void> {
		await user.click(screen.getByRole('button', { name: 'label.cancel' }));
	},

	async confirmCustomization(user: UserEvent): Promise<void> {
		await user.click(screen.getByRole('button', { name: 'editor.repeat.set-custom-repeat' }));
	},

	isVisible(): { cancelButton: void; customizeButton: void } {
		return {
			cancelButton: expect(
				screen.getByRole('button', { name: 'label.cancel' })
			).toBeInTheDocument(),
			customizeButton: expect(
				screen.getByRole('button', { name: 'editor.repeat.set-custom-repeat' })
			).toBeInTheDocument()
		};
	}
};

const frequencySelector = {
	async select(user: UserEvent, frequency: 'day' | 'week' | 'month' | 'year'): Promise<void> {
		const frequencyDisplayMap: Record<string, string> = {
			day: 'Day(s)',
			week: 'Week(s)',
			month: 'Month(s)',
			year: 'Year(s)'
		};

		const currentFrequency = screen.getByText(/^(Day\(s\)|Week\(s\)|Month\(s\)|Year\(s\))$/);
		// eslint-disable-next-line testing-library/no-node-access
		const dropdownContainer = currentFrequency.closest('[tabindex="0"]');
		if (dropdownContainer) {
			await user.click(dropdownContainer as HTMLElement);
		}

		const frequencyOption = await screen.findByText(frequencyDisplayMap[frequency]);
		await user.click(frequencyOption);
	}
};
const weekDaySelector = {
	async selectDays(user: UserEvent, days: string[]): Promise<void> {
		// eslint-disable-next-line no-restricted-syntax
		for (const day of days) {
			// eslint-disable-next-line no-await-in-loop
			const button = await screen.findByRole('button', { name: day }, { timeout: 3000 });
			// eslint-disable-next-line no-await-in-loop
			await user.click(button);
		}
	},

	async waitForOptionsToLoad(): Promise<void> {
		await screen.findByRole(
			'button',
			{ name: 'MON' },
			{
				timeout: 3000
			}
		);
	}
};

const monthlyOptions = {
	async waitForOptionsToLoad(): Promise<void> {
		await screen.findByTestId(MONTHLY_OPTION_DAY_OF_MONTH, {}, { timeout: 3000 });
	},

	async selectOrdinalWeekday(user: UserEvent): Promise<void> {
		const radio = await screen.findByTestId(MONTHLY_OPTION_ORDINAL_WEEKDAY, {}, { timeout: 3000 });
		await user.click(radio);
	},

	async selectDayOfMonth(user: UserEvent): Promise<void> {
		const radio = await screen.findByTestId(MONTHLY_OPTION_DAY_OF_MONTH, {}, { timeout: 3000 });
		await user.click(radio);
	},

	async selectOrdinalThenDayOfMonth(user: UserEvent): Promise<void> {
		await this.selectOrdinalWeekday(user);
		await this.selectDayOfMonth(user);
	}
};

const recurrenceAssertions = {
	expectDaily(editor: ReturnType<typeof generateEditor>): void {
		expect(editor.recur).toStrictEqual({
			add: { rule: { freq: RECURRENCE_FREQUENCY.DAILY } }
		});
	},

	expectWeekly(editor: ReturnType<typeof generateEditor>, expectedDays: string[] = []): void {
		expect(editor.recur?.add?.rule?.freq).toBe(RECURRENCE_FREQUENCY.WEEKLY);
		expect(editor.recur?.add?.rule?.byday?.wkday).toBeDefined();

		if (expectedDays.length > 0) {
			const actualDays =
				editor.recur?.add?.rule?.byday?.wkday?.map((d: { day: string }) => d.day) ?? [];
			expectedDays.forEach((day) => expect(actualDays).toContain(day));
		}
	},

	expectMonthlyWithDayOfMonth(
		editor: ReturnType<typeof generateEditor>,
		expectedDayOfMonth: number
	): void {
		expect(editor.recur).toStrictEqual({
			add: {
				rule: {
					bymonthday: {
						modaylist: expectedDayOfMonth
					},
					freq: RECURRENCE_FREQUENCY.MONTHLY
				}
			}
		});
	},

	expectMonthlyWithOrdinalWeekday(
		editor: ReturnType<typeof generateEditor>,
		expectedOrdinalPosition: number,
		expectedWeekdayCode: string
	): void {
		expect(editor.recur?.add?.rule?.freq).toBe(RECURRENCE_FREQUENCY.MONTHLY);
		expect(editor.recur?.add?.rule?.bysetpos?.poslist).toBe(expectedOrdinalPosition.toString());
		expect(editor.recur?.add?.rule?.byday?.wkday).toEqual([{ day: expectedWeekdayCode }]);
		expect(editor.recur?.add?.rule?.bymonthday).toBeUndefined();
	},

	expectYearly(editor: ReturnType<typeof generateEditor>): void {
		expect(editor.recur).toStrictEqual({
			add: { rule: { freq: RECURRENCE_FREQUENCY.YEARLY } }
		});
	}
};

// Test setup helpers
const createStoreWithEditor = (): {
	// eslint-disable-next-line
	store: any;
	editor: ReturnType<typeof generateEditor>;
} => {
	const store = configureStore({ reducer: combineReducers(reducers) });
	const editor = generateEditor({ context: { dispatch: store.dispatch, folders: {} } });
	return { store, editor };
};

const getUpdatedEditor = (
	store: ReturnType<typeof createStoreWithEditor>['store']
): ReturnType<typeof generateEditor> => values(store.getState().editor.editors)[0];

const setEditorStartDate = (
	store: ReturnType<typeof createStoreWithEditor>['store'],
	editor: ReturnType<typeof generateEditor>,
	start: number
): void => {
	store.dispatch({
		type: 'editor/editEditorDate',
		payload: {
			id: editor.id,
			start,
			end: editor.end
		}
	});
};

describe('CustomRecurrenceModal', () => {
	describe('UI Elements', () => {
		it('should display cancel and customize buttons', () => {
			const { store, editor } = createStoreWithEditor();
			setupTest(<CustomRecurrenceModal editorId={editor.id} onClose={vi.fn()} />, { store });

			modal.isVisible();
		});
	});

	describe('User Interactions', () => {
		it('should call onClose when cancel button is clicked', async () => {
			const { store, editor } = createStoreWithEditor();
			const onCloseMock = vi.fn();

			const { user } = setupTest(
				<CustomRecurrenceModal editorId={editor.id} onClose={onCloseMock} />,
				{ store }
			);

			await modal.cancel(user);
			expect(onCloseMock).toHaveBeenCalledTimes(1);
		});

		describe('Confirmation and State Persistence', () => {
			it('should save daily frequency when customized and confirmed', async () => {
				const { store, editor } = createStoreWithEditor();

				const { user } = setupTest(
					<CustomRecurrenceModal editorId={editor.id} onClose={vi.fn()} />,
					{ store }
				);

				await modal.confirmCustomization(user);
				recurrenceAssertions.expectDaily(getUpdatedEditor(store));
			});

			describe('weekly frequency', () => {
				it('should save weekly frequency with initial day auto-selected when customized and confirmed', async () => {
					const { store, editor } = createStoreWithEditor();
					setEditorStartDate(store, editor, FIXED_MONDAY_START);

					const { user } = setupTest(
						<CustomRecurrenceModal editorId={editor.id} onClose={vi.fn()} />,
						{ store }
					);

					await frequencySelector.select(user, 'week');
					await weekDaySelector.waitForOptionsToLoad();
					await modal.confirmCustomization(user);

					const startDate = new Date(FIXED_MONDAY_START);
					const dayOfWeek = startDate.getDay();
					const dayCodes = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
					const expectedInitialDay = dayCodes[dayOfWeek];

					recurrenceAssertions.expectWeekly(getUpdatedEditor(store), [expectedInitialDay]);
				}, 10000);

				it('should save selected week days for weekly frequency when customized and confirmed', async () => {
					const { store, editor } = createStoreWithEditor();
					setEditorStartDate(store, editor, FIXED_MONDAY_START);

					const { user } = setupTest(
						<CustomRecurrenceModal editorId={editor.id} onClose={vi.fn()} />,
						{ store }
					);

					await frequencySelector.select(user, 'week');
					await weekDaySelector.waitForOptionsToLoad();

					const daysToSelect = ['TU', 'TH'];
					const daysToSelectUi = ['TUE', 'THU'];

					await weekDaySelector.selectDays(user, daysToSelectUi);
					await modal.confirmCustomization(user);

					recurrenceAssertions.expectWeekly(getUpdatedEditor(store), daysToSelect);
				}, 10000);

				it('should initialize with saved weekly recurrence days when reopening modal', async () => {
					const { store, editor } = createStoreWithEditor();

					// First, save a weekly recurrence with Monday and Friday
					store.dispatch({
						type: 'editor/editEditorRecurrence',
						payload: {
							id: editor.id,
							recur: [
								{
									add: [
										{
											rule: [
												{
													freq: RECURRENCE_FREQUENCY.WEEKLY,
													interval: [{ ival: 1 }],
													byday: [{ wkday: [{ day: 'MO' }, { day: 'FR' }] }]
												}
											]
										}
									]
								}
							]
						}
					});

					const { user } = setupTest(
						<CustomRecurrenceModal editorId={editor.id} onClose={vi.fn()} />,
						{ store }
					);

					// Modal should already show weekly frequency since it's saved in the editor
					// Just wait for the weekly options to be visible
					await weekDaySelector.waitForOptionsToLoad();

					// Confirm without making any changes - should preserve the saved recurrence
					await modal.confirmCustomization(user);

					const updatedEditor = getUpdatedEditor(store);
					const savedDays =
						updatedEditor.recur?.add?.rule?.byday?.wkday?.map((d: { day: string }) => d.day) ?? [];

					// Should preserve the previously saved days (MO and FR)
					expect(savedDays).toContain('MO');
					expect(savedDays).toContain('FR');
					expect(savedDays.length).toBe(2);
				}, 10000);

				it('should allow unchecking a day when multiple days are selected', async () => {
					const { store, editor } = createStoreWithEditor();
					setEditorStartDate(store, editor, FIXED_MONDAY_START);

					const { user } = setupTest(
						<CustomRecurrenceModal editorId={editor.id} onClose={vi.fn()} />,
						{ store }
					);

					await frequencySelector.select(user, 'week');
					await weekDaySelector.waitForOptionsToLoad();

					// Calculate which day is auto-selected based on the event's start date
					const startDate = new Date(FIXED_MONDAY_START);
					const dayOfWeek = startDate.getDay();
					const dayCodes = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
					const dayCodesUi = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
					const autoSelectedDay = dayCodes[dayOfWeek];

					const aDayOtherThanSelected = 'TU';
					assert(
						aDayOtherThanSelected,
						'There should be at least one day other than the auto-selected day'
					);

					await weekDaySelector.selectDays(user, [
						dayCodesUi[dayCodes.indexOf(aDayOtherThanSelected)]
					]);

					// Now we have 2 days selected: auto-selected day + aDayOtherThanSelected
					// Uncheck  auto-selected day (should work since we have multiple days selected)
					const autoSelectedDayButton = await screen.findByRole('button', {
						name: dayCodesUi[dayCodes.indexOf(autoSelectedDay)]
					});
					await user.click(autoSelectedDayButton);

					await modal.confirmCustomization(user);

					const updatedEditor = getUpdatedEditor(store);
					const savedDays =
						updatedEditor.recur?.add?.rule?.byday?.wkday?.map((d: { day: string }) => d.day) ?? [];

					// Should only have aDayOtherThanSelected
					expect(savedDays).toContain(aDayOtherThanSelected);
					expect(savedDays).not.toContain(autoSelectedDay);

					expect(savedDays.length).toBe(1);
				}, 10000);

				it('should prevent unchecking the last remaining day', async () => {
					const { store, editor } = createStoreWithEditor();
					setEditorStartDate(store, editor, FIXED_MONDAY_START);

					const { user } = setupTest(
						<CustomRecurrenceModal editorId={editor.id} onClose={vi.fn()} />,
						{ store }
					);

					await frequencySelector.select(user, 'week');
					await weekDaySelector.waitForOptionsToLoad();

					// The initial state should have one day selected (the event's start day)
					// Try to uncheck it - should not work (minimum one day required)
					const startDate = new Date(FIXED_MONDAY_START);
					const dayOfWeek = startDate.getDay();
					const dayCodes = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
					const dayLabels = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
					const initialDay = dayCodes[dayOfWeek];
					const initialDayLabel = dayLabels[dayOfWeek];

					// Try to uncheck the only selected day
					const dayButton = await screen.findByRole('button', { name: initialDayLabel });
					await user.click(dayButton);

					await modal.confirmCustomization(user);

					const updatedEditor = getUpdatedEditor(store);
					const savedDays =
						updatedEditor.recur?.add?.rule?.byday?.wkday?.map((d: { day: string }) => d.day) ?? [];

					// Should still have the initial day (cannot uncheck the last day)
					expect(savedDays).toContain(initialDay);
					expect(savedDays.length).toBe(1);
				}, 10000);
			});

			describe('monthly frequency', () => {
				it('should save monthly frequency with initial date when customized and confirmed', async () => {
					const { store, editor } = createStoreWithEditor();

					const { user } = setupTest(
						<CustomRecurrenceModal editorId={editor.id} onClose={vi.fn()} />,
						{ store }
					);

					await frequencySelector.select(user, 'month');
					await monthlyOptions.waitForOptionsToLoad();
					await modal.confirmCustomization(user);

					assert(editor.start, 'Editor start date should be defined.');
					const expectedDayOfMonth = new Date(editor.start).getDate();

					recurrenceAssertions.expectMonthlyWithDayOfMonth(
						getUpdatedEditor(store),
						expectedDayOfMonth
					);
				}, 10000);

				it('should save monthly frequency with ordinal weekday when customized radio is selected', async () => {
					const { store, editor } = createStoreWithEditor();

					const { user } = setupTest(
						<CustomRecurrenceModal editorId={editor.id} onClose={vi.fn()} />,
						{ store }
					);

					await frequencySelector.select(user, 'month');

					assert(editor.start, 'Editor start date should be defined');
					const startDate = new Date(editor.start);
					const { ordinalPosition: expectedOrdinalPosition, weekdayCode: expectedWeekdayCode } =
						calculateOrdinalPosition(startDate);

					await monthlyOptions.selectOrdinalWeekday(user);
					await modal.confirmCustomization(user);

					recurrenceAssertions.expectMonthlyWithOrdinalWeekday(
						getUpdatedEditor(store),
						expectedOrdinalPosition,
						expectedWeekdayCode
					);
				}, 10000);

				it('should save monthly frequency with day of month when day of month radio is selected', async () => {
					const { store, editor } = createStoreWithEditor();

					const { user } = setupTest(
						<CustomRecurrenceModal editorId={editor.id} onClose={vi.fn()} />,
						{ store }
					);

					await frequencySelector.select(user, 'month');

					assert(editor.start, 'Editor start date should be defined');
					const expectedDayOfMonth = new Date(editor.start).getDate();

					await monthlyOptions.selectOrdinalThenDayOfMonth(user);
					await modal.confirmCustomization(user);

					recurrenceAssertions.expectMonthlyWithDayOfMonth(
						getUpdatedEditor(store),
						expectedDayOfMonth
					);
				}, 10000);

				it.each([
					{ dayOfMonth: 1, expectedOrdinal: 1 },
					{ dayOfMonth: 8, expectedOrdinal: 2 },
					{ dayOfMonth: 15, expectedOrdinal: 3 },
					{ dayOfMonth: 22, expectedOrdinal: 4 },
					{ dayOfMonth: 29, expectedOrdinal: -1 } // Last occurrence of the weekday in the month
				])(
					'should save monthly frequency with ordinal position $expectedOrdinal for day $dayOfMonth',
					async ({ dayOfMonth, expectedOrdinal }) => {
						const { store, editor } = createStoreWithEditor();

						// Set the editor's start date to the specific day of month for this test case
						const testDate = new Date(2026, 0, dayOfMonth); // January dayOfMonth, 2026
						const newStartTime = testDate.getTime();

						// Update the editor in the store with the new start date (cannot modify editor object directly)
						store.dispatch({
							type: 'editor/editEditorDate',
							payload: {
								id: editor.id,
								start: newStartTime,
								end: editor.end
							}
						});

						const { user } = setupTest(
							<CustomRecurrenceModal editorId={editor.id} onClose={vi.fn()} />,
							{ store }
						);

						await frequencySelector.select(user, 'month');
						await monthlyOptions.selectOrdinalWeekday(user);
						await modal.confirmCustomization(user);

						const updatedEditor = getUpdatedEditor(store);
						expect(updatedEditor.recur?.add?.rule?.bysetpos?.poslist).toBe(
							expectedOrdinal.toString()
						);
					},
					10000
				);
			});

			it('should save yearly frequency when customized and confirmed', async () => {
				const { store, editor } = createStoreWithEditor();

				const { user } = setupTest(
					<CustomRecurrenceModal editorId={editor.id} onClose={vi.fn()} />,
					{ store }
				);

				await frequencySelector.select(user, 'year');
				await modal.confirmCustomization(user);

				recurrenceAssertions.expectYearly(getUpdatedEditor(store));
			});
		});
	});
});
