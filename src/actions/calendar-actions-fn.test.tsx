/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { act, waitFor } from '@testing-library/react';
import { FOLDERS } from '@zextras/carbonio-shell-ui';
import { http, HttpResponse } from 'msw';

import {
	deleteCalendar,
	editCalendar,
	emptyTrash,
	findShares,
	moveToRoot,
	newCalendar,
	removeFromList,
	shareCalendar,
	shareCalendarUrl,
	sharesInfo
} from './calendar-actions-fn';
import { getSetupServer } from '../carbonio-ui-commons/test/jest-setup';
import mockedData from '../test/generators';

const FOLDER_ACTION_REQUEST_PATH = '/service/soap/FolderActionRequest';

describe('calendar-actions-fn', () => {
	test('new calendar fn on click create modal is called once', () => {
		const createModal = jest.fn();
		const item = { id: FOLDERS.CALENDAR };
		const newCalendarFn = newCalendar({ createModal, item });
		newCalendarFn();
		expect(createModal).toHaveBeenCalledTimes(1);
	});
	describe('move to root fn - on click request to backend to move the folder under the root', () => {
		test('when the request is successful it creates an info snackbar', async () => {
			const createSnackbar = jest.fn();
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
					type: 'info',
					label: 'message.snackbar.calendar_moved_to_root_folder'
				})
			);
		});
		test('when the request fails, it creates an error snackbar', async () => {
			getSetupServer().use(
				http.post(FOLDER_ACTION_REQUEST_PATH, async () =>
					HttpResponse.json({
						Body: {
							Fault: {}
						}
					})
				)
			);
			const createSnackbar = jest.fn();
			const item = { id: FOLDERS.CALENDAR };
			const moveToRootFn = moveToRoot({ createSnackbar, item });
			await act(async () => moveToRootFn());
			await waitFor(() => {
				expect(createSnackbar).toHaveBeenCalledTimes(1);
			});
			expect(createSnackbar).toHaveBeenCalledWith(
				expect.objectContaining({
					type: 'error',
					label: 'label.error_try_again'
				})
			);
			getSetupServer().resetHandlers();
		});
	});
	test('empty trash fn', () => {
		const createModal = jest.fn();
		const item = { id: FOLDERS.CALENDAR };
		const emptyTrashFn = emptyTrash({ createModal, item });
		emptyTrashFn();
		expect(createModal).toHaveBeenCalledTimes(1);
	});
	test('edit calendar fn', () => {
		const createModal = jest.fn();
		const item = { id: FOLDERS.CALENDAR };
		const editCalendarFn = editCalendar({ createModal, item });
		editCalendarFn();
		expect(createModal).toHaveBeenCalledTimes(1);
	});
	test('delete calendar fn', () => {
		const createModal = jest.fn();
		const item = mockedData.calendars.getCalendar();
		const deleteCalendarFn = deleteCalendar({ createModal, item });
		deleteCalendarFn();
		expect(createModal).toHaveBeenCalledTimes(1);
	});
	describe('on click request to backend should remove the folder mountpoint', () => {
		test('when the request is successful it creates an info snackbar', async () => {
			const createSnackbar = jest.fn();
			const item = { id: FOLDERS.CALENDAR };
			const removeFromListFn = removeFromList({ createSnackbar, item });
			await act(async () => removeFromListFn());
			await waitFor(() => {
				expect(createSnackbar).toHaveBeenCalledTimes(1);
			});
			expect(createSnackbar).toHaveBeenCalledWith(
				expect.objectContaining({
					type: 'info',
					label: 'message.snackbar.shared_calendar_removed'
				})
			);
		});
		test('when the request fails, it creates an error snackbar', async () => {
			getSetupServer().use(
				http.post(FOLDER_ACTION_REQUEST_PATH, async () =>
					HttpResponse.json({
						Body: {
							Fault: {}
						}
					})
				)
			);
			const createSnackbar = jest.fn();
			const item = { id: FOLDERS.CALENDAR };
			const removeFromListFn = removeFromList({ createSnackbar, item });
			await act(async () => removeFromListFn());
			await waitFor(() => {
				expect(createSnackbar).toHaveBeenCalledTimes(1);
			});
			expect(createSnackbar).toHaveBeenCalledWith(
				expect.objectContaining({
					type: 'error',
					label: 'label.error_try_again'
				})
			);
			getSetupServer().resetHandlers();
		});
	});
	describe('shares info fn', () => {
		test('Characterization test - if response received does not contain links the creatModal is not called and no action is performed', () => {
			const createModal = jest.fn();
			const item = { id: FOLDERS.CALENDAR };
			const sharesInfoFn = sharesInfo({ createModal, item });
			sharesInfoFn();
			expect(createModal).toHaveBeenCalledTimes(0);
		});
		test('Characterization test - if request fails the creatModal is not called and no action is performed', () => {
			const createModal = jest.fn();
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
			const sharesInfoFn = sharesInfo({ createModal, item });
			sharesInfoFn();
			expect(createModal).toHaveBeenCalledTimes(0);
		});
		test('when the request is successful it calls creatModal once', async () => {
			const createModal = jest.fn();
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

			const sharesInfoFn = sharesInfo({ createModal, item });
			await act(async () => sharesInfoFn());
			await waitFor(() => {
				expect(createModal).toHaveBeenCalledTimes(1);
			});
			getSetupServer().resetHandlers();
		});
	});
	test('shares calendar fn on click create modal is called once', () => {
		const createModal = jest.fn();
		const item = mockedData.calendars.getCalendar();
		const shareCalendarFn = shareCalendar({ createModal, item });
		shareCalendarFn();
		expect(createModal).toHaveBeenCalledTimes(1);
	});
	test('shares calendar url fn on click create modal is called once', () => {
		const createModal = jest.fn();
		const item = { name: 'calendar' };
		const shareCalendarUrlFn = shareCalendarUrl({ createModal, item });
		shareCalendarUrlFn();
		expect(createModal).toHaveBeenCalledTimes(1);
	});
	test('find shares fn on click create modal is called once', async () => {
		const createModal = jest.fn();
		const findSharesFn = findShares({ createModal });
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
		const createModal = jest.fn();
		const findSharesFn = findShares({ createModal });
		findSharesFn();
		await waitFor(() => {
			expect(createModal).toHaveBeenCalledTimes(0);
		});
	});
});
