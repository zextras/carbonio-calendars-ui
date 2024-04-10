/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import { AvailabilityChecker } from './availability-checker';
import { getSetupServer } from '../../../carbonio-ui-commons/test/jest-setup';
import { setupTest } from '../../../carbonio-ui-commons/test/test-setup';
import * as getFreeBusyResponseHandler from '../../../soap/get-free-busy-request';
import { reducers } from '../../../store/redux';
import { AvailabilitySlots } from '../../../test/mocks/network/msw/handle-get-free-busy';
import 'jest-styled-components';

const handleGetFreeBusy = (customResponse: Array<AvailabilitySlots>): void => {
	getSetupServer().use(
		http.post('/service/soap/GetFreeBusyRequest', async () =>
			HttpResponse.json({
				Body: {
					GetFreeBusyResponse: {
						usr: customResponse,
						_jsns: 'urn:zimbraMail'
					}
				}
			})
		)
	);
};

afterEach(() => {
	jest.clearAllMocks();
});

describe('availability checker component', () => {
	describe('the component will check the availability of the user', () => {
		test('it will call a getFreeBusyRequest', async () => {
			const email = 'mail@mail.com';
			const start = new Date();
			const end = start.setUTCHours(15, 30, 0, 0);

			const getFreeBusyHandler = jest.spyOn(getFreeBusyResponseHandler, 'getFreeBusyRequest');
			setupTest(
				<AvailabilityChecker
					email={email}
					start={start.getTime()}
					end={end}
					allDay={false}
					rootId={'1'}
				/>
			);

			await waitFor(() => {
				expect(getFreeBusyHandler).toHaveBeenCalledTimes(1);
			});
		});
		test.todo('it will update when a new appointment is added'); // is it possible to test?
		describe('if the user is available at the time of the event', () => {
			test('there will be an appointment icon', async () => {
				const email = 'mail@mail.com';
				const start = new Date();
				const end = start.setUTCHours(15, 30, 0, 0);

				const customResponse = [
					{
						f: [{ s: start.setUTCHours(0, 0, 0, 0), e: start.setUTCHours(23, 59, 59, 999) }],
						id: email
					}
				];
				const getFreeBusyHandler = jest.spyOn(getFreeBusyResponseHandler, 'getFreeBusyRequest');

				handleGetFreeBusy(customResponse);

				setupTest(
					<AvailabilityChecker
						email={email}
						start={start.getTime()}
						end={end}
						allDay={false}
						rootId={'1'}
					/>
				);

				await waitFor(() => {
					expect(getFreeBusyHandler).toHaveBeenCalledTimes(1);
				});
				const appointment = screen.getByTestId(/icon: Appointment/i);

				expect(appointment).toBeVisible();
			});
			test('the icon is green', async () => {
				const email = 'mail@mail.com';
				const start = new Date();
				const end = start.setUTCHours(15, 30, 0, 0);

				const customResponse = [
					{
						f: [{ s: start.setUTCHours(0, 0, 0, 0), e: start.setUTCHours(23, 59, 59, 999) }],
						id: email
					}
				];
				const getFreeBusyHandler = jest.spyOn(getFreeBusyResponseHandler, 'getFreeBusyRequest');

				handleGetFreeBusy(customResponse);

				setupTest(
					<AvailabilityChecker
						email={email}
						start={start.getTime()}
						end={end}
						allDay={false}
						rootId={'1'}
					/>
				);
				await waitFor(() => {
					expect(getFreeBusyHandler).toHaveBeenCalledTimes(1);
				});
				const greenIcon = screen.getByTestId(/icon: Appointment/i);

				expect(greenIcon).toHaveStyleRule('color', '#8bc34a');
			});
			test('there will be a string saying "You are available"', async () => {
				const email = 'mail@mail.com';
				const start = new Date();
				const end = start.setUTCHours(15, 30, 0, 0);

				const customResponse = [
					{
						f: [{ s: start.setUTCHours(0, 0, 0, 0), e: start.setUTCHours(23, 59, 59, 999) }],
						id: email
					}
				];
				const getFreeBusyHandler = jest.spyOn(getFreeBusyResponseHandler, 'getFreeBusyRequest');

				handleGetFreeBusy(customResponse);

				setupTest(
					<AvailabilityChecker
						email={email}
						start={start.getTime()}
						end={end}
						allDay={false}
						rootId={'1'}
					/>
				);
				await waitFor(() => {
					expect(getFreeBusyHandler).toHaveBeenCalledTimes(1);
				});
				const string = screen.getByText(/You are available/i);

				expect(string).toBeVisible();
			});
		});
		describe('if the user is not available at the time of the event', () => {
			test('there will be a calendar warning icon', async () => {
				const email = 'mail@mail.com';
				const start = new Date();
				const end = start.setUTCHours(15, 30, 0, 0);
				const customResponse = [
					{
						f: [
							{ s: start.setUTCHours(0, 0, 0, 0), e: start.setUTCHours(14, 59, 59, 999) },
							{ s: start.setUTCHours(15, 0, 0, 1), e: start.setUTCHours(23, 59, 59, 999) }
						],
						b: [{ s: start.setUTCHours(15, 0, 0, 0), e: start.setUTCHours(15, 30, 0, 0) }],
						id: email
					}
				];
				const getFreeBusyHandler = jest.spyOn(getFreeBusyResponseHandler, 'getFreeBusyRequest');

				handleGetFreeBusy(customResponse);

				setupTest(
					<AvailabilityChecker
						email={email}
						start={start.getTime()}
						end={end}
						allDay={false}
						rootId={'1'}
					/>
				);

				await waitFor(() => {
					expect(getFreeBusyHandler).toHaveBeenCalledTimes(1);
				});
				const calendarWarning = screen.getByTestId(/icon: CalendarWarning/i);

				expect(calendarWarning).toBeVisible();
			});
			test('the icon is yellow', async () => {
				const email = 'mail@mail.com';
				const start = new Date();
				const end = start.setUTCHours(15, 30, 0, 0);
				const customResponse = [
					{
						f: [
							{ s: start.setUTCHours(0, 0, 0, 0), e: start.setUTCHours(14, 59, 59, 999) },
							{ s: start.setUTCHours(15, 0, 0, 1), e: start.setUTCHours(23, 59, 59, 999) }
						],
						b: [{ s: start.setUTCHours(15, 0, 0, 0), e: start.setUTCHours(15, 30, 0, 0) }],
						id: email
					}
				];
				const getFreeBusyHandler = jest.spyOn(getFreeBusyResponseHandler, 'getFreeBusyRequest');

				handleGetFreeBusy(customResponse);

				setupTest(
					<AvailabilityChecker
						email={email}
						start={start.getTime()}
						end={end}
						allDay={false}
						rootId={'1'}
					/>
				);

				await waitFor(() => {
					expect(getFreeBusyHandler).toHaveBeenCalledTimes(1);
				});
				const calendarWarning = screen.getByTestId(/icon: CalendarWarning/i);

				expect(calendarWarning).toHaveStyleRule('color', '#ffc107');
			});
			test('there will be a string saying "Check your availability"', async () => {
				const email = 'mail@mail.com';
				const start = new Date();
				const end = start.setUTCHours(15, 30, 0, 0);

				const customResponse = [
					{
						f: [
							{ s: start.setUTCHours(0, 0, 0, 0), e: start.setUTCHours(14, 59, 59, 999) },
							{ s: start.setUTCHours(15, 0, 0, 1), e: start.setUTCHours(23, 59, 59, 999) }
						],
						b: [{ s: start.setUTCHours(15, 0, 0, 0), e: start.setUTCHours(15, 30, 0, 0) }],
						id: email
					}
				];
				const getFreeBusyHandler = jest.spyOn(getFreeBusyResponseHandler, 'getFreeBusyRequest');

				handleGetFreeBusy(customResponse);

				setupTest(
					<AvailabilityChecker
						email={email}
						start={start.getTime()}
						end={end}
						allDay={false}
						rootId={'1'}
					/>
				);
				await waitFor(() => {
					expect(getFreeBusyHandler).toHaveBeenCalledTimes(1);
				});
				const string = screen.getByText(/Check your availability/i);

				expect(string).toBeVisible();
			});
			describe('there will be an additional icon to check the availability', () => {
				test('the icon is arrow down by default', async () => {
					const email = 'mail@mail.com';
					const start = new Date();
					const end = start.setUTCHours(15, 30, 0, 0);
					const customResponse = [
						{
							f: [
								{ s: start.setUTCHours(0, 0, 0, 0), e: start.setUTCHours(14, 59, 59, 999) },
								{ s: start.setUTCHours(15, 0, 0, 1), e: start.setUTCHours(23, 59, 59, 999) }
							],
							b: [{ s: start.setUTCHours(15, 0, 0, 0), e: start.setUTCHours(15, 30, 0, 0) }],
							id: email
						}
					];
					const getFreeBusyHandler = jest.spyOn(getFreeBusyResponseHandler, 'getFreeBusyRequest');

					handleGetFreeBusy(customResponse);

					setupTest(
						<AvailabilityChecker
							email={email}
							start={start.getTime()}
							end={end}
							allDay={false}
							rootId={'1'}
						/>
					);

					await waitFor(() => {
						expect(getFreeBusyHandler).toHaveBeenCalledTimes(1);
					});
					const chevronDownOutline = screen.getByTestId(/icon: ChevronDownOutline/i);

					expect(chevronDownOutline).toBeVisible();
				});
				describe(' clicking on the arrow down icon', () => {
					test('the icon will change into arrow up', async () => {
						const email = 'mail@mail.com';
						const start = new Date();
						const end = start.setUTCHours(15, 30, 0, 0);
						const customResponse = [
							{
								f: [
									{ s: start.setUTCHours(0, 0, 0, 0), e: start.setUTCHours(14, 59, 59, 999) },
									{ s: start.setUTCHours(15, 0, 0, 1), e: start.setUTCHours(23, 59, 59, 999) }
								],
								b: [{ s: start.setUTCHours(15, 0, 0, 0), e: start.setUTCHours(15, 30, 0, 0) }],
								id: email
							}
						];
						const getFreeBusyHandler = jest.spyOn(getFreeBusyResponseHandler, 'getFreeBusyRequest');
						const store = configureStore({ reducer: combineReducers(reducers) });
						handleGetFreeBusy(customResponse);
						const { user } = setupTest(
							<AvailabilityChecker
								email={email}
								start={start.getTime()}
								end={end}
								allDay={false}
								rootId={'1'}
							/>,
							{ store }
						);

						await waitFor(() => {
							expect(getFreeBusyHandler).toHaveBeenCalledTimes(1);
						});
						const chevronDownOutline = screen.getByTestId(/icon: ChevronDownOutline/i);

						await user.click(chevronDownOutline);

						const chevronUpOutline = screen.getByTestId(/icon: ChevronUpOutline/i);
						expect(chevronUpOutline).toBeVisible();
					});
					test('will show the appointment card container', async () => {
						const email = 'mail@mail.com';
						const start = new Date();
						const end = start.setUTCHours(15, 30, 0, 0);
						const customResponse = [
							{
								f: [
									{ s: start.setUTCHours(0, 0, 0, 0), e: start.setUTCHours(14, 59, 59, 999) },
									{ s: start.setUTCHours(15, 0, 0, 1), e: start.setUTCHours(23, 59, 59, 999) }
								],
								b: [{ s: start.setUTCHours(15, 0, 0, 0), e: start.setUTCHours(15, 30, 0, 0) }],
								id: email
							}
						];
						const getFreeBusyHandler = jest.spyOn(getFreeBusyResponseHandler, 'getFreeBusyRequest');

						handleGetFreeBusy(customResponse);
						const store = configureStore({ reducer: combineReducers(reducers) });
						const { user } = setupTest(
							<AvailabilityChecker
								email={email}
								start={start.getTime()}
								end={end}
								allDay={false}
								rootId={'1'}
							/>,
							{ store }
						);

						await waitFor(() => {
							expect(getFreeBusyHandler).toHaveBeenCalledTimes(1);
						});
						const chevronDownOutline = screen.getByTestId(/icon: ChevronDownOutline/i);

						await user.click(chevronDownOutline);

						const appointmentCardContainer = screen.getByTestId(/ShimmerContainer/i);
						expect(appointmentCardContainer).toBeVisible();
					});
				});
			});
		});
	});
});
