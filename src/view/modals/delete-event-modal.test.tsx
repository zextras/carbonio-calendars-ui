/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { faker } from '@faker-js/faker';
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { act, screen, waitFor } from '@testing-library/react';

import { DeleteEventModal } from './delete-event-modal';
import { FOLDER_VIEW } from '../../carbonio-ui-commons/constants';
import * as shell from '../../carbonio-ui-commons/test/mocks/carbonio-shell-ui';
import { populateFoldersStore } from '../../carbonio-ui-commons/test/mocks/store/folders';
import { setupTest } from '../../carbonio-ui-commons/test/test-setup';
import { PARTICIPANT_ROLE } from '../../constants/api';
import { reducers } from '../../store/redux';
import mockedData from '../../test/generators';

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
					ptst: 'AC',
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
						response: 'AC'
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
					ptst: 'AC',
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
						response: 'AC'
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

	beforeEach(() => {
		jest.clearAllMocks();
	});
	describe('series', () => {
		describe('The event is created on a shared account', () => {
			test.todo('by a different user');
			test.todo('by the current user');
		});
		describe('he is the organizer', () => {
			describe('there is a participant', () => {
				describe('deleting a draft', () => {
					test.todo('wont open the modal to send cancellation');
					test.todo('cancel request will not include other participants');
				});
				test.todo('organizer can send a custom cancellation message');
				test.todo('organizer can send a standard cancellation message');
			});
			test.todo('if there is not a participant you can only delete the event');
		});
		describe('he is not the organizer', () => {
			test.todo('he can notify the organizer');
			test.todo('he can avoid to notify the organizer');
		});
	});
	describe('instance', () => {
		describe('The event is created on a shared account', () => {
			test.todo('by a different user');
			test.todo('by the current user');
		});
		describe('he is the organizer', () => {
			test('modal doesnt have a notify organizer section', () => {
				const store = configureStore({
					reducer: combineReducers(reducers),
					preloadedState: emptyStore
				});
				const onClose = jest.fn();
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
				expect(screen.queryByText(/label\.notify_organizer/i)).not.toBeInTheDocument();
			});
			describe('there is a participant', () => {
				describe('deleting a draft', () => {
					test('wont open the modal to send cancellation', async () => {
						const store = configureStore({
							reducer: combineReducers(reducers),
							preloadedState: emptyStore
						});
						const onClose = jest.fn();
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
								name: /action\.send_cancellation/i
							})
						).not.toBeInTheDocument();

						expect(screen.getByText('label.delete new-event-1')).toBeInTheDocument();
						expect(screen.getByText(/message\.sure_to_delete_appointment/i)).toBeInTheDocument();
						expect(
							screen.getByRole('button', {
								name: 'label.delete'
							})
						).toBeInTheDocument();
					});
					test('cancel request will not include other participants', async () => {
						// it is useful to make sure the cancellation message is not sent to draft participants

						const spy = jest.spyOn(shell, 'soapFetch');
						const store = configureStore({
							reducer: combineReducers(reducers),
							preloadedState: emptyStore
						});
						const onClose = jest.fn();
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

						user.click(
							screen.getByRole('button', {
								name: 'label.delete'
							})
						);

						act(() => {
							jest.advanceTimersByTime(6000);
						});

						await waitFor(() =>
							expect(spy).toHaveBeenCalledWith(
								'CancelAppointment',
								expect.objectContaining({
									m: expect.objectContaining({
										e: [{ a: participantEmail, p: participantFirstName, t: 'f' }]
									})
								})
							)
						);
						jest.clearAllMocks();
					});
				});
				test('modal ui sections', () => {
					const store = configureStore({
						reducer: combineReducers(reducers),
						preloadedState: emptyStore
					});
					const onClose = jest.fn();

					populateFoldersStore({ view: FOLDER_VIEW.appointment });

					setupTest(
						<DeleteEventModal
							event={singleEventAsOrganizer}
							invite={singleInviteAsOrganizerWithParticipants}
							onClose={onClose}
						/>,
						{ store }
					);

					expect(screen.getByText(/message\.want_to_edit_cancellation_msg/i)).toBeInTheDocument();
					expect(
						screen.queryByText(/message\.sure_to_delete_appointment/i)
					).not.toBeInTheDocument();
					expect(
						screen.getByRole('button', {
							name: /action\.edit_message/i
						})
					).toBeInTheDocument();
					expect(
						screen.getByRole('button', {
							name: /action\.send_cancellation/i
						})
					).toBeInTheDocument();
					expect(screen.getByText('label.delete new-event-1')).toBeInTheDocument();
				});
				test('if the organizer want to send a custom cancellation message a composer will be opened', async () => {
					const store = configureStore({
						reducer: combineReducers(reducers),
						preloadedState: emptyStore
					});
					const onClose = jest.fn();
					const composer = jest.fn();
					const composerSpy = jest
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

					await waitFor(() => {
						user.click(
							screen.getByRole('button', {
								name: /action\.edit_message/i
							})
						);
					});

					expect(composer).toHaveBeenCalled();
				});
				test('organizer can send a standard cancellation message', async () => {
					const store = configureStore({
						reducer: combineReducers(reducers),
						preloadedState: emptyStore
					});
					const onClose = jest.fn();

					const spy = jest.spyOn(shell, 'soapFetch');
					populateFoldersStore({ view: FOLDER_VIEW.appointment });

					const { user } = setupTest(
						<DeleteEventModal
							event={singleEventAsOrganizer}
							invite={singleInviteAsOrganizerWithParticipants}
							onClose={onClose}
						/>,
						{ store }
					);

					await waitFor(() => {
						user.click(
							screen.getByRole('button', {
								name: /action\.send_cancellation/i
							})
						);
					});
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
					const onClose = jest.fn();

					populateFoldersStore({ view: FOLDER_VIEW.appointment });

					setupTest(
						<DeleteEventModal
							event={singleEventAsOrganizer}
							invite={singleInviteAsOrganizerNoParticipants}
							onClose={onClose}
						/>,
						{ store }
					);

					expect(screen.getByText('label.delete new-event-1')).toBeInTheDocument();
					expect(screen.getByText(/message\.sure_to_delete_appointment/i)).toBeInTheDocument();
					expect(
						screen.getByRole('button', {
							name: 'label.delete'
						})
					).toBeInTheDocument();
				});
				test('on confirm the event is moved to trash', async () => {
					const store = configureStore({
						reducer: combineReducers(reducers),
						preloadedState: emptyStore
					});
					const onClose = jest.fn();

					populateFoldersStore({ view: FOLDER_VIEW.appointment });

					const { user } = setupTest(
						<DeleteEventModal
							event={singleEventAsOrganizer}
							invite={singleInviteAsOrganizerNoParticipants}
							onClose={onClose}
						/>,
						{ store }
					);

					await waitFor(() => {
						user.click(
							screen.getByRole('button', {
								name: /label\.delete/i
							})
						);
					});

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
				const onClose = jest.fn();

				populateFoldersStore({ view: FOLDER_VIEW.appointment });

				setupTest(
					<DeleteEventModal
						event={singleEventAsParticipant}
						invite={singleInviteAsParticipant}
						onClose={onClose}
					/>,
					{ store }
				);

				expect(screen.getByText('label.delete new-event-1')).toBeInTheDocument();
				expect(screen.getByText(/message\.sure_to_delete_appointment/i)).toBeInTheDocument();
				expect(screen.getByTestId('icon: Square')).toBeInTheDocument();
				expect(screen.getByText(/label\.notify_organizer/i)).toBeInTheDocument();

				expect(
					screen.getByRole('button', {
						name: /label\.delete/i
					})
				).toBeInTheDocument();
			});
			test('on confirm appointment is moved to trash', async () => {
				const store = configureStore({
					reducer: combineReducers(reducers),
					preloadedState: emptyStore
				});
				const onClose = jest.fn();
				const spy = jest.spyOn(shell, 'soapFetch');

				populateFoldersStore({ view: FOLDER_VIEW.appointment });

				const { user } = setupTest(
					<DeleteEventModal
						event={singleEventAsParticipant}
						invite={singleInviteAsParticipant}
						onClose={onClose}
					/>,
					{ store }
				);

				await waitFor(() => {
					user.click(screen.getByTestId('icon: Square'));
				});

				await waitFor(() => {
					user.click(
						screen.getByRole('button', {
							name: /label\.delete/i
						})
					);
				});

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
				const onClose = jest.fn();
				const spy = jest.spyOn(shell, 'soapFetch');

				populateFoldersStore({ view: FOLDER_VIEW.appointment });

				const { user } = setupTest(
					<DeleteEventModal
						event={singleEventAsParticipant}
						invite={singleInviteAsParticipant}
						onClose={onClose}
					/>,
					{ store }
				);

				await waitFor(() => {
					user.click(screen.getByTestId('icon: Square'));
				});

				await waitFor(() => {
					user.click(
						screen.getByRole('button', {
							name: /label\.delete/i
						})
					);
				});

				jest.clearAllMocks();
				act(() => {
					jest.advanceTimersByTime(6000);
				});

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
				const onClose = jest.fn();
				const spy = jest.spyOn(shell, 'soapFetch');

				populateFoldersStore({ view: FOLDER_VIEW.appointment });

				const { user } = setupTest(
					<DeleteEventModal
						event={singleEventAsParticipant}
						invite={singleInviteAsParticipant}
						onClose={onClose}
					/>,
					{ store }
				);

				await waitFor(() => {
					user.click(
						screen.getByRole('button', {
							name: /label\.delete/i
						})
					);
				});

				jest.clearAllMocks();
				act(() => {
					jest.advanceTimersByTime(6000);
				});

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
