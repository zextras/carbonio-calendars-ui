/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { configureStore } from '@reduxjs/toolkit';
import { screen } from '@testing-library/react';
import { combineReducers } from 'redux';

import SearchListItem from './search-list-item';
import { PARTICIPATION_STATUS } from '../../constants/api';
import appointmentsSliceReducer from '../../store/slices/appointments-slice';
import { setupTest } from '@test-setup';
import { EventType } from 'types/event';

const baseItem: EventType = {
	title: 'Test Event',
	start: new Date(new Date().setHours(10, 0, 0, 0)),
	end: new Date(new Date().setHours(11, 0, 0, 0)),
	id: 'evt-1',
	resourceId: 'evt-1',
	allDay: false,
	isShared: false,
	haveWriteAccess: true,
	resource: {
		id: 'evt-1',
		inviteId: 'inv-1',
		ridZ: '',
		calendar: {
			id: 'cal-1',
			name: 'cal',
			color: { label: 'red', color: '#ff0000', background: '#fff0f0' }
		},
		flags: 'a',
		iAmOrganizer: true,
		iAmVisitor: false,
		iAmAttendee: false,
		isException: false,
		isPrivate: false,
		status: 'CONF', // or another InviteStatus value
		l: '',
		location: 'Room 1',
		locationUrl: '',
		fragment: '',
		neverSent: false,
		class: 'PRI',
		freeBusy: 'B',
		freeBusyActual: 'B',
		hasChangesNotNotified: false,
		inviteNeverSent: false,
		hasOtherAttendees: false,
		isRecurrent: true,
		participationStatus: PARTICIPATION_STATUS.ACCEPTED,
		organizer: { name: 'Mario Rossi', email: 'mario@rossi.com' },
		start: new Date(new Date().setHours(10, 0, 0, 0)),
		uid: 'uid-1',
		idx: 0,
		changesNotNotified: false,
		hasAlarm: false,
		alarm: false,
		tags: ['tag1'],
		compNum: 0,
		apptStart: 0,
		name: 'Test Event',
		hasException: false,
		isRespRequested: false,
		attachmentFiles: [],
		dur: 3600
	}
};

describe('SearchListItem', () => {
	const mockStore = configureStore({
		reducer: combineReducers({
			appointments: appointmentsSliceReducer
		})
	});

	it('renders organizer Avatar', () => {
		setupTest(<SearchListItem item={baseItem} />, { store: mockStore });
		const avatar = screen.getByTestId('avatarAppointment');
		expect(avatar).toBeVisible();
		expect(avatar).toHaveTextContent('MR');
	});

	it('renders time string', async () => {
		setupTest(<SearchListItem item={baseItem} />, { store: mockStore });
		expect(await screen.findByText(/10:00.*11:00/i)).toBeVisible();
	});

	it('renders attachment icon', () => {
		setupTest(<SearchListItem item={baseItem} />, { store: mockStore });
		expect(screen.getByTestId('icon: AttachOutline')).toBeVisible();
	});

	it('renders lock icon for private event', () => {
		setupTest(<SearchListItem item={baseItem} />, { store: mockStore });
		expect(screen.getByTestId('icon: Lock')).toBeVisible();
	});

	it('renders location', () => {
		setupTest(<SearchListItem item={baseItem} />, { store: mockStore });
		expect(screen.getByText('Room 1')).toBeVisible();
	});

	it('renders tag icon', () => {
		setupTest(<SearchListItem item={baseItem} />, { store: mockStore });
		expect(screen.getByTestId('icon: Tag')).toBeVisible();
	});

	it('renders calendar icon with color', () => {
		setupTest(<SearchListItem item={baseItem} />, { store: mockStore });
		expect(screen.getByTestId('icon: Calendar2')).toBeVisible();
	});

	it('renders event title', () => {
		setupTest(<SearchListItem item={baseItem} />, { store: mockStore });
		expect(screen.getByText('Test Event')).toBeVisible();
	});

	it('renders organizer name in secondary row', () => {
		setupTest(<SearchListItem item={baseItem} />, { store: mockStore });
		expect(screen.getByText(/organized by/)).toBeInTheDocument();
		expect(screen.getByText(/Mario Rossi/)).toBeInTheDocument();
	});

	it('renders appointment icon for accepted status', () => {
		setupTest(<SearchListItem item={baseItem} />, { store: mockStore });
		expect(screen.getByTestId('icon: CheckmarkOutline')).toBeVisible();
	});

	it('renders appointment icon for tentative status', () => {
		const item = {
			...baseItem,
			resource: { ...baseItem.resource, participationStatus: PARTICIPATION_STATUS.TENTATIVE }
		};
		setupTest(<SearchListItem item={item} />, { store: mockStore });
		expect(screen.getByTestId('icon: QuestionMarkOutline')).toBeVisible();
	});

	it('renders appointment icon for declined status', () => {
		const item = {
			...baseItem,
			resource: { ...baseItem.resource, participationStatus: PARTICIPATION_STATUS.DECLINED }
		};
		setupTest(<SearchListItem item={item} />, { store: mockStore });
		expect(screen.getByTestId('icon: CloseOutline')).toBeVisible();
	});

	it('renders recurrent icon', () => {
		setupTest(<SearchListItem item={baseItem} />, { store: mockStore });
		expect(screen.getByTestId('icon: Repeat')).toBeVisible();
	});
});
