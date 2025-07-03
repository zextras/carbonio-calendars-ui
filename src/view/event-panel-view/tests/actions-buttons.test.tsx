/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { act, screen } from '@testing-library/react';
import { noop } from 'lodash';

import { EVENT_ACTIONS } from '../../../constants/event-actions';
import { reducers } from '../../../store/redux';
import mockedData from '../../../test/generators';
import { InstanceActionsItems, SeriesActionsItems } from '../../../types/actions';
import ActionButtons, { EXCLUDED_ACTIONS } from '../actions-buttons';
import { setupTest } from '@test-setup';

const instanceActions: InstanceActionsItems = [
	{
		id: 'move',
		disabled: false,
		icon: 'move',
		label: '',
		tooltipLabel: ''
	},
	{
		id: 'edit',
		disabled: false,
		icon: 'edit',
		label: '',
		tooltipLabel: ''
	},
	{
		id: 'create_copy',
		disabled: false,
		icon: 'copy',
		label: '',
		tooltipLabel: ''
	},
	{
		id: 'forward',
		disabled: false,
		icon: 'forward',
		label: '',
		tooltipLabel: ''
	},
	{
		id: 'email_attendees',
		disabled: false,
		icon: 'email_attendees',
		label: '',
		tooltipLabel: ''
	}
];

const seriesActions: SeriesActionsItems = [
	{
		id: 'instance',
		icon: 'CalendarOutline',
		label: '',
		disabled: false,
		tooltipLabel: '',
		onClick: noop,
		items: instanceActions
	},
	{
		id: 'series',
		icon: 'CalendarOutline',
		label: '',
		disabled: false,
		tooltipLabel: '',
		onClick: noop,
		items: instanceActions.filter((i) => i.id !== EVENT_ACTIONS.EMAIL_ATTEENDEES)
	}
];

describe('actions-buttons instance primary action', () => {
	test('primary instance action for organizer is edit (if available)', () => {
		const store = configureStore({
			reducer: combineReducers(reducers),
			preloadedState: {}
		});

		const event = {
			...mockedData.getEvent(),
			resource: {
				...mockedData.getEvent().resource,
				iAmOrganizer: true
			}
		};

		setupTest(<ActionButtons actions={instanceActions} event={event} />, { store });
		expect(screen.getByTestId('icon: edit')).toBeVisible();
	});

	test('primary instance action for organizer is copy if edit is not available', () => {
		const store = configureStore({
			reducer: combineReducers(reducers),
			preloadedState: {}
		});

		const event = {
			...mockedData.getEvent(),
			resource: {
				...mockedData.getEvent().resource,
				iAmOrganizer: true
			}
		};
		setupTest(
			<ActionButtons
				actions={instanceActions.filter((a) => a.id !== EVENT_ACTIONS.EDIT)}
				event={event}
			/>,
			{ store }
		);
		expect(screen.getByTestId('icon: copy')).toBeVisible();
	});

	test('primary instance action for attendee is edit (if available)', () => {
		const store = configureStore({
			reducer: combineReducers(reducers),
			preloadedState: {}
		});

		const event = {
			...mockedData.getEvent(),
			resource: {
				...mockedData.getEvent().resource,
				iAmOrganizer: false
			}
		};

		setupTest(<ActionButtons actions={instanceActions} event={event} />, { store });
		expect(screen.getByTestId('icon: edit')).toBeVisible();
	});

	test('primary instance action for attendee is move if edit is not available', () => {
		const store = configureStore({
			reducer: combineReducers(reducers),
			preloadedState: {}
		});

		const event = {
			...mockedData.getEvent(),
			resource: {
				...mockedData.getEvent().resource,
				iAmOrganizer: false
			}
		};

		setupTest(
			<ActionButtons
				actions={instanceActions.filter((a) => a.id !== EVENT_ACTIONS.EDIT)}
				event={event}
			/>,
			{ store }
		);
		expect(screen.getByTestId('icon: move')).toBeVisible();
	});

	test('primary instance action for attendee is copy if edit and move are not available', () => {
		const store = configureStore({
			reducer: combineReducers(reducers),
			preloadedState: {}
		});

		const event = {
			...mockedData.getEvent(),
			resource: {
				...mockedData.getEvent().resource,
				iAmOrganizer: false
			}
		};

		setupTest(
			<ActionButtons
				actions={instanceActions.filter(
					(a) => a.id !== EVENT_ACTIONS.EDIT && a.id !== EVENT_ACTIONS.MOVE
				)}
				event={event}
			/>,
			{ store }
		);
		expect(screen.getByTestId('icon: copy')).toBeVisible();
	});

	test('primary instance action for shared is edit (if available)', () => {
		const store = configureStore({
			reducer: combineReducers(reducers),
			preloadedState: {}
		});

		const event = {
			...mockedData.getEvent(),
			isShared: true
		};

		setupTest(<ActionButtons actions={instanceActions} event={event} />, { store });
		expect(screen.getByTestId('icon: edit')).toBeVisible();
	});

	test('primary instance action for shared is copy if edit is not available', () => {
		const store = configureStore({
			reducer: combineReducers(reducers),
			preloadedState: {}
		});

		const event = {
			...mockedData.getEvent(),
			isShared: true
		};

		setupTest(
			<ActionButtons
				actions={instanceActions.filter((a) => a.id !== EVENT_ACTIONS.EDIT)}
				event={event}
			/>,
			{ store }
		);
		expect(screen.getByTestId('icon: copy')).toBeVisible();
	});
});

