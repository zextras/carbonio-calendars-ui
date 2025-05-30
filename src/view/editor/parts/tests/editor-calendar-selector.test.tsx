/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { screen } from '@testing-library/react';
import { Provider } from 'react-redux';

import {
	disabledFields,
	EditorContext,
	generateEditor
} from '../../../../commons/editor-generator';
import { reducers } from '../../../../store/redux';
import mockedData from '../../../../test/generators';
import { Editor } from '../../../../types/editor';
import { EditorCalendarSelector } from '../editor-calendar-selector';
import { setupTest } from '@test-setup';

describe('EditorCalendarSelector', () => {
	it('renders null if calendarId is missing', async () => {
		const store = configureStore({ reducer: combineReducers(reducers) });
		const context: EditorContext = {
			folders: {},
			dispatch: store.dispatch,
			disabled: disabledFields
		};

		const editor = generateEditor({ context });

		setupTest(
			<Provider store={store}>
				<EditorCalendarSelector editorId={editor.id} />
			</Provider>
		);

		expect(screen.queryByTestId('calendar-selector')).not.toBeInTheDocument();
	});

	it('renders if calendarId is not missing', async () => {
		const store = configureStore({ reducer: combineReducers(reducers) });
		const context: EditorContext = {
			folders: mockedData.calendars.getCalendarsMap({}),
			dispatch: store.dispatch,
			disabled: disabledFields
		};

		const editor = generateEditor({ context });

		setupTest(
			<Provider store={store}>
				<EditorCalendarSelector editorId={editor.id} />
			</Provider>
		);

		expect(screen.getByTestId('calendar-selector')).toBeInTheDocument();
	});

	it.each([
		// Cases that should return TRUE (draft status)
		[{ draft: true }, true], // explicit draft=true
		[{ isNew: false }, true], // isNew=false means it's a draft
		[{ draft: undefined, isNew: undefined }, true], // both undefined → treated as draft
		[{ isNew: undefined }, true], // isNew undefined → treated as draft

		// Cases that should return FALSE (not draft)
		[{ draft: false }, false], // explicit draft=false
		[{ draft: false, isNew: true }, false], // explicit not draft
		[{ isNew: true }, false], // isNew=true means not draft
		[{}, false] // empty object → should this be draft?
	])(
		'when editor %s, calendar selector must have prop disabled: %j',
		async (editorProps: Partial<Editor>, expectedDisabled: boolean) => {
			const store = configureStore({ reducer: combineReducers(reducers) });

			const context: EditorContext = {
				folders: mockedData.calendars.getCalendarsMap({}),
				dispatch: store.dispatch,
				...editorProps
			};

			const editor = generateEditor({ context });

			setupTest(
				<Provider store={store}>
					<EditorCalendarSelector editorId={editor.id} />
				</Provider>
			);

			const calendarSelector = screen.getByTestId('calendar-selector');
			// eslint-disable-next-line testing-library/no-node-access
			const allChildren = Array.from(calendarSelector.querySelectorAll('*'));

			expect(allChildren.length).toBeGreaterThan(0);

			allChildren.forEach((child) => {
				const ele = child as HTMLElement;
				if (ele.style.cursor) {
					expect(ele).toHaveStyle(expectedDisabled ? 'cursor: no-drop;' : 'cursor: pointer;');
				}
			});
		}
	);
});
