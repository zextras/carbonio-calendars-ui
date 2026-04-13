/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { act, waitFor } from '@testing-library/react';
import { FOLDERS } from '@zextras/carbonio-ui-commons';
import { http, HttpResponse } from 'msw';

import {
	addIcsFromUrl,
	deleteCaldavCalendar,
	deleteCalendar,
	editCaldavCalendar,
	editCalendar,
	emptyTrash,
	findShares,
	moveToRoot,
	newCalendar,
	removeFromList,
	shareCalendar,
	syncCaldavCalendar,
	syncExternalCalendar,
	sharesInfo
} from './calendar-actions-fn';
import mockedData from '../test/generators';
import { getSetupServer } from '@jest-setup';

const FOLDER_ACTION_REQUEST_PATH = '/service/soap/FolderActionRequest';

describe('calendar-actions-fn', () => {
	test('new calendar fn on click create modal is called once', () => {
		const createModal = vi.fn();
		const closeModal = vi.fn();
		const item = { id: FOLDERS.CALENDAR };
		const newCalendarFn = newCalendar({ createModal, closeModal, item });
		newCalendarFn();
		expect(createModal).toHaveBeenCalledTimes(1);
	});
	describe('move to root fn - on click request to backend to move the folder under the root', () => {
		test('when the request is successful it creates an info snackbar', async () => {
			const createSnackbar = vi.fn();
			const item = { id: FOLDERS.CALENDAR };
			const moveToRootFn = moveToRoot({ createSnackbar, item });
			await act(async () => {
				moveToRootFn();
			});
			await waitFor(() => {
				expect(createSnackbar).toHaveBeenCalledTimes(1);
			});
			expect(createSnackbar).toHaveBeenCalledWith(
				expect.objectContaining({
					severity: 'info',
					label: 'message.snackbar.calendar_moved_to_root_folder'
				})
			);
		});
		test('when the request fails, it creates an error snackbar', async () => {
			// disable console.warn raised by soapFetch
			vi.spyOn(console, 'warn').mockImplementation(vi.fn());
			getSetupServer().use(
				http.post(FOLDER_ACTION_REQUEST_PATH, async () =>
					HttpResponse.json({
						Body: {
							Fault: {}
						}
					})
				)
			);
			const createSnackbar = vi.fn();
			const item = { id: FOLDERS.CALENDAR };
			const moveToRootFn = moveToRoot({ createSnackbar, item });
			await act(async () => moveToRootFn());
			await waitFor(() => {
				expect(createSnackbar).toHaveBeenCalledTimes(1);
			});
			expect(createSnackbar).toHaveBeenCalledWith(
				expect.objectContaining({
					severity: 'error',
					// eslint-disable-next-line
					label: 'label.error_try_again'
				})
			);
			getSetupServer().resetHandlers();
		});
	});

	test('empty trash fn', () => {
		const createModal = vi.fn();
		const closeModal = vi.fn();
		const emptyTrashFn = emptyTrash({ createModal, closeModal });
		emptyTrashFn();
		expect(createModal).toHaveBeenCalledTimes(1);
	});

	test('add ics from url fn', () => {
		const createModal = vi.fn();
		const closeModal = vi.fn();
		const addIcsFromUrlFn = addIcsFromUrl({ createModal, closeModal });
		addIcsFromUrlFn();
		expect(createModal).toHaveBeenCalledTimes(1);
	});

	test('edit calendar fn', () => {
		const createModal = vi.fn();
		const closeModal = vi.fn();
		const item = { id: FOLDERS.CALENDAR };
		const editCalendarFn = editCalendar({ createModal, closeModal, item });
		editCalendarFn();
		expect(createModal).toHaveBeenCalledTimes(1);
	});

	test('delete calendar fn', () => {
		const createModal = vi.fn();
		const closeModal = vi.fn();
		const item = mockedData.calendars.getCalendar();
		const deleteCalendarFn = deleteCalendar({ createModal, closeModal, item });
		deleteCalendarFn();
		expect(createModal).toHaveBeenCalledTimes(1);
	});

	describe('on click request to backend should remove the folder mountpoint', () => {
		test('when the request is successful it creates an info snackbar', async () => {
			const createSnackbar = vi.fn();
			const item = { id: FOLDERS.CALENDAR };
			const removeFromListFn = removeFromList({ createSnackbar, item });
			await act(async () => removeFromListFn());
			await waitFor(() => {
				expect(createSnackbar).toHaveBeenCalledTimes(1);
			});
			expect(createSnackbar).toHaveBeenCalledWith(
				expect.objectContaining({
					severity: 'info',
					label: 'message.snackbar.shared_calendar_removed'
				})
			);
		});

		test('when the request fails, it creates an error snackbar', async () => {
			// disable console.warn raised by soapFetch
			vi.spyOn(console, 'warn').mockImplementation(vi.fn());
			getSetupServer().use(
				http.post(FOLDER_ACTION_REQUEST_PATH, async () =>
					HttpResponse.json({
						Body: {
							Fault: {}
						}
					})
				)
			);
			const createSnackbar = vi.fn();
			const item = { id: FOLDERS.CALENDAR };
			const removeFromListFn = removeFromList({ createSnackbar, item });
			await act(async () => removeFromListFn());
			await waitFor(() => {
				expect(createSnackbar).toHaveBeenCalledTimes(1);
			});
			expect(createSnackbar).toHaveBeenCalledWith(
				expect.objectContaining({
					severity: 'error',
					label: 'label.error_try_again'
				})
			);
			getSetupServer().resetHandlers();
		});
	});

	describe('shares info fn', () => {
		test('Characterization test - if response received does not contain links the creatModal is not called and no action is performed', () => {
			const createModal = vi.fn();
			const closeModal = vi.fn();
			const item = { id: FOLDERS.CALENDAR };
			const sharesInfoFn = sharesInfo({ createModal, closeModal, item });
			sharesInfoFn();
			expect(createModal).toHaveBeenCalledTimes(0);
		});
		test('Characterization test - if request fails the creatModal is not called and no action is performed', () => {
			const createModal = vi.fn();
			const closeModal = vi.fn();
			getSetupServer().use(
				http.post(FOLDER_ACTION_REQUEST_PATH, async () =>
					HttpResponse.json({
						Body: {
							Fault: {}
						}
					})
				)
			);
			const item = { id: FOLDERS.CALENDAR };
			const sharesInfoFn = sharesInfo({ createModal, closeModal, item });
			sharesInfoFn();
			expect(createModal).toHaveBeenCalledTimes(0);
		});
		test('when the request is successful it calls creatModal once', async () => {
			const createModal = vi.fn();
			const closeModal = vi.fn();
			const item = { id: FOLDERS.CALENDAR };

			getSetupServer().use(
				http.post('/service/soap/GetFolderRequest', async () =>
					HttpResponse.json({
						Body: {
							GetFolderResponse: {
								link: [item]
							}
						}
					})
				)
			);

			const sharesInfoFn = sharesInfo({ createModal, closeModal, item });
			await act(async () => sharesInfoFn());
			await waitFor(() => {
				expect(createModal).toHaveBeenCalledTimes(1);
			});
			getSetupServer().resetHandlers();
		});
	});
	test('shares calendar fn on click create modal is called once', () => {
		const createModal = vi.fn();
		const closeModal = vi.fn();
		const item = mockedData.calendars.getCalendar();
		const shareCalendarFn = shareCalendar({ createModal, closeModal, item });
		shareCalendarFn();
		expect(createModal).toHaveBeenCalledTimes(1);
	});
	test('find shares fn on click create modal is called once', async () => {
		const createModal = vi.fn();
		const closeModal = vi.fn();
		const findSharesFn = findShares({ createModal, closeModal });
		await act(async () => findSharesFn());
		await waitFor(() => {
			expect(createModal).toHaveBeenCalledTimes(1);
		});
	});
	test('find shares fn on click if response is empty create modal is not called', async () => {
		getSetupServer().use(
			http.post('/service/soap/GetShareInfoRequest', async () =>
				HttpResponse.json({
					Body: {
						GetShareInfoResponse: {}
					}
				})
			)
		);
		const createModal = vi.fn();
		const closeModal = vi.fn();
		const findSharesFn = findShares({ createModal, closeModal });
		findSharesFn();
		await waitFor(() => {
			expect(createModal).toHaveBeenCalledTimes(0);
		});
	});

	test('sync external calendar fn shows success snackbar', async () => {
		const createSnackbar = vi.fn();
		const item = { id: FOLDERS.CALENDAR };
		const syncExternalCalendarFn = syncExternalCalendar({ createSnackbar, item });

		await act(async () => syncExternalCalendarFn());
		expect(createSnackbar).toHaveBeenCalledWith(
			expect.objectContaining({
				severity: 'info',
				label: 'message.snackbar.external_calendar_syncing'
			})
		);
		await waitFor(() => {
			expect(createSnackbar).toHaveBeenCalledWith(
				expect.objectContaining({
					severity: 'success',
					label: 'message.snackbar.external_calendar_synced'
				})
			);
		});
	});

	test('sync external calendar fn shows error snackbar when backend returns Fault', async () => {
		// disable console.warn raised by soapFetch
		vi.spyOn(console, 'warn').mockImplementation(vi.fn());
		getSetupServer().use(
			http.post(FOLDER_ACTION_REQUEST_PATH, async () =>
				HttpResponse.json({
					Body: {
						Fault: {}
					}
				})
			)
		);

		const createSnackbar = vi.fn();
		const item = { id: FOLDERS.CALENDAR };
		const syncExternalCalendarFn = syncExternalCalendar({ createSnackbar, item });

		await act(async () => syncExternalCalendarFn());

		expect(createSnackbar).toHaveBeenCalledWith(
			expect.objectContaining({
				severity: 'info',
				label: 'message.snackbar.external_calendar_syncing'
			})
		);

		await waitFor(() => {
			expect(createSnackbar).toHaveBeenCalledWith(
				expect.objectContaining({
					severity: 'error',
					label: 'label.error_try_again'
				})
			);
		});

		expect(createSnackbar).not.toHaveBeenCalledWith(
			expect.objectContaining({
				severity: 'success',
				label: 'message.snackbar.external_calendar_synced'
			})
		);

		getSetupServer().resetHandlers();
	});

	test('sync caldav calendar shows error when datasource id is missing', async () => {
		const createSnackbar = vi.fn();
		const item = { id: FOLDERS.CALENDAR };
		const syncCaldavCalendarFn = syncCaldavCalendar({ createSnackbar, item });

		await act(async () => syncCaldavCalendarFn());

		expect(createSnackbar).toHaveBeenCalledWith(
			expect.objectContaining({
				severity: 'error',
				label: 'label.error_try_again'
			})
		);
	});

	test('edit caldav calendar fn on click create modal is called once', () => {
		const createModal = vi.fn();
		const closeModal = vi.fn();
		const item = { id: '99', dsId: '10' };
		const editCaldavCalendarFn = editCaldavCalendar({ createModal, closeModal, item });
		editCaldavCalendarFn();
		expect(createModal).toHaveBeenCalledTimes(1);
	});

	test('delete caldav calendar fn on click create modal is called once', () => {
		const createModal = vi.fn();
		const closeModal = vi.fn();
		const item = { id: '99', name: 'My CalDAV', dsId: '10' };
		const deleteCaldavCalendarFn = deleteCaldavCalendar({ createModal, closeModal, item });
		deleteCaldavCalendarFn();
		expect(createModal).toHaveBeenCalledTimes(1);
	});
});
