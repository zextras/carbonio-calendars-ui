/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { combineReducers, configureStore, type EnhancedStore } from '@reduxjs/toolkit';
import { screen, waitFor, within } from '@testing-library/react';
import { JSNS } from '@zextras/carbonio-shell-ui';

import { generateEditor } from '../../../commons/editor-generator';
import { reducers, type RootState } from '../../../store/redux';
import { editEditorDate } from '../../../store/slices/editor-slice';
import { generateSoapErrorResponseBody } from '../../../test/generators/utils';
import { defaultEditor } from '../../editor/tests/common';
import { formatOriginalDateRange, ProposeNewTimeModal } from '../propose-new-time-modal';
import { setupTest, screen as customScreen } from '@test-setup';
import { createSoapAPIInterceptor } from '@test-utils/network/msw/create-api-interceptor';

const ORGANIZER_EMAIL = 'organizer@example.com';
const EVENT_TITLE = 'Quarterly planning';
const MODAL_TEST_ID = 'propose-new-time-modal';
const CARD_TEST_ID = 'propose-new-time-read-only-card';
const SEND_PROPOSAL_BTN = /Send proposal/i;
const CANCEL_BTN = /^Cancel$/i;
const RECIPIENT_HINT = 'Only the organizer of this appointment will receive your proposal.';

const ORIGINAL_START = 1667834497505;
const ORIGINAL_END = ORIGINAL_START + 60 * 60 * 1000;

type CounterAppointmentRequest = {
	id?: string;
	comp: number;
	m: {
		inv: {
			comp: Array<{
				name: string;
				s: { d: string; tz: string };
				e: { d: string; tz: string };
				or: { a: string };
			}>;
		};
		su: string;
	};
};

describe('formatOriginalDateRange', () => {
	const TIMEZONE = 'Europe/Berlin';

	it('formats a same-day slot as date, start time and end time', () => {
		expect(
			formatOriginalDateRange({
				start: ORIGINAL_START,
				end: ORIGINAL_END,
				timezone: TIMEZONE
			})
		).toBe('11/07/2022, 4:21 PM - 5:21 PM');
	});

	it('formats a multi-day slot with both full dates and times', () => {
		expect(
			formatOriginalDateRange({
				start: ORIGINAL_START,
				end: ORIGINAL_END + 24 * 60 * 60 * 1000,
				timezone: TIMEZONE
			})
		).toBe('11/07/2022, 4:21 PM - 11/08/2022, 5:21 PM');
	});

	it('formats a single all-day appointment with only its date', () => {
		expect(
			formatOriginalDateRange({
				start: ORIGINAL_START,
				end: ORIGINAL_END,
				allDay: true,
				timezone: TIMEZONE
			})
		).toBe('11/07/2022');
	});

	it('formats a multi-day all-day appointment with both dates', () => {
		expect(
			formatOriginalDateRange({
				start: ORIGINAL_START,
				end: ORIGINAL_END + 2 * 24 * 60 * 60 * 1000,
				allDay: true,
				timezone: TIMEZONE
			})
		).toBe('11/07/2022 - 11/09/2022');
	});
});

