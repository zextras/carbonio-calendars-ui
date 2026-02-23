/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { faker } from '@faker-js/faker';
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { screen } from '@testing-library/react';
import { FOLDER_VIEW } from '@zextras/carbonio-ui-commons';

import * as shell from '../../../../__mocks__/@zextras/carbonio-shell-ui';
import * as soapLib from '../../../../__mocks__/@zextras/carbonio-ui-soap-lib';
import { PARTICIPANT_ROLE, PARTICIPATION_STATUS } from '../../../constants/api';
import { reducers } from '../../../store/redux';
import mockedData from '../../../test/generators';
import { DeleteEventModal } from '../delete-event-modal';
import { setupTest } from '@test-setup';
import { populateFoldersStore } from '@test-utils/store/folders';

describe('delete event modal', () => {
	const participantFirstName = faker.person.firstName();
	const participantLastName = faker.person.lastName();
	const participantFullName = faker.person.fullName({
		firstName: participantFirstName,
		lastName: participantLastName
	});

	const participantEmail = faker.internet.email({
		firstName: participantFirstName,
		lastName: participantLastName
	});

	const draftOrganizer = {
		name: participantFirstName,
		email: participantEmail
	};

	const singleEventAsOrganizer = mockedData.getEvent();
	const draftSingleEvent = mockedData.getEvent({
		resource: {
			organizer: draftOrganizer,
			inviteNeverSent: true
		}
	});
	const singleEventAsParticipant = mockedData.getEvent({
		resource: {
			hasOtherAttendees: false,
			iAmAttendee: true,
			iAmOrganizer: false,
			iAmVisitor: false
		}
	});

	const singleInviteAsParticipant = mockedData.getInvite({
		event: singleEventAsParticipant
	});

	const singleInviteAsOrganizerNoParticipants = mockedData.getInvite({
		event: singleEventAsOrganizer
	});

	const singleInviteAsOrganizerWithParticipants = mockedData.getInvite({
		event: singleEventAsOrganizer,
		context: {
			attendees: [
				{
					a: participantEmail,
					d: participantFullName,
					ptst: PARTICIPATION_STATUS.ACCEPTED,
					cutype: '',
					role: PARTICIPANT_ROLE.REQUIRED,
					rsvp: true,
					url: participantEmail
				}
			],
			participants: {
				AC: [
					{
						name: participantFirstName,
						email: participantEmail,
						isOptional: false,
						response: PARTICIPATION_STATUS.ACCEPTED
					}
				]
			}
		}
	});

	const draftSingleInvite = mockedData.getInvite({
		event: draftSingleEvent,
		context: {
			attendees: [
				{
					a: participantEmail,
					d: participantFullName,
					ptst: PARTICIPATION_STATUS.ACCEPTED,
					cutype: '',
					role: PARTICIPANT_ROLE.REQUIRED,
					rsvp: true,
					url: participantEmail
				}
			],
			participants: {
				AC: [
					{
						name: participantFirstName,
						email: participantEmail,
						isOptional: false,
						response: PARTICIPATION_STATUS.ACCEPTED
					}
				]
			}
		}
	});

	const draftAppointment = mockedData.getAppointment({
		event: draftSingleEvent
	});

	const singleAppointmentAsOrganizer = mockedData.getAppointment({
		event: singleEventAsOrganizer
	});

	const singleAppointmentAsParticipant = mockedData.getAppointment({
		appointment: { isOrg: false },
		event: singleEventAsParticipant
	});

	const invites = {
		invites: {
			[singleInviteAsOrganizerNoParticipants.id]: singleInviteAsOrganizerNoParticipants,
			[singleInviteAsParticipant.id]: singleInviteAsParticipant,
			[singleInviteAsOrganizerWithParticipants.id]: singleInviteAsOrganizerWithParticipants,
			[draftSingleInvite.id]: draftSingleInvite
		}
	};

	const appointments = {
		appointments: {
			[singleEventAsOrganizer.resource.id]: singleAppointmentAsOrganizer,
			[singleEventAsParticipant.resource.id]: singleAppointmentAsParticipant,
			[draftSingleEvent.resource.id]: draftAppointment
		}
	};

	const emptyStore = mockedData.store.mockReduxStore({ invites, appointments });

	describe('instance', () => {
		describe('he is the organizer', () => {
			test('modal doesnt have a notify organizer section', () => {
				const store = configureStore({
					reducer: combineReducers(reducers),
					preloadedState: emptyStore
				});
				const onClose = vi.fn();
				populateFoldersStore({ view: FOLDER_VIEW.appointment });

				setupTest(
					<DeleteEventModal
						event={singleEventAsOrganizer}
						invite={singleInviteAsOrganizerNoParticipants}
						onClose={onClose}
					/>,
					{ store }
				);

				expect(screen.queryByTestId('icon: Square')).not.toBeInTheDocument();
				expect(screen.queryByText(/notify organizer/i)).not.toBeInTheDocument();
			});
			describe('there is a participant', () => {
				describe('deleting a draft', () => {
					test('wont open the modal to send cancellation', async () => {
						const store = configureStore({
							reducer: combineReducers(reducers),
							preloadedState: emptyStore
						});
						const onClose = vi.fn();
						populateFoldersStore({ view: FOLDER_VIEW.appointment });

						setupTest(
							<DeleteEventModal
								event={draftSingleEvent}
								invite={draftSingleInvite}
								onClose={onClose}
							/>,
							{
								store
							}
						);
						expect(
							screen.queryByRole('button', {
								name: /Send Cancellation/i
							})
						).not.toBeInTheDocument();

						expect(screen.getByText('Delete new-event-1')).toBeInTheDocument();
						expect(
							screen.getByText(/Are you sure you want to delete the appointment ?/i)
						).toBeInTheDocument();
						expect(
							screen.getByRole('button', {
								name: 'Delete'
							})
						).toBeInTheDocument();
					});
					test('cancel request will not include other participants', async () => {
						// it is useful to make sure the cancellation message is not sent to draft participants

						const spy = vi.spyOn(soapLib, 'legacySoapFetch');
						const store = configureStore({
							reducer: combineReducers(reducers),
							preloadedState: emptyStore
						});
						const onClose = vi.fn();
						populateFoldersStore({ view: FOLDER_VIEW.appointment });

						const { user } = setupTest(
							<DeleteEventModal
								event={draftSingleEvent}
								invite={draftSingleInvite}
								onClose={onClose}
							/>,
							{
								store
							}
						);

						await user.click(
							screen.getByRole('button', {
								name: 'Delete'
							})
						);

						await vi.advanceTimersToNextTimerAsync();

						expect(spy).toHaveBeenCalledWith(
							'CancelAppointment',
							expect.objectContaining({
								m: expect.objectContaining({
									e: [{ a: participantEmail, p: participantFirstName, t: 'f' }]
								})
							})
						);
					});
				});
				test('modal ui sections', () => {
					const store = configureStore({
						reducer: combineReducers(reducers),
						preloadedState: emptyStore
					});
					const onClose = vi.fn();

					populateFoldersStore({ view: FOLDER_VIEW.appointment });

					setupTest(
						<DeleteEventModal
							event={singleEventAsOrganizer}
							invite={singleInviteAsOrganizerWithParticipants}
							onClose={onClose}
						/>,
						{ store }
					);

					expect(
						screen.getByText(/Do you want to edit the appointment cancellation message?/i)
					).toBeInTheDocument();
					expect(
						screen.queryByText(/Are you sure you want to delete the appointment ?/i)
					).not.toBeInTheDocument();
					expect(
						screen.getByRole('button', {
							name: /Edit Message/i
						})
					).toBeInTheDocument();
					expect(
						screen.getByRole('button', {
							name: /Send Cancellation/i
						})
					).toBeInTheDocument();
					expect(screen.getByText('Delete new-event-1')).toBeInTheDocument();
				});
				test('if the organizer want to send a custom cancellation message a composer will be opened', async () => {
					const store = configureStore({
						reducer: combineReducers(reducers),
						preloadedState: emptyStore
					});
					const onClose = vi.fn();
					const composer = vi.fn();
					const composerSpy = vi
						.spyOn(shell, 'useIntegratedFunction')
						.mockReturnValue([composer, true]);

					populateFoldersStore({ view: FOLDER_VIEW.appointment });

					const { user } = setupTest(
						<DeleteEventModal
							event={singleEventAsOrganizer}
							invite={singleInviteAsOrganizerWithParticipants}
							onClose={onClose}
						/>,
						{ store }
					);

					expect(composerSpy).toHaveBeenCalled();
					expect(composerSpy).toHaveBeenCalledWith('compose');

					await user.click(
						screen.getByRole('button', {
							name: /Edit Message/i
						})
					);

					expect(composer).toHaveBeenCalled();
				});
				test('organizer can send a standard cancellation message', async () => {
					const store = configureStore({
						reducer: combineReducers(reducers),
						preloadedState: emptyStore
					});
					const onClose = vi.fn();

					const spy = vi.spyOn(soapLib, 'legacySoapFetch');
					populateFoldersStore({ view: FOLDER_VIEW.appointment });

					const { user } = setupTest(
						<DeleteEventModal
							event={singleEventAsOrganizer}
							invite={singleInviteAsOrganizerWithParticipants}
							onClose={onClose}
						/>,
						{ store }
					);

					await user.click(
						screen.getByRole('button', {
							name: /send cancellation/i
						})
					);
					expect(spy).toHaveBeenCalledWith(
						'CancelAppointment',
						expect.objectContaining({
							m: expect.objectContaining({
								mp: {
									ct: 'multipart/alternative',
									mp: [
										{ content: expect.stringMatching(/The following/), ct: 'text/plain' },
										{
											content: expect.stringMatching(/The following/),
											ct: 'text/html'
										}
									]
								},
								su: 'Cancelled: name'
							})
						})
					);
					const newStore =
						store.getState().appointments.appointments[singleEventAsOrganizer.resource.id];
					expect(newStore.l).toBe('3');
					const snackbar = await screen.findByText(/Appointment moved to trash/i);
					expect(snackbar).toBeVisible();
				});
			});
			describe('there is not a participant', () => {
				test('modal ui sections', () => {
					const store = configureStore({
						reducer: combineReducers(reducers),
						preloadedState: emptyStore
					});
					const onClose = vi.fn();

					populateFoldersStore({ view: FOLDER_VIEW.appointment });

					setupTest(
						<DeleteEventModal
							event={singleEventAsOrganizer}
							invite={singleInviteAsOrganizerNoParticipants}
							onClose={onClose}
						/>,
						{ store }
					);

					expect(screen.getByText('Delete new-event-1')).toBeInTheDocument();
					expect(
						screen.getByText(/Are you sure you want to delete the appointment ?/i)
					).toBeInTheDocument();
					expect(
						screen.getByRole('button', {
							name: 'Delete'
						})
					).toBeInTheDocument();
				});
				test('on confirm the event is moved to trash', async () => {
					const store = configureStore({
						reducer: combineReducers(reducers),
						preloadedState: emptyStore
					});
					const onClose = vi.fn();

					populateFoldersStore({ view: FOLDER_VIEW.appointment });

					const { user } = setupTest(
						<DeleteEventModal
							event={singleEventAsOrganizer}
							invite={singleInviteAsOrganizerNoParticipants}
							onClose={onClose}
						/>,
						{ store }
					);

					await user.click(
						screen.getByRole('button', {
							name: /delete/i
						})
					);

					const newStore =
						store.getState().appointments.appointments[singleEventAsOrganizer.resource.id];
					expect(newStore.l).toBe('3');

					const snackbar = await screen.findByText(/Appointment moved to trash/i);
					expect(snackbar).toBeVisible();
				});
			});
		});
		describe('he is not the organizer', () => {
			test('modal ui sections', () => {
				const store = configureStore({
					reducer: combineReducers(reducers),
					preloadedState: emptyStore
				});
				const onClose = vi.fn();

				populateFoldersStore({ view: FOLDER_VIEW.appointment });

				setupTest(
					<DeleteEventModal
						event={singleEventAsParticipant}
						invite={singleInviteAsParticipant}
						onClose={onClose}
					/>,
					{ store }
				);

				expect(screen.getByText('Delete new-event-1')).toBeInTheDocument();
				expect(
					screen.getByText(/Are you sure you want to delete the appointment ?/i)
				).toBeInTheDocument();
				expect(screen.getByTestId('icon: Square')).toBeInTheDocument();
				expect(screen.getByText(/notify organizer/i)).toBeInTheDocument();

				expect(
					screen.getByRole('button', {
						name: /delete/i
					})
				).toBeInTheDocument();
			});
			test('on confirm appointment is moved to trash', async () => {
				const store = configureStore({
					reducer: combineReducers(reducers),
					preloadedState: emptyStore
				});
				const onClose = vi.fn();
				const spy = vi.spyOn(soapLib, 'legacySoapFetch');

				populateFoldersStore({ view: FOLDER_VIEW.appointment });

				const { user } = setupTest(
					<DeleteEventModal
						event={singleEventAsParticipant}
						invite={singleInviteAsParticipant}
						onClose={onClose}
					/>,
					{ store }
				);

				await user.click(screen.getByTestId('icon: Square'));

				await user.click(
					screen.getByRole('button', {
						name: /delete/i
					})
				);

				expect(spy).toHaveBeenCalledWith(
					'CancelAppointment',
					expect.objectContaining({
						m: expect.objectContaining({
							mp: {
								ct: 'multipart/alternative',
								mp: [
									{ content: expect.stringMatching(/The following/), ct: 'text/plain' },
									{
										content: expect.stringMatching(/The following/),
										ct: 'text/html'
									}
								]
							},
							su: 'Cancelled: name'
						})
					})
				);
			});
			test('he can notify the organizer', async () => {
				const store = configureStore({
					reducer: combineReducers(reducers),
					preloadedState: emptyStore
				});
				const onClose = vi.fn();
				const spy = vi.spyOn(soapLib, 'legacySoapFetch');

				populateFoldersStore({ view: FOLDER_VIEW.appointment });

				const { user } = setupTest(
					<DeleteEventModal
						event={singleEventAsParticipant}
						invite={singleInviteAsParticipant}
						onClose={onClose}
					/>,
					{ store }
				);

				await user.click(screen.getByTestId('icon: Square'));

				await user.click(
					screen.getByRole('button', {
						name: /delete/i
					})
				);

				await vi.advanceTimersByTimeAsync(5000);

				expect(spy).toHaveBeenCalledWith(
					'SendInviteReply',
					expect.objectContaining({
						updateOrganizer: true
					})
				);
			});
			test('he can avoid to notify the organizer', async () => {
				const store = configureStore({
					reducer: combineReducers(reducers),
					preloadedState: emptyStore
				});
				const onClose = vi.fn();
				const spy = vi.spyOn(soapLib, 'legacySoapFetch');

				populateFoldersStore({ view: FOLDER_VIEW.appointment });

				const { user } = setupTest(
					<DeleteEventModal
						event={singleEventAsParticipant}
						invite={singleInviteAsParticipant}
						onClose={onClose}
					/>,
					{ store }
				);

				await user.click(
					screen.getByRole('button', {
						name: /delete/i
					})
				);

				await vi.advanceTimersToNextTimerAsync();

				expect(spy).not.toHaveBeenCalledWith(
					'SendInviteReply',
					expect.objectContaining({
						updateOrganizer: true
					})
				);
			});
		});
	});
});
