/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
	moveAppointmentToTrashFulfilled,
	moveAppointmentToTrashPending,
	moveAppointmentToTrashRejected
} from '../move-appointment-to-trash';
import { AppointmentsSlice, InvitesSlice } from '../../../types/store/store';
import mockedData from '../../../test/generators';

const makeAppointmentsState = (overrides?: Partial<AppointmentsSlice>): AppointmentsSlice => ({
	status: 'idle',
	appointments: {},
	...overrides
});

const makeInvitesState = (overrides?: Partial<InvitesSlice>): InvitesSlice => ({
	status: 'idle',
	invites: {},
	...overrides
});

describe('moveAppointmentToTrashPending', () => {
	it('saves previousState and filters out the target instance when deleteSingleInstance is true', () => {
		const appointment = mockedData.getAppointment();
		const { id, inst } = appointment;
		const { ridZ } = inst[0];

		const state = makeAppointmentsState({ appointments: { [id]: appointment } });
		const action = {
			meta: { arg: { id, ridZ, deleteSingleInstance: true } }
		} as any;

		moveAppointmentToTrashPending(state, action);

		expect(state.status).toBe('pending');
		expect(action.meta.arg.previousState).toBeDefined();
		expect(state.appointments[id].inst).not.toContainEqual(expect.objectContaining({ ridZ }));
	});

	it('sets appointment folder to trash when deleteSingleInstance is false', () => {
		const appointment = mockedData.getAppointment();
		const { id } = appointment;

		const state = makeAppointmentsState({ appointments: { [id]: appointment } });
		const action = {
			meta: { arg: { id, ridZ: undefined, deleteSingleInstance: false } }
		} as any;

		moveAppointmentToTrashPending(state, action);

		expect(state.status).toBe('pending');
		expect(state.appointments[id].l).toBe('3');
	});
});

describe('moveAppointmentToTrashFulfilled', () => {
	it('removes invite from invitesSlice when deleteSingleInstance is false', () => {
		const invite = mockedData.getInvite();
		const state = makeInvitesState({ invites: { 'inv-1': invite } });
		const action = {
			payload: {},
			meta: {
				arg: {
					inviteId: 'inv-1',
					ridZ: undefined,
					deleteSingleInstance: false,
					isRecurrent: false,
					id: 'appt-1'
				}
			}
		} as any;

		moveAppointmentToTrashFulfilled(state, action);

		expect((state as InvitesSlice).invites['inv-1']).toBeUndefined();
	});

	it('keeps invite in invitesSlice when deleteSingleInstance is true', () => {
		const invite = mockedData.getInvite();
		const state = makeInvitesState({ invites: { 'inv-1': invite } });
		const action = {
			payload: {},
			meta: {
				arg: {
					inviteId: 'inv-1',
					ridZ: undefined,
					deleteSingleInstance: true,
					isRecurrent: false,
					id: 'appt-1'
				}
			}
		} as any;

		moveAppointmentToTrashFulfilled(state, action);

		expect((state as InvitesSlice).invites['inv-1']).toBeDefined();
	});

	it('filters the matching instance from appointmentsSlice when isRecurrent is true', () => {
		const appointment = mockedData.getAppointment();
		const { id, inst } = appointment;
		const { ridZ } = inst[0];

		const state = makeAppointmentsState({ appointments: { [id]: appointment } });
		const action = {
			payload: {},
			meta: {
				arg: {
					inviteId: 'inv-1',
					ridZ,
					deleteSingleInstance: true,
					isRecurrent: true,
					id
				}
			}
		} as any;

		moveAppointmentToTrashFulfilled(state, action);

		expect(state.appointments[id].inst).not.toContainEqual(expect.objectContaining({ ridZ }));
	});

	it('does not filter instances from appointmentsSlice when isRecurrent is false', () => {
		const appointment = mockedData.getAppointment();
		const { id, inst } = appointment;
		const originalCount = inst.length;

		const state = makeAppointmentsState({ appointments: { [id]: appointment } });
		const action = {
			payload: {},
			meta: {
				arg: {
					inviteId: 'inv-1',
					ridZ: 'non-matching-ridz',
					deleteSingleInstance: true,
					isRecurrent: false,
					id
				}
			}
		} as any;

		moveAppointmentToTrashFulfilled(state, action);

		expect(state.appointments[id].inst).toHaveLength(originalCount);
	});
});

describe('moveAppointmentToTrashRejected', () => {
	it('restores previousState and sets status to error when previousState exists', () => {
		const appointment = mockedData.getAppointment();
		const { id } = appointment;
		const previousState = { [id]: appointment };

		const state = makeAppointmentsState({ appointments: {} });
		const action = {
			meta: { arg: { id, previousState } }
		} as any;

		moveAppointmentToTrashRejected(state, action);

		expect(state.appointments).toEqual(previousState);
		expect(state.status).toBe('error');
	});

	it('does not modify state when previousState is absent', () => {
		const state = makeAppointmentsState({ status: 'pending', appointments: {} });
		const action = {
			meta: { arg: { id: 'appt-1' } }
		} as any;

		moveAppointmentToTrashRejected(state, action);

		expect(state.status).toBe('pending');
		expect(state.appointments).toEqual({});
	});
});
