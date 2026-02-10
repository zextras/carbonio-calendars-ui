/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { screen, within } from '@testing-library/react';
import { UserEvent } from '@testing-library/user-event';
import { find, values } from 'lodash';

import { CustomRecurrenceModal } from './custom-recurrence-modal';
import { setupTest } from '@test-setup';
import { generateEditor } from 'commons/editor-generator';
import { RADIO_VALUES, RECURRENCE_FREQUENCY } from 'constants/recurrence';
import { reducers } from 'store/redux';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const createStoreWithEditor = (): {
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
	frequency: 'daily' | 'weekly' | 'monthly' | 'yearly'
): Promise<void> => {
	const frequencyDisplayMap: Record<string, string> = {
		daily: 'Daily',
		weekly: 'Weekly',
		monthly: 'Monthly',
		yearly: 'Yearly'
	};

	// Find the current displayed frequency text (Daily, Weekly, Monthly, or Yearly)
	const currentFrequency = screen.getByText(/^(Daily|Weekly|Monthly|Yearly)$/);
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

describe('CustomRecurrenceModal', () => {
	describe('UI Elements', () => {
		it('should render the modal with the correct title', () => {
			const { store, editor } = createStoreWithEditor();

			setupTest(<CustomRecurrenceModal editorId={editor.id} onClose={vi.fn()} />, {
				store
			});

			const title = screen.getByText('label.custom_repeat');
			expect(title).toBeInTheDocument();
		});

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
	});

	describe('Default States by Frequency', () => {
		it('should have "daily" frequency with "every day" option and "no end date" selected by default', () => {
			const { store, editor } = createStoreWithEditor();

			setupTest(<CustomRecurrenceModal editorId={editor.id} onClose={vi.fn()} />, {
				store
			});

			const allRadios = screen.getAllByRole('radio');
			const everyDayRadio = find(allRadios, ['value', RADIO_VALUES.EVERYDAY]);
			const noEndDateRadio = find(allRadios, ['value', RADIO_VALUES.NO_END_DATE]);
			const dailySelect = screen.getByText('Daily');

			expect(everyDayRadio).toBeChecked();
			expect(noEndDateRadio).toBeChecked();
			expect(dailySelect).toBeVisible();
		});

		it('should show "every" + "day" options when "weekly" is selected', async () => {
			const { store, editor } = createStoreWithEditor();

			const { user } = setupTest(<CustomRecurrenceModal editorId={editor.id} onClose={vi.fn()} />, {
				store
			});

			await selectFrequency(user, 'weekly');

			const allRadios = screen.getAllByRole('radio');
			const everyDayRadio = find(allRadios, ['value', RADIO_VALUES.QUICK_OPTIONS]);
			const daySelectOption = screen.getByText('Day');

			await user.click(screen.getByText('Day'));
			await user.click(screen.getByText('Weekend day'));

			expect(everyDayRadio).toBeChecked();
			expect(daySelectOption).toBeVisible();
		});

		it('should show "day" + "months" options when "monthly" is selected', async () => {
			const { store, editor } = createStoreWithEditor();

			const { user } = setupTest(<CustomRecurrenceModal editorId={editor.id} onClose={vi.fn()} />, {
				store
			});

			await selectFrequency(user, 'monthly');

			const allRadios = screen.getAllByRole('radio');
			const dayRadio = find(allRadios, ['value', RADIO_VALUES.DAY_OF_MONTH]);
			const dayInputOption = within(screen.getByTestId('montly_day_input')).getByRole('textbox');
			const everyMonthsInputOption = screen.getByRole('textbox', { name: 'label.months' });

			expect(dayRadio).toBeChecked();
			expect(dayInputOption).toHaveValue('1');
			expect(everyMonthsInputOption).toHaveValue('1');
		});

		it('should show "day" + "month" options when "yearly" is selected', async () => {
			const { store, editor } = createStoreWithEditor();

			const { user } = setupTest(<CustomRecurrenceModal editorId={editor.id} onClose={vi.fn()} />, {
				store
			});

			await selectFrequency(user, 'yearly');

			const allRadios = screen.getAllByRole('radio');
			const everyYearOnRadio = find(allRadios, ['value', RADIO_VALUES.EVERY_YEAR_ON_MONTH_DAY]);
			const dayInputOption = within(screen.getByTestId('every_yearly_day_input')).getByRole(
				'textbox'
			);
			const monthsInputOption = within(screen.getByTestId('every_yearly_month_input')).getByText(
				'January'
			);

			expect(everyYearOnRadio).toBeChecked();
			expect(dayInputOption).toHaveValue('1');
			expect(monthsInputOption).toBeInTheDocument();
		});
	});

	describe('Confirmation and State Persistence', () => {
		it('should save daily frequency when customized and confirmed', async () => {
			const { store, editor } = createStoreWithEditor();

			const { user } = setupTest(<CustomRecurrenceModal editorId={editor.id} onClose={vi.fn()} />, {
				store
			});

			await clickCustomizeButton(user);

			const updatedEditor = getUpdatedEditor(store);

			expect(updatedEditor.recur).toStrictEqual({
				add: { rule: { freq: RECURRENCE_FREQUENCY.DAILY } }
			});
		});

		it('should save weekly frequency when customized and confirmed', async () => {
			const { store, editor } = createStoreWithEditor();

			const { user } = setupTest(<CustomRecurrenceModal editorId={editor.id} onClose={vi.fn()} />, {
				store
			});

			await selectFrequency(user, 'weekly');
			await clickCustomizeButton(user);

			const updatedEditor = getUpdatedEditor(store);

			expect(updatedEditor.recur).toStrictEqual({
				add: { rule: { freq: RECURRENCE_FREQUENCY.WEEKLY } }
			});
		});

		it('should save monthly frequency with day and interval when customized and confirmed', async () => {
			const { store, editor } = createStoreWithEditor();

			const { user } = setupTest(<CustomRecurrenceModal editorId={editor.id} onClose={vi.fn()} />, {
				store
			});

			await selectFrequency(user, 'monthly');
			await clickCustomizeButton(user);

			const updatedEditor = getUpdatedEditor(store);

			expect(updatedEditor.recur).toStrictEqual({
				add: {
					rule: {
						bymonthday: {
							modaylist: 1
						},
						freq: 'MON',
						interval: {
							ival: 1
						}
					}
				}
			});
		});

		it('should save yearly frequency with month and day when customized and confirmed', async () => {
			const { store, editor } = createStoreWithEditor();

			const { user } = setupTest(<CustomRecurrenceModal editorId={editor.id} onClose={vi.fn()} />, {
				store
			});

			await selectFrequency(user, 'yearly');
			await clickCustomizeButton(user);

			const updatedEditor = getUpdatedEditor(store);

			expect(updatedEditor.recur).toStrictEqual({
				add: {
					rule: {
						bymonth: {
							molist: '1'
						},
						bymonthday: {
							modaylist: 1
						},
						freq: 'YEA'
					}
				}
			});
		});
	});
});
