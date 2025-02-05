/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { screen } from '@testing-library/react';

import { setupTest } from '../../../carbonio-ui-commons/test/test-setup';
import { EVENT_ACTIONS } from '../../../constants/event-actions';
import { reducers } from '../../../store/redux';
import mockedData from '../../../test/generators';
import ActionButtons, { ActionItems } from '../actions-buttons';

const actions: ActionItems = [
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

describe('actions-buttons', () => {
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

		setupTest(<ActionButtons actions={actions} event={event} />, { store });
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
			<ActionButtons actions={actions.filter((a) => a.id !== EVENT_ACTIONS.EDIT)} event={event} />,
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

		setupTest(<ActionButtons actions={actions} event={event} />, { store });
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
			<ActionButtons actions={actions.filter((a) => a.id !== EVENT_ACTIONS.EDIT)} event={event} />,
			{ store }
		);
		expect(screen.getByTestId('icon: move')).toBeVisible();
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

		setupTest(<ActionButtons actions={actions} event={event} />, { store });
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
			<ActionButtons actions={actions.filter((a) => a.id !== EVENT_ACTIONS.EDIT)} event={event} />,
			{ store }
		);
		expect(screen.getByTestId('icon: copy')).toBeVisible();
	});
});