describe('ProposeNewTimeModal', () => {
	const createTestStore = (): EnhancedStore<RootState> =>
		configureStore({ reducer: combineReducers(reducers) });

	const createProposeEditor = (store: EnhancedStore<RootState>): void => {
		generateEditor({
			context: {
				folders: {},
				dispatch: store.dispatch,
				...defaultEditor,
				isNew: false,
				isProposeNewTime: true,
				title: EVENT_TITLE,
				originalStart: ORIGINAL_START,
				originalEnd: ORIGINAL_END,
				start: ORIGINAL_START,
				end: ORIGINAL_END,
				inviteId: '123-456',
				uid: 'uid-1',
				organizer: { email: ORGANIZER_EMAIL, fullName: 'Organizer' },
				attendees: [{ email: ORGANIZER_EMAIL }]
			}
		});
	};

	const renderModal = (
		store: EnhancedStore<RootState>,
		onClose = vi.fn()
	): ReturnType<typeof setupTest> =>
		setupTest(<ProposeNewTimeModal editorId={defaultEditor.id} onClose={onClose} />, { store });

	describe('rendering and closing', () => {
		let store: EnhancedStore<RootState>;

		beforeEach(() => {
			store = createTestStore();
			createProposeEditor(store);
		});

		it('renders the read-only appointment summary cards', () => {
			renderModal(store);
			const modal = screen.getByTestId(MODAL_TEST_ID);
			expect(within(modal).getByText('Propose new time')).toBeVisible();
			const cards = screen.getAllByTestId(CARD_TEST_ID);
			expect(cards).toHaveLength(2);
			expect(within(cards[0]).getByText('Event title')).toBeVisible();
			expect(within(cards[0]).getByText(EVENT_TITLE)).toBeVisible();
			expect(within(cards[1]).getByText('Original date and time')).toBeVisible();
			expect(within(cards[1]).getByText('11/07/2022, 4:21 PM - 5:21 PM')).toBeVisible();
		});

		it('renders the prefilled date pickers, the recipient hint and the actions', () => {
			renderModal(store);
			expect(screen.getByText('New date and time')).toBeVisible();
			expect(screen.getByText('label.start_date_and_time')).toBeVisible();
			expect(screen.getByText('label.end_date_and_time')).toBeVisible();
			expect(screen.getAllByTestId('icon: CalendarOutline')).toHaveLength(2);
			expect(screen.getByText(RECIPIENT_HINT)).toBeVisible();
			expect(screen.getByRole('button', { name: CANCEL_BTN })).toBeEnabled();
			expect(screen.getByRole('button', { name: SEND_PROPOSAL_BTN })).toBeEnabled();
		});

		it('calls onClose from both the header close icon and the cancel button', async () => {
			const onClose = vi.fn();
			const { user } = renderModal(store, onClose);

			await user.click(customScreen.getByRoleWithIcon('button', { icon: 'icon: CloseOutline' }));
			await user.click(screen.getByRole('button', { name: CANCEL_BTN }));

			expect(onClose).toHaveBeenCalledTimes(2);
		});
	});

	describe('sending the proposal', () => {
		let store: EnhancedStore<RootState>;

		beforeEach(() => {
			store = createTestStore();
			createProposeEditor(store);
		});

		it('sends a CounterAppointment request addressed to the organizer with the proposed time', async () => {
			const onClose = vi.fn();
			const interceptor = createSoapAPIInterceptor<CounterAppointmentRequest, { jsns: string }>(
				'CounterAppointment',
				{ jsns: JSNS.mail }
			);
			const proposedStart = ORIGINAL_START + 24 * 60 * 60 * 1000;
			const proposedEnd = ORIGINAL_END + 24 * 60 * 60 * 1000;
			store.dispatch(
				editEditorDate({ id: defaultEditor.id, start: proposedStart, end: proposedEnd })
			);

			const { user } = renderModal(store, onClose);

			await user.click(screen.getByRole('button', { name: SEND_PROPOSAL_BTN }));

			const request = await interceptor;
			const component = request.m.inv.comp[0];
			expect(request.id).toBe('123-456');
			expect(component.name).toBe(EVENT_TITLE);
			expect(component.or.a).toBe(ORGANIZER_EMAIL);
			expect(component.s.tz).toBe(defaultEditor.timezone);
			expect(component.s.d).toBe('20221108T162100');
			expect(component.e.d).toBe('20221108T172100');
			expect(request.m.su).toContain(EVENT_TITLE);
		});

		it('shows a confirmation snackbar and closes the modal on success', async () => {
			const onClose = vi.fn();
			createSoapAPIInterceptor('CounterAppointment', { jsns: JSNS.mail });
			const { user } = renderModal(store, onClose);

			await user.click(screen.getByRole('button', { name: SEND_PROPOSAL_BTN }));

			expect(await screen.findByText('Your proposal has been sent to the organizer')).toBeVisible();
			await waitFor(() => {
				expect(onClose).toHaveBeenCalledTimes(1);
			});
		});

		it('shows an error snackbar and keeps the modal open on failure', async () => {
			const onClose = vi.fn();
			createSoapAPIInterceptor('CounterAppointment', generateSoapErrorResponseBody());
			const { user } = renderModal(store, onClose);

			await user.click(screen.getByRole('button', { name: SEND_PROPOSAL_BTN }));

			expect(await screen.findByText('Something went wrong, please try again')).toBeVisible();
			expect(onClose).not.toHaveBeenCalled();
			expect(screen.getByRole('button', { name: SEND_PROPOSAL_BTN })).toBeEnabled();
		});
	});
});
