/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { screen, within } from '@testing-library/react';
import { FOLDERS, useFolderStore } from '@zextras/carbonio-ui-commons';
import { keyBy } from 'lodash';
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
import { generateRoots } from '@test-utils/folders/roots-generator';
import { getMocksContext } from '@test-utils/utils/mocks-context';
import { TEST_SELECTORS } from 'constants/test-utils';

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

	// CO-3689: copying an appointment out of a delegated calendar used to be confined to the
	// calendars of the account owning it
	it('offers the calendars of every account when copying from a delegated calendar', async () => {
		const OWN_CALENDAR_NAME = 'Personal';
		const DELEGATED_CALENDAR_NAME = 'Delegated calendar';

		const roots = keyBy(generateRoots(), 'id');
		const { identities } = getMocksContext();
		const delegatedAccountRootId = `${identities.sendAs[0].userRootId}:1`;

		const ownCalendar = mockedData.calendars.getCalendar({
			id: '11',
			name: OWN_CALENDAR_NAME,
			parent: FOLDERS.USER_ROOT
		});
		const delegatedCalendar = mockedData.calendars.getCalendar({
			id: `${identities.sendAs[0].userRootId}:200`,
			name: DELEGATED_CALENDAR_NAME,
			perm: 'rwidx',
			l: delegatedAccountRootId,
			parent: delegatedAccountRootId
		});

		useFolderStore.setState(() => ({
			folders: {
				...roots,
				[FOLDERS.USER_ROOT]: { ...roots[FOLDERS.USER_ROOT], children: [ownCalendar] },
				[delegatedAccountRootId]: {
					...roots[delegatedAccountRootId],
					children: [delegatedCalendar]
				},
				[ownCalendar.id]: ownCalendar,
				[delegatedCalendar.id]: delegatedCalendar
			}
		}));

		const store = configureStore({ reducer: combineReducers(reducers) });
		const context: EditorContext = {
			folders: { [delegatedCalendar.id]: delegatedCalendar, [ownCalendar.id]: ownCalendar },
			dispatch: store.dispatch,
			disabled: disabledFields,
			isNew: true,
			calendar: { id: delegatedCalendar.id, name: delegatedCalendar.name }
		};

		const editor = generateEditor({ context });

		const { user } = setupTest(
			<Provider store={store}>
				<EditorCalendarSelector editorId={editor.id} />
			</Provider>
		);

		await user.click(screen.getByText(DELEGATED_CALENDAR_NAME));
		const dropdown = await screen.findByTestId(TEST_SELECTORS.DROPDOWN);
		await user.click(within(dropdown).getByText(OWN_CALENDAR_NAME));

		expect(store.getState().editor.editors[editor.id].calendar).toEqual(
			expect.objectContaining({ id: ownCalendar.id, name: OWN_CALENDAR_NAME })
		);
	});
});
