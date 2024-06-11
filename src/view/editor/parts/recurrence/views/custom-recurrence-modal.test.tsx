/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { act, screen, within } from '@testing-library/react';
import { find, values } from 'lodash';

import { CustomRecurrenceModal } from './custom-recurrence-modal';
import { setupTest } from '../../../../../carbonio-ui-commons/test/test-setup';
import { generateEditor } from '../../../../../commons/editor-generator';
import { RADIO_VALUES, RECURRENCE_FREQUENCY } from '../../../../../constants/recurrence';
import { reducers } from '../../../../../store/redux';

jest.setTimeout(10000);

describe('custom recurrence modal', () => {
	test('“daily” selection, “every day” option, “no end date” is selected by default', async () => {
		const store = configureStore({ reducer: combineReducers(reducers) });
		const editor = generateEditor({ context: { dispatch: store.dispatch, folders: {} } });

		setupTest(<CustomRecurrenceModal editorId={editor.id} onClose={jest.fn()} />, {
			store
		});

		const allRatios = screen.getAllByRole('radio');
		const everyDayRadio = find(allRatios, ['value', RADIO_VALUES.EVERYDAY]);
		const noEndDateRadio = find(allRatios, ['value', RADIO_VALUES.NO_END_DATE]);
		const dailySelect = screen.getByText(/daily/i);

		expect(everyDayRadio).toBeChecked();
		expect(noEndDateRadio).toBeChecked();
		expect(dailySelect).toBeVisible();
	});
	test('selecting “weekly” from select will change the default starting point to “every” + “day” selection', async () => {
		const store = configureStore({ reducer: combineReducers(reducers) });
		const editor = generateEditor({ context: { dispatch: store.dispatch, folders: {} } });

		const { user } = setupTest(<CustomRecurrenceModal editorId={editor.id} onClose={jest.fn()} />, {
			store
		});

		await act(async () => {
			await user.click(screen.getByText(/daily/i));
		});
		await act(async () => {
			await user.click(screen.getByText(/weekly/i));
		});

		const allRatios = screen.getAllByRole('radio');
		const everyDayRadio = find(allRatios, ['value', RADIO_VALUES.QUICK_OPTIONS]);
		const daySelectOption = screen.getByText(/label.day/i);

		await act(async () => {
			await user.click(screen.getByText(/label.day/i));
		});
		await act(async () => {
			await user.click(screen.getByText(/weekend day/i));
		});

		expect(everyDayRadio).toBeChecked();
		expect(daySelectOption).toBeVisible();
	});
	test('selecting “monthly” from select will change the default starting point to “day”(text) + “day”(input) + “every”(text) + “months”(input)', async () => {
		const store = configureStore({ reducer: combineReducers(reducers) });
		const editor = generateEditor({ context: { dispatch: store.dispatch, folders: {} } });

		const { user } = setupTest(<CustomRecurrenceModal editorId={editor.id} onClose={jest.fn()} />, {
			store
		});

		await act(async () => {
			await user.click(screen.getByText(/daily/i));
		});
		await act(async () => {
			await user.click(screen.getByText(/monthly/i));
		});

		const allRatios = screen.getAllByRole('radio');
		const dayRadio = find(allRatios, ['value', RADIO_VALUES.DAY_OF_MONTH]);
		const dayInputOption = within(screen.getByTestId('montly_day_input')).getByRole('textbox');
		const everyMonthsInputOption = screen.getByRole('textbox', { name: /months/i });

		expect(dayRadio).toBeChecked();
		expect(dayInputOption).toHaveValue('1');
		expect(everyMonthsInputOption).toHaveValue('1');
	});
	test('selecting “yearly” from select will change the default starting point to “every day on”(text) + “day”(input) + “of”(text) + “month”(select)', async () => {
		const store = configureStore({ reducer: combineReducers(reducers) });
		const editor = generateEditor({ context: { dispatch: store.dispatch, folders: {} } });

		const { user } = setupTest(<CustomRecurrenceModal editorId={editor.id} onClose={jest.fn()} />, {
			store
		});

		await act(async () => {
			await user.click(screen.getByText(/daily/i));
		});
		await act(async () => {
			await user.click(screen.getByText(/yearly/i));
		});

		const allRatios = screen.getAllByRole('radio');
		const everyYearOnRadio = find(allRatios, ['value', RADIO_VALUES.EVERY_YEAR_ON_MONTH_DAY]);
		const dayInputOption = within(screen.getByTestId('every_yearly_day_input')).getByRole(
			'textbox'
		);
		const monthsInputOption = within(screen.getByTestId('every_yearly_month_input')).getByText(
			/january/i
		);

		expect(everyYearOnRadio).toBeChecked();
		expect(dayInputOption).toHaveValue('1');
		expect(monthsInputOption).toBeInTheDocument();
	});
});

describe('On modal confirmation, the editor should have the selected values', () => {
	test('daily option default customization', async () => {
		const store = configureStore({ reducer: combineReducers(reducers) });
		const editor = generateEditor({ context: { dispatch: store.dispatch, folders: {} } });

		const { user } = setupTest(<CustomRecurrenceModal editorId={editor.id} onClose={jest.fn()} />, {
			store
		});

		await act(async () => {
			await user.click(screen.getByText(/customize/i));
		});

		const updatedEditor = values(store.getState().editor.editors)[0];

		expect(updatedEditor.recur).toStrictEqual({
			add: { rule: { freq: RECURRENCE_FREQUENCY.DAILY } }
		});
	});
	test('weekly option default customization', async () => {
		const store = configureStore({ reducer: combineReducers(reducers) });
		const editor = generateEditor({ context: { dispatch: store.dispatch, folders: {} } });

		const { user } = setupTest(<CustomRecurrenceModal editorId={editor.id} onClose={jest.fn()} />, {
			store
		});

		await act(async () => {
			await user.click(screen.getByText(/daily/i));
		});
		await act(async () => {
			await user.click(screen.getByText(/weekly/i));
		});

		await act(async () => {
			await user.click(screen.getByText(/customize/i));
		});

		const updatedEditor = values(store.getState().editor.editors)[0];

		expect(updatedEditor.recur).toStrictEqual({
			add: { rule: { freq: RECURRENCE_FREQUENCY.WEEKLY } }
		});
	});
	test('monthly option default customization', async () => {
		const store = configureStore({ reducer: combineReducers(reducers) });
		const editor = generateEditor({ context: { dispatch: store.dispatch, folders: {} } });

		const { user } = setupTest(<CustomRecurrenceModal editorId={editor.id} onClose={jest.fn()} />, {
			store
		});

		await act(async () => {
			await user.click(screen.getByText(/daily/i));
		});
		await act(async () => {
			await user.click(screen.getByText(/monthly/i));
		});

		await act(async () => {
			await user.click(screen.getByText(/customize/i));
		});

		const updatedEditor = values(store.getState().editor.editors)[0];

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
	test('yearly option default customization', async () => {
		const store = configureStore({ reducer: combineReducers(reducers) });
		const editor = generateEditor({ context: { dispatch: store.dispatch, folders: {} } });

		const { user } = setupTest(<CustomRecurrenceModal editorId={editor.id} onClose={jest.fn()} />, {
			store
		});

		await act(async () => {
			await user.click(screen.getByText(/daily/i));
		});
		await act(async () => {
			await user.click(screen.getByText(/yearly/i));
		});
		await act(async () => {
			await user.click(screen.getByText(/customize/i));
		});

		const updatedEditor = values(store.getState().editor.editors)[0];

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