describe('actions-buttons series primary action', () => {
	test('primary series action for organizer is edit (if available)', () => {
		const store = configureStore({
			reducer: combineReducers(reducers),
			preloadedState: {}
		});

		const event = {
			...mockedData.getEvent(),
			resource: {
				...mockedData.getEvent().resource,
				iAmOrganizer: true
			}
		};

		setupTest(<ActionButtons actions={seriesActions} event={event} />, { store });
		expect(screen.getByTestId('icon: edit')).toBeVisible();
	});

	test('primary series action for organizer is copy if edit is not available', () => {
		const store = configureStore({
			reducer: combineReducers(reducers),
			preloadedState: {}
		});

		const event = {
			...mockedData.getEvent(),
			resource: {
				...mockedData.getEvent().resource,
				iAmOrganizer: true
			}
		};
		const actions = [
			{
				...seriesActions[0],
				items: seriesActions[0].items.filter((a) => a.id !== EVENT_ACTIONS.EDIT)
			},
			{
				...seriesActions[1],
				items: seriesActions[0].items.filter((a) => a.id !== EVENT_ACTIONS.EDIT)
			}
		];
		setupTest(<ActionButtons actions={actions} event={event} />, { store });
		expect(screen.getByTestId('icon: copy')).toBeVisible();
	});

	test('primary series action for attendee is edit (if available)', () => {
		const store = configureStore({
			reducer: combineReducers(reducers),
			preloadedState: {}
		});

		const event = {
			...mockedData.getEvent(),
			resource: {
				...mockedData.getEvent().resource,
				iAmOrganizer: false
			}
		};

		setupTest(<ActionButtons actions={seriesActions} event={event} />, { store });
		expect(screen.getByTestId('icon: edit')).toBeVisible();
	});

	test('primary series action for attendee is move if edit is not available', () => {
		const store = configureStore({
			reducer: combineReducers(reducers),
			preloadedState: {}
		});

		const event = {
			...mockedData.getEvent(),
			resource: {
				...mockedData.getEvent().resource,
				iAmOrganizer: false
			}
		};
		const actions = [
			{
				...seriesActions[0],
				items: seriesActions[0].items.filter((a) => a.id !== EVENT_ACTIONS.EDIT)
			},
			{
				...seriesActions[1],
				items: seriesActions[0].items.filter((a) => a.id !== EVENT_ACTIONS.EDIT)
			}
		];
		setupTest(<ActionButtons actions={actions} event={event} />, { store });
		expect(screen.getByTestId('icon: move')).toBeVisible();
	});

	test('primary series action for shared is edit (if available)', () => {
		const store = configureStore({
			reducer: combineReducers(reducers),
			preloadedState: {}
		});

		const event = {
			...mockedData.getEvent(),
			isShared: true
		};

		setupTest(<ActionButtons actions={seriesActions} event={event} />, { store });
		expect(screen.getByTestId('icon: edit')).toBeVisible();
	});

	test('primary series action for shared is copy if edit is not available', () => {
		const store = configureStore({
			reducer: combineReducers(reducers),
			preloadedState: {}
		});

		const event = {
			...mockedData.getEvent(),
			isShared: true
		};
		const actions = [
			{
				...seriesActions[0],
				items: seriesActions[0].items.filter((a) => a.id !== EVENT_ACTIONS.EDIT)
			},
			{
				...seriesActions[1],
				items: seriesActions[0].items.filter((a) => a.id !== EVENT_ACTIONS.EDIT)
			}
		];
		setupTest(<ActionButtons actions={actions} event={event} />, { store });
		expect(screen.getByTestId('icon: copy')).toBeVisible();
	});
});

