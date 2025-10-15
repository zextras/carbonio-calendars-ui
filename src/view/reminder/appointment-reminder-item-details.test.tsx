/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { faker } from '@faker-js/faker';
import { combineReducers, configureStore } from '@reduxjs/toolkit';

import { AppointmentReminderItemDetails } from './appointment-reminder-item-details';
import { CALENDAR_RESOURCES } from '../../constants';
import { PARTICIPANT_ROLE, PARTICIPATION_STATUS } from '../../constants/api';
import { TEST_SELECTORS } from '../../constants/test-utils';
import { CRB_XPARAMS, CRB_XPROPS } from '../../constants/xprops';
import { reducers } from '../../store/redux';
import mockedData from '../../test/generators';
import generateAppointment from '../../test/generators/appointment';
import generateInvite from '../../test/generators/invite';
import { generateReminderItem } from '../../test/generators/reminder';
import { Appointment } from '../../types/store/appointments';
import { Attendee, Invite } from '../../types/store/invite';
import { AppointmentsSlice, InvitesSlice } from '../../types/store/store';
import { setupTest, screen } from '@test-setup';

const initializeMockedStore = ({
	invite,
	appointment
}: {
	invite?: Invite;
	appointment?: Appointment;
}): ReturnType<typeof configureStore> => {
	const mockedInviteSlice: Partial<InvitesSlice> = {
		invites: invite ? { [invite.id]: invite } : {}
	};

	const mockedAppointmentSlice: Partial<AppointmentsSlice> = {
		appointments: appointment ? { [appointment.id]: appointment } : {}
	};

	const mockedStore = mockedData.store.mockReduxStore({
		invites: mockedInviteSlice,
		appointments: mockedAppointmentSlice
	});

	return configureStore({
		reducer: combineReducers(reducers),
		preloadedState: mockedStore
	});
};

