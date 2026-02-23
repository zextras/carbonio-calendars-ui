/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { screen } from '@testing-library/react';

import { ReplyButtonsPart } from './reply-buttons-part';
import * as appointmentActionsFn from '../../actions/appointment-actions-fn';
import { PARTICIPATION_STATUS } from '../../constants/api';
import { reducers } from '../../store/redux';
import mockedData from '../../test/generators';
import { setupTest } from '@test-setup';
import { TEST_SELECTORS } from 'constants/test-utils';

describe('ReplyButtonsPart', () => {
	describe('Rendering', () => {
		it('should render all four action buttons', () => {
			const event = mockedData.getEvent();
			const invite = mockedData.getInvite({ event });
			const store = configureStore({ reducer: combineReducers(reducers) });

			setupTest(<ReplyButtonsPart event={event} invite={invite} />, { store });

			expect(screen.getByRole('button', { name: /Accept/i })).toBeVisible();
			expect(screen.getByRole('button', { name: /Tentative/i })).toBeVisible();
			expect(screen.getByRole('button', { name: /Decline/i })).toBeVisible();
			expect(screen.getByRole('button', { name: /Propose new time/i })).toBeVisible();
		});

		it('should render buttons with correct icons', () => {
			const event = mockedData.getEvent();
			const invite = mockedData.getInvite({ event });
			const store = configureStore({ reducer: combineReducers(reducers) });

			setupTest(<ReplyButtonsPart event={event} invite={invite} />, { store });

			expect(screen.getByTestId(TEST_SELECTORS.ICONS.checkmark)).toBeVisible();
			expect(screen.getByTestId(TEST_SELECTORS.ICONS.questionMark)).toBeVisible();
			expect(screen.getByTestId(TEST_SELECTORS.ICONS.closeOutline)).toBeVisible();
			expect(screen.getByTestId(TEST_SELECTORS.ICONS.clockOutline)).toBeVisible();
		});
	});

	describe('Button state - Accept button', () => {
		it('should be enabled when user has not accepted the invitation', () => {
			const event = mockedData.getEvent({
				resource: {
					participationStatus: PARTICIPATION_STATUS.NEED_ACTION
				}
			});
			const invite = mockedData.getInvite({ event });
			const store = configureStore({ reducer: combineReducers(reducers) });

			setupTest(<ReplyButtonsPart event={event} invite={invite} />, { store });

			expect(screen.getByRole('button', { name: /Accept/i })).toBeEnabled();
		});

		it('should be disabled when user has already accepted the invitation', () => {
			const event = mockedData.getEvent({
				resource: {
					participationStatus: PARTICIPATION_STATUS.ACCEPTED
				}
			});
			const invite = mockedData.getInvite({ event });
			const store = configureStore({ reducer: combineReducers(reducers) });

			setupTest(<ReplyButtonsPart event={event} invite={invite} />, { store });

			expect(screen.getByRole('button', { name: /Accept/i })).toBeDisabled();
		});
	});

	describe('Button state - Tentative button', () => {
		it('should be enabled when user has not accepted as tentative', () => {
			const event = mockedData.getEvent({
				resource: {
					participationStatus: PARTICIPATION_STATUS.NEED_ACTION
				}
			});
			const invite = mockedData.getInvite({ event });
			const store = configureStore({ reducer: combineReducers(reducers) });

			setupTest(<ReplyButtonsPart event={event} invite={invite} />, { store });

			expect(screen.getByRole('button', { name: /Tentative/i })).toBeEnabled();
		});

		it('should be disabled when user has already accepted as tentative', () => {
			const event = mockedData.getEvent({
				resource: {
					participationStatus: PARTICIPATION_STATUS.TENTATIVE
				}
			});
			const invite = mockedData.getInvite({ event });
			const store = configureStore({ reducer: combineReducers(reducers) });

			setupTest(<ReplyButtonsPart event={event} invite={invite} />, { store });

			expect(screen.getByRole('button', { name: /Tentative/i })).toBeDisabled();
		});
	});

	describe('Button state - Decline button', () => {
		it('should be enabled when user has not declined the invitation', () => {
			const event = mockedData.getEvent({
				resource: {
					participationStatus: PARTICIPATION_STATUS.NEED_ACTION
				}
			});
			const invite = mockedData.getInvite({ event });
			const store = configureStore({ reducer: combineReducers(reducers) });

			setupTest(<ReplyButtonsPart event={event} invite={invite} />, { store });

			expect(screen.getByRole('button', { name: /Decline/i })).toBeEnabled();
		});

		it('should be disabled when user has already declined the invitation', () => {
			const event = mockedData.getEvent({
				resource: {
					participationStatus: PARTICIPATION_STATUS.DECLINED
				}
			});
			const invite = mockedData.getInvite({ event });
			const store = configureStore({ reducer: combineReducers(reducers) });

			setupTest(<ReplyButtonsPart event={event} invite={invite} />, { store });

			expect(screen.getByRole('button', { name: /Decline/i })).toBeDisabled();
		});
	});

	describe('Button state - Propose new time button', () => {
		it('should always be enabled regardless of participation status', () => {
			const participationStatuses = [
				PARTICIPATION_STATUS.NEED_ACTION,
				PARTICIPATION_STATUS.ACCEPTED,
				PARTICIPATION_STATUS.TENTATIVE,
				PARTICIPATION_STATUS.DECLINED
			];

			participationStatuses.forEach((status) => {
				const event = mockedData.getEvent({
					resource: {
						participationStatus: status
					}
				});
				const invite = mockedData.getInvite({ event });
				const store = configureStore({ reducer: combineReducers(reducers) });

				const { unmount } = setupTest(<ReplyButtonsPart event={event} invite={invite} />, {
					store
				});

				expect(screen.getByRole('button', { name: /Propose new time/i })).toBeEnabled();
				unmount();
			});
		});
	});

	describe('Context', () => {
		it('should pass correct context with isInstance as true when event has ridZ', () => {
			const event = mockedData.getEvent({
				resource: {
					ridZ: '20240101T120000Z'
				}
			});
			const invite = mockedData.getInvite({ event });
			const store = configureStore({ reducer: combineReducers(reducers) });
			const acceptAsActionSpy = vi.spyOn(appointmentActionsFn, 'acceptAsAction');

			setupTest(<ReplyButtonsPart event={event} invite={invite} />, { store });

			expect(acceptAsActionSpy).toHaveBeenCalled();
			expect(acceptAsActionSpy.mock.calls[0][0].context.isInstance).toBe(true);
		});

		it('should pass correct context with isInstance as false when event does not have ridZ', () => {
			const event = mockedData.getEvent({
				resource: {
					ridZ: undefined
				}
			});
			const invite = mockedData.getInvite({ event });
			const store = configureStore({ reducer: combineReducers(reducers) });
			const acceptAsActionSpy = vi.spyOn(appointmentActionsFn, 'acceptAsAction');

			setupTest(<ReplyButtonsPart event={event} invite={invite} />, { store });

			expect(acceptAsActionSpy).toHaveBeenCalled();
			expect(acceptAsActionSpy.mock.calls[0][0].context.isInstance).toBe(false);
		});
	});
});
