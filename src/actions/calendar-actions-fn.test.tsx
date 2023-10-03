/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { waitFor } from '@testing-library/react';
import { rest } from 'msw';

import {
	deleteCalendar,
	editCalendar,
	emptyTrash,
	moveToRoot,
	newCalendar,
	removeFromList,
	shareCalendar,
	shareCalendarUrl,
	sharesInfo
} from './calendar-actions-fn';
import { getSetupServer } from '../carbonio-ui-commons/test/jest-setup';
import mockedData from '../test/generators';

afterEach(() => {
	getSetupServer().resetHandlers();
});

const FOLDER_ACTION_REQUEST_PATH = '/service/soap/FolderActionRequest';

describe('calendar-actions-fn', () => {
	test('new calendar fn on click create modal is called once', () => {
		const createModal = jest.fn();
		const item = { id: '10' };
		const newCalendarFn = newCalendar({ createModal, item });
		newCalendarFn();
		expect(createModal).toHaveBeenCalledTimes(1);
	});
	describe('move to root fn - on click request to backend to move the folder under the root', () => {
		test('when the request is successful it creates an info snackbar', async () => {
			const createSnackbar = jest.fn();
			const item = { id: '10' };
			const moveToRootFn = moveToRoot({ createSnackbar, item });
			await moveToRootFn();
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
				rest.post(FOLDER_ACTION_REQUEST_PATH, async (req, res, ctx) =>
					res(
						ctx.json({
							Body: {
								Fault: {}
							}
						})
					)
				)
			);
			const createSnackbar = jest.fn();
			const item = { id: '10' };
			const moveToRootFn = moveToRoot({ createSnackbar, item });
			await moveToRootFn();
			await waitFor(() => {
				expect(createSnackbar).toHaveBeenCalledTimes(1);
			});
			expect(createSnackbar).toHaveBeenCalledWith(
				expect.objectContaining({
					type: 'error',
					label: 'label.error_try_again'
				})
			);
		});
	});
	test('empty trash fn', () => {
		const createModal = jest.fn();
		const item = { id: '10' };
		const emptyTrashFn = emptyTrash({ createModal, item });
		emptyTrashFn();
		expect(createModal).toHaveBeenCalledTimes(1);
	});
	test('edit calendar fn', () => {
		const createModal = jest.fn();
		const item = { id: '10' };
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
			const item = { id: '10' };
			const removeFromListFn = removeFromList({ createSnackbar, item });
			await removeFromListFn();
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
				rest.post(FOLDER_ACTION_REQUEST_PATH, async (req, res, ctx) =>
					res(
						ctx.json({
							Body: {
								Fault: {}
							}
						})
					)
				)
			);
			const createSnackbar = jest.fn();
			const item = { id: '10' };
			const removeFromListFn = removeFromList({ createSnackbar, item });
			await removeFromListFn();
			await waitFor(() => {
				expect(createSnackbar).toHaveBeenCalledTimes(1);
			});
			expect(createSnackbar).toHaveBeenCalledWith(
				expect.objectContaining({
					type: 'error',
					label: 'label.error_try_again'
				})
			);
		});
	});
	describe('shares info fn', () => {
		test('Characterization test - if response received does not contain links the creatModal is not called', () => {
			const createModal = jest.fn();
			const item = { id: '10' };
			const sharesInfoFn = sharesInfo({ createModal, item });
			sharesInfoFn();
			expect(createModal).toHaveBeenCalledTimes(0);
		});
		test('Characterization test - if request fails the creatModal is not called and a snackbar is not created', () => {
			const createModal = jest.fn();
			getSetupServer().use(
				rest.post(FOLDER_ACTION_REQUEST_PATH, async (req, res, ctx) =>
					res(
						ctx.json({
							Body: {
								Fault: {}
							}
						})
					)
				)
			);
			const item = { id: '10' };
			const sharesInfoFn = sharesInfo({ createModal, item });
			sharesInfoFn();
			expect(createModal).toHaveBeenCalledTimes(0);
		});
		test('when the request is successful it calls creatModal once and snackbar is not created', async () => {
			const createModal = jest.fn();
			const createSnackBar = jest.fn();
			const item = { id: '10' };

			getSetupServer().use(
				rest.post('/service/soap/GetFolderRequest', async (req, res, ctx) =>
					res(
						ctx.json({
							Body: {
								GetFolderResponse: {
									link: [item]
								}
							}
						})
					)
				)
			);

			const sharesInfoFn = sharesInfo({ createModal, item });
			await sharesInfoFn();
			await waitFor(() => {
				expect(createModal).toHaveBeenCalledTimes(1);
			});
			expect(createSnackBar).toHaveBeenCalledTimes(0);
		});
	});
	test('shares calendar fn on click create modal is called once', () => {
		const createModal = jest.fn();
		const item = mockedData.calendars.getCalendar();
		const shareCalendarFn = shareCalendar({ createModal, item });
		shareCalendarFn();
		expect(createModal).toHaveBeenCalledTimes(1);
	});
	test('shares calendar url fn  on click create modal is called once', () => {
		const createModal = jest.fn();
		const item = { name: 'calendar' };
		const shareCalendarUrlFn = shareCalendarUrl({ createModal, item });
		shareCalendarUrlFn();
		expect(createModal).toHaveBeenCalledTimes(1);
	});
});