describe('Appointment Reminder Item Details', () => {
	it('should display the shimmer components if the invite is not available', () => {
		const reminderItem = generateReminderItem();
		const store = configureStore({ reducer: combineReducers(reducers) });

		setupTest(<AppointmentReminderItemDetails reminderItem={reminderItem} />, { store });

		expect(
			screen.getAllByTestId(/appointment-reminder-item-details-shimmer-row-\d+/).length
		).toBeGreaterThan(0);
	});

	it('should not display a shimmer component if the invite is available', () => {
		const inviteId = faker.string.uuid();
		const invite = generateInvite({ context: { id: inviteId } });
		const appointment = generateAppointment({ appointment: { inviteId } });
		const reminderItem = generateReminderItem({ inviteId, id: appointment.id });

		const store = initializeMockedStore({ invite, appointment });

		setupTest(<AppointmentReminderItemDetails reminderItem={reminderItem} />, { store });

		expect(
			screen.queryAllByTestId(/appointment-reminder-item-details-shimmer-row-\d+/).length
		).toBe(0);
	});

	describe('details', () => {
		it('should render the location fields if it set in the appointment', () => {
			const location = faker.internet.url();
			const inviteId = faker.string.uuid();
			const invite = generateInvite({
				context: { id: inviteId, location, locationUrl: location }
			});
			const appointment = generateAppointment({ appointment: { inviteId, loc: location } });
			const reminderItem = generateReminderItem({ inviteId, id: appointment.id });

			const store = initializeMockedStore({ invite, appointment });

			setupTest(<AppointmentReminderItemDetails reminderItem={reminderItem} />, { store });

			expect(screen.getByText(location)).toBeVisible();
			expect(screen.getByTestId('icon: PinOutline')).toBeVisible();
		});

		it("shouldn't render the location fields if it's not set in the appointment", () => {
			const location = '';
			const inviteId = faker.string.uuid();
			const invite = generateInvite({
				context: { id: inviteId, location, locationUrl: location }
			});
			const appointment = generateAppointment({ appointment: { inviteId, loc: location } });
			const reminderItem = generateReminderItem({ inviteId, id: appointment.id });

			const store = initializeMockedStore({ invite, appointment });

			setupTest(<AppointmentReminderItemDetails reminderItem={reminderItem} />, { store });

			expect(screen.queryByTestId('icon: PinOutline')).not.toBeInTheDocument();
		});

		it('should render the meeting room if set in the invite', () => {
			const inviteId = faker.string.uuid();
			const invite = generateInvite({
				context: { id: inviteId }
			});

			const meetingRoomName = faker.word.noun();
			const meetingRoomEmail = faker.internet.email({ firstName: meetingRoomName });
			invite.attendees = [
				...(invite.attendees ?? []),
				{
					d: meetingRoomName,
					a: meetingRoomEmail,
					url: '',
					rsvp: true,
					ptst: PARTICIPATION_STATUS.ACCEPTED,
					cutype: CALENDAR_RESOURCES.ROOM,
					role: PARTICIPANT_ROLE.REQUIRED
				} satisfies Attendee
			];

			const appointment = generateAppointment({ appointment: { inviteId } });
			const reminderItem = generateReminderItem({ inviteId, id: appointment.id });

			const store = initializeMockedStore({ invite, appointment });

			setupTest(<AppointmentReminderItemDetails reminderItem={reminderItem} />, { store });

			expect(screen.getByText(meetingRoomName)).toBeVisible();
			expect(screen.getByTestId('icon: BuildingOutline')).toBeVisible();
		});

		it("shouldn't render the meeting room if it's not set in the invite", () => {
			const inviteId = faker.string.uuid();
			const invite = generateInvite({
				context: { id: inviteId }
			});

			const appointment = generateAppointment({ appointment: { inviteId } });
			const reminderItem = generateReminderItem({ inviteId, id: appointment.id });

			const store = initializeMockedStore({ invite, appointment });

			setupTest(<AppointmentReminderItemDetails reminderItem={reminderItem} />, { store });

			expect(screen.queryByTestId('icon: BuildingOutline')).not.toBeInTheDocument();
		});

		it('should render the equipment if set in the invite', () => {
			const inviteId = faker.string.uuid();
			const invite = generateInvite({
				context: { id: inviteId }
			});

			const equipmentName = faker.word.noun();
			const equipmentEmail = faker.internet.email({ firstName: equipmentName });
			invite.attendees = [
				...(invite.attendees ?? []),
				{
					d: equipmentName,
					a: equipmentEmail,
					url: '',
					rsvp: true,
					ptst: PARTICIPATION_STATUS.ACCEPTED,
					cutype: CALENDAR_RESOURCES.RESOURCE,
					role: PARTICIPANT_ROLE.REQUIRED
				} satisfies Attendee
			];

			const appointment = generateAppointment({ appointment: { inviteId } });
			const reminderItem = generateReminderItem({ inviteId, id: appointment.id });

			const store = initializeMockedStore({ invite, appointment });

			setupTest(<AppointmentReminderItemDetails reminderItem={reminderItem} />, { store });

			expect(screen.getByText(equipmentName)).toBeVisible();
			expect(screen.getByTestId('icon: BriefcaseOutline')).toBeVisible();
		});

		it("shouldn't render the equipment if it's not set in the invite", () => {
			const inviteId = faker.string.uuid();
			const invite = generateInvite({
				context: { id: inviteId }
			});

			const appointment = generateAppointment({ appointment: { inviteId } });
			const reminderItem = generateReminderItem({ inviteId, id: appointment.id });

			const store = initializeMockedStore({ invite, appointment });

			setupTest(<AppointmentReminderItemDetails reminderItem={reminderItem} />, { store });

			expect(screen.queryByTestId('icon: BriefcaseOutline')).not.toBeInTheDocument();
		});

		it('should render the virtual room if set in the invite', () => {
			const inviteId = faker.string.uuid();
			const roomName = faker.word.noun();
			const roomLink = faker.internet.url();
			const invite = generateInvite({
				context: { id: inviteId }
			});

			invite.xprop = [
				{
					name: CRB_XPROPS.MEETING_ROOM,
					value: 'MEETING_ROOM',
					xparam: [
						{ name: CRB_XPARAMS.ROOM_NAME, value: roomName },
						{ name: CRB_XPARAMS.ROOM_LINK, value: roomLink }
					]
				}
			];

			const appointment = generateAppointment({ appointment: { inviteId } });
			const reminderItem = generateReminderItem({ inviteId, id: appointment.id });

			const store = initializeMockedStore({ invite, appointment });

			setupTest(<AppointmentReminderItemDetails reminderItem={reminderItem} />, { store });

			expect(screen.getByText(roomName)).toBeVisible();
			expect(screen.getByTestId('icon: VideoOutline')).toBeVisible();
		});

		it("shouldn't render the virtual room if it's not set in the invite", () => {
			const inviteId = faker.string.uuid();
			const invite = generateInvite({
				context: { id: inviteId }
			});

			const appointment = generateAppointment({ appointment: { inviteId } });
			const reminderItem = generateReminderItem({ inviteId, id: appointment.id });

			const store = initializeMockedStore({ invite, appointment });

			setupTest(<AppointmentReminderItemDetails reminderItem={reminderItem} />, { store });

			expect(screen.queryByTestId('icon: VideoOutline')).not.toBeInTheDocument();
		});

		it('should render the organizer if set in the invite', () => {
			const inviteId = faker.string.uuid();
			const invite = generateInvite({
				context: { id: inviteId }
			});

			const appointment = generateAppointment({ appointment: { inviteId } });
			const reminderItem = generateReminderItem({ inviteId, id: appointment.id });

			const store = initializeMockedStore({ invite, appointment });

			setupTest(<AppointmentReminderItemDetails reminderItem={reminderItem} />, { store });

			expect(screen.getByText(invite.organizer.d)).toBeVisible();
		});

		it("shouldn't render the organizer if it's not set in the invite", () => {
			const inviteId = faker.string.uuid();
			const invite = generateInvite({
				context: { id: inviteId }
			});
			// The organizer actually can be undefined as it was proved in production.
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			invite.organizer = undefined;

			const appointment = generateAppointment({ appointment: { inviteId } });
			const reminderItem = generateReminderItem({ inviteId, id: appointment.id });

			const store = initializeMockedStore({ invite, appointment });

			setupTest(<AppointmentReminderItemDetails reminderItem={reminderItem} />, { store });

			expect(screen.queryByTestId(TEST_SELECTORS.AVATAR_WRAPPER)).not.toBeInTheDocument();
		});

		it('should render the description if set in the invite', () => {
			const inviteId = faker.string.uuid();
			const description = faker.lorem.paragraph();
			const invite = generateInvite({
				context: {
					id: inviteId,
					fragment: description.substring(0, 100),
					textDescription: [{ _content: description }]
				}
			});

			const appointment = generateAppointment({ appointment: { inviteId } });
			const reminderItem = generateReminderItem({ inviteId, id: appointment.id });

			const store = initializeMockedStore({ invite, appointment });

			setupTest(<AppointmentReminderItemDetails reminderItem={reminderItem} />, { store });

			expect(screen.getByText(description)).toBeVisible();
			expect(screen.getByTestId('icon: MessageSquareOutline')).toBeVisible();
		});

		it('shouldn render empty description placeholder if it is not set in the invite', () => {
			const inviteId = faker.string.uuid();
			const invite = generateInvite({
				context: { id: inviteId }
			});

			const appointment = generateAppointment({ appointment: { inviteId } });
			const reminderItem = generateReminderItem({ inviteId, id: appointment.id });

			const store = initializeMockedStore({ invite, appointment });

			setupTest(<AppointmentReminderItemDetails reminderItem={reminderItem} />, { store });

			expect(screen.getByTestId('icon: MessageSquareOutline')).toBeInTheDocument();
			expect(screen.getByText('(message.invite_has_no_message.)')).toBeVisible();
		});
	});
});