describe('actions-buttons secondary action', () => {
	test('secondary action if other attendees is emailAttendees', () => {
		const store = configureStore({
			reducer: combineReducers(reducers),
			preloadedState: {}
		});

		const event = {
			...mockedData.getEvent(),
			resource: {
				...mockedData.getEvent().resource,
				hasOtherAttendees: true
			}
		};

		setupTest(<ActionButtons actions={instanceActions} event={event} />, { store });
		expect(screen.getByTestId('icon: email_attendees')).toBeVisible();
	});

	test('no secondary action if no other attendees', () => {
		const store = configureStore({
			reducer: combineReducers(reducers),
			preloadedState: {}
		});

		const event = {
			...mockedData.getEvent(),
			resource: {
				...mockedData.getEvent().resource,
				hasOtherAttendees: false
			}
		};

		setupTest(<ActionButtons actions={instanceActions} event={event} />, { store });
		expect(screen.queryByTestId('icon: email_attendees')).not.toBeInTheDocument();
	});

	test('no secondary action for series', () => {
		const store = configureStore({
			reducer: combineReducers(reducers),
			preloadedState: {}
		});

		const event = {
			...mockedData.getEvent(),
			resource: {
				...mockedData.getEvent().resource,
				ridZ: undefined,
				hasOtherAttendees: true
			}
		};

		setupTest(<ActionButtons actions={seriesActions} event={event} />, { store });
		expect(screen.queryByTestId('icon: email_attendees')).not.toBeInTheDocument();
	});
});

describe('actions-buttons other actions', () => {
	test('other actions do not include primary action', async () => {
		const store = configureStore({
			reducer: combineReducers(reducers),
			preloadedState: {}
		});

		const event = {
			...mockedData.getEvent(),
			resource: {
				...mockedData.getEvent().resource,
				iAmOrganizer: true
			}
		};

		const { user } = setupTest(<ActionButtons actions={instanceActions} event={event} />, {
			store
		});
		const otherMenu = screen.getByTestId('icon: MoreVertical');
		expect(otherMenu).toBeInTheDocument();
		await act(async () => {
			await user.click(otherMenu);
		});
		expect(screen.queryAllByTestId('icon: email_attendees').length).toBe(1);
		expect(screen.getByTestId('icon: forward')).toBeInTheDocument();
	});

	test('other actions do not include secondary action', async () => {
		const store = configureStore({
			reducer: combineReducers(reducers),
			preloadedState: {}
		});

		const event = {
			...mockedData.getEvent(),
			resource: {
				...mockedData.getEvent().resource,
				hasOtherAttendees: true
			}
		};

		const { user } = setupTest(<ActionButtons actions={instanceActions} event={event} />, {
			store
		});
		const otherMenu = screen.getByTestId('icon: MoreVertical');
		expect(otherMenu).toBeInTheDocument();
		await act(async () => {
			await user.click(otherMenu);
		});
		expect(screen.queryAllByTestId('icon: email_attendees').length).toBe(1);
		expect(screen.getByTestId('icon: forward')).toBeInTheDocument();
	});

	test('other actions exclude some actions', async () => {
		const store = configureStore({
			reducer: combineReducers(reducers),
			preloadedState: {}
		});

		const event = mockedData.getEvent();

		const actions = [
			...instanceActions,
			...EXCLUDED_ACTIONS.map((id) => ({
				id,
				disabled: false,
				icon: id,
				label: '',
				tooltipLabel: ''
			}))
		];

		const { user } = setupTest(<ActionButtons actions={actions} event={event} />, {
			store
		});
		const otherMenu = screen.getByTestId('icon: MoreVertical');
		expect(otherMenu).toBeInTheDocument();
		await act(async () => {
			await user.click(otherMenu);
		});
		expect(screen.queryByTestId(`icon: ${EVENT_ACTIONS.EXPAND}`)).not.toBeInTheDocument();
		expect(screen.queryByTestId(`icon: ${EVENT_ACTIONS.ACCEPT}`)).not.toBeInTheDocument();
		expect(screen.queryByTestId(`icon: ${EVENT_ACTIONS.TENTATIVE}`)).not.toBeInTheDocument();
		expect(screen.queryByTestId(`icon: ${EVENT_ACTIONS.DECLINE}`)).not.toBeInTheDocument();
		expect(screen.queryByTestId(`icon: ${EVENT_ACTIONS.PROPOSE_NEW_TIME}`)).not.toBeInTheDocument();
	});
});
