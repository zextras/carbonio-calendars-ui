// noinspection HttpUrlsUsage
/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { waitFor } from '@testing-library/react';
import { JSNS } from '@zextras/carbonio-shell-ui';
import { FOLDERS, useFolderStore } from '@zextras/carbonio-ui-commons';

import { AddExternalCalendarModal } from './add-external-calendar-modal';
import * as createDataSourceApi from '../../soap/create-data-source-request';
import * as createFolderApi from '../../soap/create-folder-request';
import * as getImportStatusApi from '../../soap/get-import-status-request';
import * as importDataApi from '../../soap/import-data-request';
import { setupTest, screen } from '@test-setup';
import { generateFolder } from '@test-utils/folders/folders-generator';
import { populateFoldersStore } from '@test-utils/store/folders';
import { CreateFolderResponse } from 'types/soap/createFolder';

const TYPE_LABEL = 'Type*';
const URL_LABEL = 'Calendar URL*';
const CALENDAR_NAME_LABEL = 'Calendar name*';
const VALID_ICS_URL = 'https://a/1.ics';
const VALID_CALDAV_HOST = 'https://caldav.example.com';

describe('AddExternalCalendarModal', () => {
	describe('ICS type', () => {
		test('enables add button when a valid ics url and calendar name are provided', async () => {
			const { user } = setupTest(<AddExternalCalendarModal onClose={vi.fn()} />);
			await user.type(screen.getByRole('textbox', { name: URL_LABEL }), VALID_ICS_URL);
			await user.type(screen.getByRole('textbox', { name: CALENDAR_NAME_LABEL }), 'My ICS');
			expect(screen.getByRole('button', { name: 'Add' })).toBeEnabled();
		});
		test('shows protocol error when url does not start with http or https', async () => {
			const { user } = setupTest(<AddExternalCalendarModal onClose={vi.fn()} />);
			await user.type(screen.getByRole('textbox', { name: URL_LABEL }), 'a.b');
			expect(screen.getByText("The URL should begin with 'http://' or 'https://'")).toBeVisible();
			expect(screen.getByRole('button', { name: 'Add' })).toBeDisabled();
		});
		test('accepts a valid https url that does not end with .ics', async () => {
			const { user } = setupTest(<AddExternalCalendarModal onClose={vi.fn()} />);
			await user.pasteInto(
				screen.getByRole('textbox', { name: URL_LABEL }),
				'https://example.com/calendar'
			);
			expect(
				screen.queryByText('Invalid URL. Make sure it links directly to an .ics calendar file')
			).not.toBeInTheDocument();
		});

		test('shows sync info text when a valid ics url is entered', async () => {
			const { user } = setupTest(<AddExternalCalendarModal onClose={vi.fn()} />);
			await user.type(screen.getByRole('textbox', { name: URL_LABEL }), VALID_ICS_URL);
			expect(
				screen.getByText('This calendar will be read-only and will sync every 12 hours')
			).toBeVisible();
		});
		test('shows duplicate calendar url error when same ics url already exists', async () => {
			const existingUrl = 'https://existing.com/calendar.ics';
			const folderWithUrl = generateFolder({ view: 'appointment' });
			populateFoldersStore({ customFolders: [folderWithUrl] });
			useFolderStore.setState((state) => ({
				folders: {
					...state.folders,
					[folderWithUrl.id]: { ...folderWithUrl, url: existingUrl }
				}
			}));
			const { user } = setupTest(<AddExternalCalendarModal onClose={vi.fn()} />);
			await user.type(screen.getByRole('textbox', { name: URL_LABEL }), existingUrl);
			expect(screen.getByText('A calendar with the same URL has already been added')).toBeVisible();
			expect(screen.getByRole('button', { name: 'Add' })).toBeDisabled();
		});
		test('submits CreateFolderRequest with ICS URL payload on add', async () => {
			const createFolderRequestSpy = vi
				.spyOn(createFolderApi, 'createFolderRequest')
				.mockResolvedValue({
					_jsns: 'urn:zimbraMail',
					folder: [
						{
							id: '123',
							uuid: 'abc-123',
							name: 'x',
							activesyncdisabled: false,
							recursive: false,
							deletable: false
						}
					]
				});
			const onClose = vi.fn();
			const { user } = setupTest(<AddExternalCalendarModal onClose={onClose} />);
			await user.type(screen.getByRole('textbox', { name: URL_LABEL }), VALID_ICS_URL);
			await user.type(screen.getByRole('textbox', { name: CALENDAR_NAME_LABEL }), 'x');
			await user.click(screen.getByRole('button', { name: 'Add' }));
			await waitFor(() => {
				expect(createFolderRequestSpy).toHaveBeenCalledWith({
					l: '1',
					name: 'x',
					url: VALID_ICS_URL,
					rgb: '#000000',
					f: '#',
					view: 'appointment',
					sync: 0
				});
			});
			await waitFor(() => {
				expect(onClose).toHaveBeenCalledTimes(1);
			});
		});
	});
	describe('CalDAV type', () => {
		const selectCalDav = async (user: ReturnType<typeof setupTest>['user']): Promise<void> => {
			await user.click(screen.getByText('ICS'));
			await user.click(screen.getByText('CalDAV'));
		};

		beforeEach(() => {
			// triggerCaldavSync polls getImportStatus after importData resolves.
			// Individual tests that don't care about polling behavior mock it with a
			// never-settling promise so the polling hangs silently without causing
			// unhandled-rejection noise.
			vi.spyOn(getImportStatusApi, 'getImportStatusRequest').mockReturnValue(
				// eslint-disable-next-line @typescript-eslint/no-empty-function
				new Promise(() => {})
			);
		});

		test('shows caldav-specific fields when CalDAV type is selected', async () => {
			const { user } = setupTest(<AddExternalCalendarModal onClose={vi.fn()} />);
			await selectCalDav(user);

			expect(
				screen.getByRole('textbox', { name: 'Host address (calendar.example.com)*' })
			).toBeVisible();
			expect(screen.getByRole('textbox', { name: 'Calendars’ name*' })).toBeVisible();
			expect(screen.getByText('This host does not require credentials')).toBeVisible();
			expect(screen.getByRole('textbox', { name: 'Username*' })).toBeVisible();
			// PasswordInput renders as type="password", query by label text
			expect(screen.getByLabelText('Password*')).toBeVisible();
		});

		test('add button is disabled when host, folder name, and username are filled but password is missing', async () => {
			const { user } = setupTest(<AddExternalCalendarModal onClose={vi.fn()} />);
			await selectCalDav(user);

			await user.pasteInto(
				screen.getByRole('textbox', { name: 'Host address (calendar.example.com)*' }),
				VALID_CALDAV_HOST
			);
			await user.pasteInto(
				screen.getByRole('textbox', { name: 'Calendars’ name*' }),
				'My Calendars'
			);
			await user.pasteInto(screen.getByRole('textbox', { name: 'Username*' }), 'user@example.com');

			expect(screen.getByRole('button', { name: 'Add' })).toBeDisabled();
		});

		test('add button is enabled when host, folder name, username and password are filled', async () => {
			const { user } = setupTest(<AddExternalCalendarModal onClose={vi.fn()} />);
			await selectCalDav(user);

			// Use pasteInto instead of type to avoid simulating one keypress at a time
			await user.pasteInto(
				screen.getByRole('textbox', { name: 'Host address (calendar.example.com)*' }),
				VALID_CALDAV_HOST
			);
			await user.pasteInto(
				screen.getByRole('textbox', { name: 'Calendars’ name*' }),
				'My Calendars'
			);
			await user.pasteInto(screen.getByRole('textbox', { name: 'Username*' }), 'user@example.com');
			// PasswordInput renders as type="password", query by label text
			await user.pasteInto(screen.getByLabelText('Password*'), 'secret');

			expect(screen.getByRole('button', { name: 'Add' })).toBeEnabled();
		});

		test('checking "no credentials" disables password field only', async () => {
			const { user } = setupTest(<AddExternalCalendarModal onClose={vi.fn()} />);
			await selectCalDav(user);

			expect(screen.getByRole('textbox', { name: 'Username*' })).toBeVisible();
			expect(screen.getByLabelText('Password*')).toBeEnabled();

			await user.click(screen.getByText('This host does not require credentials'));

			expect(screen.getByRole('textbox', { name: 'Username*' })).toBeVisible();
			expect(screen.getByLabelText('Password*')).toBeDisabled();
		});

		test('add button is enabled when "no credentials" is checked and host and folder name are filled', async () => {
			const { user } = setupTest(<AddExternalCalendarModal onClose={vi.fn()} />);
			await selectCalDav(user);

			await user.pasteInto(
				screen.getByRole('textbox', { name: 'Host address (calendar.example.com)*' }),
				VALID_CALDAV_HOST
			);
			await user.pasteInto(
				screen.getByRole('textbox', { name: 'Calendars’ name*' }),
				'My Calendars'
			);
			await user.pasteInto(screen.getByRole('textbox', { name: 'Username*' }), 'user@example.com');
			await user.click(screen.getByText('This host does not require credentials'));

			expect(screen.getByRole('button', { name: 'Add' })).toBeEnabled();
		});

		test('submits CreateFolderRequest then CreateDataSourceRequest with credentials on add', async () => {
			const folderResponse: CreateFolderResponse = {
				_jsns: 'urn:zimbraMail',
				folder: [
					{
						id: '42',
						uuid: 'abc-42',
						name: 'My CalDAV',
						activesyncdisabled: false,
						recursive: false,
						deletable: false
					}
				]
			};

			const createFolderSpy = vi
				.spyOn(createFolderApi, 'createFolderRequest')
				.mockResolvedValue(folderResponse);
			const testDataSourceSpy = vi
				.spyOn(createDataSourceApi, 'testCalDavDataSourceRequest')
				.mockResolvedValue({ _jsns: 'urn:zimbraMail', caldav: [{ success: true }] });
			const createDataSourceSpy = vi
				.spyOn(createDataSourceApi, 'createCalDavDataSourceRequest')
				.mockResolvedValue({ _jsns: 'urn:zimbraMail', caldav: [{ id: 'ds-42' }] });
			const importDataSpy = vi
				.spyOn(importDataApi, 'importDataRequest')
				.mockResolvedValue({ _jsns: 'urn:zimbraMail' });
			const onClose = vi.fn();

			const { user } = setupTest(<AddExternalCalendarModal onClose={onClose} />);
			await selectCalDav(user);

			await user.pasteInto(
				screen.getByRole('textbox', { name: 'Host address (calendar.example.com)*' }),
				'mailbox1.demo.zextras.io'
			);
			await user.pasteInto(screen.getByRole('textbox', { name: 'Calendars’ name*' }), 'My CalDAV');
			await user.pasteInto(
				screen.getByRole('textbox', { name: 'Username*' }),
				'user@demo.zextras.io'
			);
			await user.pasteInto(screen.getByLabelText('Password*'), 'secret');
			await user.click(screen.getByRole('button', { name: 'Add' }));

			await waitFor(() => {
				expect(testDataSourceSpy).toHaveBeenCalledWith({
					connectionType: 'ssl',
					port: '443',
					name: 'My CalDAV',
					host: 'mailbox1.demo.zextras.io',
					username: 'user@demo.zextras.io',
					password: 'secret',
					a: { n: 'zimbraDataSourceAttribute', _content: 'p:/principals/users/_USERNAME_/' }
				});
			});

			await waitFor(() => {
				expect(createFolderSpy).toHaveBeenCalledWith({
					l: '1',
					name: 'My CalDAV',
					view: 'appointment',
					f: '#'
				});
			});

			await waitFor(() => {
				expect(createDataSourceSpy).toHaveBeenCalledWith({
					connectionType: 'ssl',
					importOnly: '1',
					port: '443',
					name: 'My CalDAV',
					pollingInterval: '12h',
					isEnabled: '1',
					l: '42',
					host: 'mailbox1.demo.zextras.io',
					username: 'user@demo.zextras.io',
					password: 'secret',
					a: { n: 'zimbraDataSourceAttribute', _content: 'p:/principals/users/_USERNAME_/' }
				});
			});

			await waitFor(() => {
				expect(importDataSpy).toHaveBeenCalledWith('ds-42');
			});

			await waitFor(() => {
				expect(onClose).toHaveBeenCalledTimes(1);
			});
		});

		test('submits without credentials when "no credentials" is checked', async () => {
			const folderResponse: CreateFolderResponse = {
				_jsns: 'urn:zimbraMail',
				folder: [
					{
						id: '99',
						uuid: 'abc-99',
						name: 'Public CalDAV',
						activesyncdisabled: false,
						recursive: false,
						deletable: false
					}
				]
			};
			vi.spyOn(createFolderApi, 'createFolderRequest').mockResolvedValue(folderResponse);
			vi.spyOn(createDataSourceApi, 'testCalDavDataSourceRequest').mockResolvedValue({
				_jsns: 'urn:zimbraMail',
				caldav: [{ success: true }]
			});
			const createDataSourceSpy = vi
				.spyOn(createDataSourceApi, 'createCalDavDataSourceRequest')
				.mockResolvedValue({ _jsns: 'urn:zimbraMail', caldav: [{ id: 'ds-99' }] });
			vi.spyOn(importDataApi, 'importDataRequest').mockResolvedValue({ _jsns: 'urn:zimbraMail' });

			const { user } = setupTest(<AddExternalCalendarModal onClose={vi.fn()} />);
			await selectCalDav(user);

			await user.pasteInto(
				screen.getByRole('textbox', { name: 'Host address (calendar.example.com)*' }),
				'public.example.com'
			);
			await user.pasteInto(
				screen.getByRole('textbox', { name: 'Calendars’ name*' }),
				'Public CalDAV'
			);
			await user.pasteInto(screen.getByRole('textbox', { name: 'Username*' }), 'public-user');
			await user.click(screen.getByText('This host does not require credentials'));
			await user.click(screen.getByRole('button', { name: 'Add' }));

			await waitFor(() => {
				expect(createDataSourceSpy).toHaveBeenCalledWith(
					expect.not.objectContaining({ password: expect.anything() })
				);
			});
		});

		test('shows error snackbar and re-enables add button when CalDAV creation fails', async () => {
			const folderResponse: CreateFolderResponse = {
				_jsns: 'urn:zimbraMail',
				folder: [
					{
						id: '77',
						uuid: 'abc-77',
						name: 'Fail CalDAV',
						activesyncdisabled: false,
						recursive: false,
						deletable: false
					}
				]
			};
			vi.spyOn(createFolderApi, 'createFolderRequest').mockResolvedValue(folderResponse);
			vi.spyOn(createDataSourceApi, 'testCalDavDataSourceRequest').mockResolvedValue({
				_jsns: 'urn:zimbraMail',
				caldav: [{ success: true }]
			});
			vi.spyOn(createDataSourceApi, 'createCalDavDataSourceRequest').mockRejectedValue(
				new Error('Network error')
			);

			const { user } = setupTest(<AddExternalCalendarModal onClose={vi.fn()} />);
			await selectCalDav(user);

			await user.pasteInto(
				screen.getByRole('textbox', { name: 'Host address (calendar.example.com)*' }),
				'mailbox1.demo.zextras.io'
			);
			await user.pasteInto(
				screen.getByRole('textbox', { name: 'Calendars’ name*' }),
				'Fail CalDAV'
			);
			await user.pasteInto(screen.getByRole('textbox', { name: 'Username*' }), 'test-user');
			await user.click(screen.getByText('This host does not require credentials'));
			await user.click(screen.getByRole('button', { name: 'Add' }));

			await waitFor(() => {
				expect(screen.getByText('Something went wrong, please try again')).toBeVisible();
			});
			expect(screen.getByRole('button', { name: 'Add' })).toBeEnabled();
		});

		test('shows error snackbar and skips folder creation when TestDataSource fails', async () => {
			const createFolderSpy = vi
				.spyOn(createFolderApi, 'createFolderRequest')
				.mockResolvedValue({ _jsns: 'urn:zimbraMail', folder: [] });
			vi.spyOn(createDataSourceApi, 'testCalDavDataSourceRequest').mockRejectedValue(
				new Error('Auth failed')
			);
			const createDataSourceSpy = vi
				.spyOn(createDataSourceApi, 'createCalDavDataSourceRequest')
				.mockResolvedValue({ _jsns: 'urn:zimbraMail' });

			const { user } = setupTest(<AddExternalCalendarModal onClose={vi.fn()} />);
			await selectCalDav(user);

			await user.pasteInto(
				screen.getByRole('textbox', { name: 'Host address (calendar.example.com)*' }),
				'invalid.example.com'
			);
			await user.pasteInto(screen.getByRole('textbox', { name: 'Calendars’ name*' }), 'Fail Fast');
			await user.pasteInto(screen.getByRole('textbox', { name: 'Username*' }), 'test-user');
			await user.click(screen.getByText('This host does not require credentials'));
			await user.click(screen.getByRole('button', { name: 'Add' }));

			await waitFor(() => {
				expect(screen.getByText('Something went wrong, please try again')).toBeVisible();
			});
			expect(createFolderSpy).not.toHaveBeenCalled();
			expect(createDataSourceSpy).not.toHaveBeenCalled();
			expect(screen.getByRole('button', { name: 'Add' })).toBeEnabled();
		});

		test('shows specific error message when TestDataSource returns 404', async () => {
			const createFolderSpy = vi
				.spyOn(createFolderApi, 'createFolderRequest')
				.mockResolvedValue({ _jsns: 'urn:zimbraMail', folder: [] });
			vi.spyOn(createDataSourceApi, 'testCalDavDataSourceRequest').mockRejectedValue(
				new Error('DAV server returned an error: 404')
			);

			const { user } = setupTest(<AddExternalCalendarModal onClose={vi.fn()} />);
			await selectCalDav(user);
			await user.pasteInto(
				screen.getByRole('textbox', { name: 'Host address (calendar.example.com)*' }),
				'missing.example.com'
			);
			await user.pasteInto(
				screen.getByRole('textbox', { name: 'Calendars’ name*' }),
				'Missing Host'
			);
			await user.pasteInto(screen.getByRole('textbox', { name: 'Username*' }), 'test-user');
			await user.click(screen.getByText('This host does not require credentials'));
			await user.click(screen.getByRole('button', { name: 'Add' }));

			await waitFor(() => {
				expect(
					screen.getByText('Host not found. Make sure the address is correct and try again')
				).toBeVisible();
			});
			expect(screen.getAllByText('This host address could not be reached').length).toBeGreaterThan(
				0
			);
			expect(
				screen.queryByText('Added calendars will be read-only and will sync every 12 hours')
			).not.toBeInTheDocument();
			expect(createFolderSpy).not.toHaveBeenCalled();
		});

		test('clears inline host error when user changes host after a host-related failure', async () => {
			vi.spyOn(createDataSourceApi, 'testCalDavDataSourceRequest').mockRejectedValue(
				new Error('DAV server returned an error: 404')
			);

			const { user } = setupTest(<AddExternalCalendarModal onClose={vi.fn()} />);
			await selectCalDav(user);
			const hostInput = screen.getByRole('textbox', {
				name: 'Host address (calendar.example.com)*'
			});
			await user.pasteInto(hostInput, 'missing.example.com');
			await user.pasteInto(
				screen.getByRole('textbox', { name: 'Calendars’ name*' }),
				'Missing Host'
			);
			await user.pasteInto(screen.getByRole('textbox', { name: 'Username*' }), 'test-user');
			await user.click(screen.getByText('This host does not require credentials'));
			await user.click(screen.getByRole('button', { name: 'Add' }));

			await waitFor(() => {
				expect(
					screen.getByText('Host not found. Make sure the address is correct and try again')
				).toBeVisible();
			});

			await user.clear(hostInput);
			await user.type(hostInput, 'calendar.example.com');

			expect(
				screen.getByText('Added calendars will be read-only and will sync every 12 hours')
			).toBeVisible();
		});

		test('shows specific error message when TestDataSource returns 401', async () => {
			const createFolderSpy = vi
				.spyOn(createFolderApi, 'createFolderRequest')
				.mockResolvedValue({ _jsns: 'urn:zimbraMail', folder: [] });
			vi.spyOn(createDataSourceApi, 'testCalDavDataSourceRequest').mockRejectedValue(
				new Error('DAV server returned an error: 401')
			);

			const { user } = setupTest(<AddExternalCalendarModal onClose={vi.fn()} />);
			await selectCalDav(user);
			await user.pasteInto(
				screen.getByRole('textbox', { name: 'Host address (calendar.example.com)*' }),
				'auth.example.com'
			);
			await user.pasteInto(screen.getByRole('textbox', { name: 'Calendars’ name*' }), 'Auth Host');
			await user.pasteInto(screen.getByRole('textbox', { name: 'Username*' }), 'test-user');
			await user.click(screen.getByText('This host does not require credentials'));
			await user.click(screen.getByRole('button', { name: 'Add' }));

			await waitFor(() => {
				expect(
					screen.getByText('Authentication failed. Please check your username and password')
				).toBeVisible();
			});
			expect(createFolderSpy).not.toHaveBeenCalled();
		});

		test('shows specific error message when TestDataSource returns 50x', async () => {
			const createFolderSpy = vi
				.spyOn(createFolderApi, 'createFolderRequest')
				.mockResolvedValue({ _jsns: 'urn:zimbraMail', folder: [] });
			vi.spyOn(createDataSourceApi, 'testCalDavDataSourceRequest').mockRejectedValue(
				new Error('DAV server returned an error: 503')
			);

			const { user } = setupTest(<AddExternalCalendarModal onClose={vi.fn()} />);
			await selectCalDav(user);
			await user.pasteInto(
				screen.getByRole('textbox', { name: 'Host address (calendar.example.com)*' }),
				'down.example.com'
			);
			await user.pasteInto(
				screen.getByRole('textbox', { name: 'Calendars’ name*' }),
				'Server Down Host'
			);
			await user.pasteInto(screen.getByRole('textbox', { name: 'Username*' }), 'test-user');
			await user.click(screen.getByText('This host does not require credentials'));
			await user.click(screen.getByRole('button', { name: 'Add' }));

			await waitFor(() => {
				expect(screen.getByText('Server is currently unavailable, please try again')).toBeVisible();
			});
			expect(createFolderSpy).not.toHaveBeenCalled();
		});

		test('shows host unreachable message when TestDataSource error has no status code', async () => {
			const createFolderSpy = vi
				.spyOn(createFolderApi, 'createFolderRequest')
				.mockResolvedValue({ _jsns: 'urn:zimbraMail', folder: [] });
			vi.spyOn(createDataSourceApi, 'testCalDavDataSourceRequest').mockRejectedValue(
				new Error('test.com')
			);

			const { user } = setupTest(<AddExternalCalendarModal onClose={vi.fn()} />);
			await selectCalDav(user);
			await user.pasteInto(
				screen.getByRole('textbox', { name: 'Host address (calendar.example.com)*' }),
				'test.com'
			);
			await user.pasteInto(
				screen.getByRole('textbox', { name: 'Calendars’ name*' }),
				'Code-less Error Host'
			);
			await user.pasteInto(screen.getByRole('textbox', { name: 'Username*' }), 'test-user');
			await user.click(screen.getByText('This host does not require credentials'));
			await user.click(screen.getByRole('button', { name: 'Add' }));

			await waitFor(() => {
				expect(
					screen.getByText('Host not found. Make sure the address is correct and try again')
				).toBeVisible();
			});
			expect(screen.getAllByText('This host address could not be reached').length).toBeGreaterThan(
				0
			);
			expect(createFolderSpy).not.toHaveBeenCalled();
		});

		test('shows host unreachable message when TestDataSource error is wrapped', async () => {
			const createFolderSpy = vi
				.spyOn(createFolderApi, 'createFolderRequest')
				.mockResolvedValue({ _jsns: 'urn:zimbraMail', folder: [] });
			vi.spyOn(createDataSourceApi, 'testCalDavDataSourceRequest').mockRejectedValue(
				new Error('Error: test.com')
			);

			const { user } = setupTest(<AddExternalCalendarModal onClose={vi.fn()} />);
			await selectCalDav(user);
			await user.pasteInto(
				screen.getByRole('textbox', { name: 'Host address (calendar.example.com)*' }),
				'test.com'
			);
			await user.pasteInto(
				screen.getByRole('textbox', { name: 'Calendars’ name*' }),
				'Wrapped Error Host'
			);
			await user.pasteInto(screen.getByRole('textbox', { name: 'Username*' }), 'test-user');
			await user.click(screen.getByText('This host does not require credentials'));
			await user.click(screen.getByRole('button', { name: 'Add' }));

			await waitFor(() => {
				expect(
					screen.getByText('Host not found. Make sure the address is correct and try again')
				).toBeVisible();
			});
			expect(screen.getAllByText('This host address could not be reached').length).toBeGreaterThan(
				0
			);
			expect(createFolderSpy).not.toHaveBeenCalled();
		});
		test('shows generic error when TestDataSource returns "illegal character in path" error', async () => {
			const createFolderSpy = vi
				.spyOn(createFolderApi, 'createFolderRequest')
				.mockResolvedValue({ _jsns: 'urn:zimbraMail', folder: [] });
			vi.spyOn(createDataSourceApi, 'testCalDavDataSourceRequest').mockRejectedValue(
				new Error(
					'Illegal character in path at index 52: https://mail.zextras.com:443/principals/users/asdasd asdasdas/'
				)
			);

			const { user } = setupTest(<AddExternalCalendarModal onClose={vi.fn()} />);
			await selectCalDav(user);
			await user.pasteInto(
				screen.getByRole('textbox', { name: 'Host address (calendar.example.com)*' }),
				'mail.zextras.com'
			);
			await user.pasteInto(
				screen.getByRole('textbox', { name: 'Calendars\u2019 name*' }),
				'Illegal Char Host'
			);
			await user.pasteInto(screen.getByRole('textbox', { name: 'Username*' }), 'asdasd asdasdas');
			await user.click(screen.getByText('This host does not require credentials'));
			await user.click(screen.getByRole('button', { name: 'Add' }));

			await waitFor(() => {
				expect(screen.getByText('Something went wrong, please try again')).toBeVisible();
			});
			expect(
				screen.queryByText('Host not found. Make sure the address is correct and try again')
			).not.toBeInTheDocument();
			expect(createFolderSpy).not.toHaveBeenCalled();
		});
	});
	describe('shared behaviour', () => {
		test('shows duplicate calendar name error when name already exists', async () => {
			populateFoldersStore({
				view: 'appointment',
				customFolders: [generateFolder({ name: 'External calendar', view: 'appointment' })]
			});
			const { user } = setupTest(<AddExternalCalendarModal onClose={vi.fn()} />);
			await user.type(screen.getByRole('textbox', { name: URL_LABEL }), VALID_ICS_URL);
			await user.type(
				screen.getByRole('textbox', { name: CALENDAR_NAME_LABEL }),
				'External calendar'
			);
			expect(screen.getByText('A calendar with the same name already exists')).toBeVisible();
			expect(screen.getByRole('button', { name: 'Add' })).toBeDisabled();
		});
		test('add button is disabled when only the url is provided', async () => {
			const { user } = setupTest(<AddExternalCalendarModal onClose={vi.fn()} />);
			await user.type(screen.getByRole('textbox', { name: URL_LABEL }), VALID_ICS_URL);
			expect(screen.getByRole('button', { name: 'Add' })).toBeDisabled();
		});
		test('disables add button while submission is in progress', async () => {
			const onClose = vi.fn();
			const { user } = setupTest(<AddExternalCalendarModal onClose={onClose} />);
			await user.type(screen.getByRole('textbox', { name: URL_LABEL }), VALID_ICS_URL);
			await user.type(screen.getByRole('textbox', { name: CALENDAR_NAME_LABEL }), 'x');
			const addButton = screen.getByRole('button', { name: 'Add' });
			expect(addButton).toBeEnabled();
			await user.click(addButton);
			expect(addButton).toBeDisabled();
			await waitFor(() => {
				expect(onClose).toHaveBeenCalledTimes(1);
			});
		});
		test('shows error snackbar and re-enables add button when creation fails', async () => {
			vi.spyOn(createFolderApi, 'createFolderRequest').mockRejectedValue(
				new Error('Network error')
			);
			const { user } = setupTest(<AddExternalCalendarModal onClose={vi.fn()} />);
			await user.type(screen.getByRole('textbox', { name: URL_LABEL }), VALID_ICS_URL);
			await user.type(screen.getByRole('textbox', { name: CALENDAR_NAME_LABEL }), 'My Calendar');
			await user.click(screen.getByRole('button', { name: 'Add' }));
			await waitFor(() => {
				expect(screen.getByText('Something went wrong, please try again')).toBeVisible();
			});
			expect(screen.getByRole('button', { name: 'Add' })).toBeEnabled();
		});
		test('disables inputs while submission is in progress', async () => {
			let resolveRequest: ((value: CreateFolderResponse) => void) | undefined;
			const pendingRequest = new Promise<CreateFolderResponse>((resolve) => {
				resolveRequest = resolve;
			});
			vi.spyOn(createFolderApi, 'createFolderRequest').mockReturnValue(pendingRequest);
			const { user } = setupTest(<AddExternalCalendarModal onClose={vi.fn()} />);
			await user.type(screen.getByRole('textbox', { name: URL_LABEL }), VALID_ICS_URL);
			await user.type(screen.getByRole('textbox', { name: CALENDAR_NAME_LABEL }), 'My Calendar');
			await user.click(screen.getByRole('button', { name: 'Add' }));
			expect(screen.getByRole('textbox', { name: URL_LABEL })).toBeDisabled();
			expect(screen.getByRole('textbox', { name: CALENDAR_NAME_LABEL })).toBeDisabled();
			expect(screen.getByText('Loading, please wait...')).toBeVisible();
			expect(screen.getByTestId('icon: LoaderOutline')).toBeVisible();
			resolveRequest?.({ folder: [], _jsns: JSNS.mail });
		});
		test('shows success snackbar and closes modal on successful ICS creation', async () => {
			vi.spyOn(createFolderApi, 'createFolderRequest').mockResolvedValue({
				_jsns: 'urn:zimbraMail',
				folder: [
					{
						id: '123',
						uuid: 'abc-123',
						name: 'x',
						activesyncdisabled: false,
						recursive: false,
						deletable: false
					}
				]
			});
			const onClose = vi.fn();
			const { user } = setupTest(<AddExternalCalendarModal onClose={onClose} />);
			await user.type(screen.getByRole('textbox', { name: URL_LABEL }), VALID_ICS_URL);
			await user.type(screen.getByRole('textbox', { name: CALENDAR_NAME_LABEL }), 'x');
			await user.click(screen.getByRole('button', { name: 'Add' }));
			await waitFor(() => {
				expect(screen.getByText('Calendar added successfully')).toBeVisible();
			});
			await waitFor(() => {
				expect(onClose).toHaveBeenCalledTimes(1);
			});
		});
		test('trims whitespace from calendar name and url before submission', async () => {
			const createFolderSpy = vi.spyOn(createFolderApi, 'createFolderRequest').mockResolvedValue({
				_jsns: 'urn:zimbraMail',
				folder: [
					{
						id: '123',
						uuid: 'abc-123',
						name: 'Trimmed Calendar',
						activesyncdisabled: false,
						recursive: false,
						deletable: false
					}
				]
			});
			const { user } = setupTest(<AddExternalCalendarModal onClose={vi.fn()} />);
			await user.type(
				screen.getByRole('textbox', { name: URL_LABEL }),
				'  https://example.com/cal.ics  '
			);
			await user.type(
				screen.getByRole('textbox', { name: CALENDAR_NAME_LABEL }),
				'  Trimmed Calendar  '
			);
			await user.click(screen.getByRole('button', { name: 'Add' }));
			await waitFor(() => {
				expect(createFolderSpy).toHaveBeenCalledWith(
					expect.objectContaining({
						name: 'Trimmed Calendar',
						url: 'https://example.com/cal.ics'
					})
				);
			});
		});
		test('shows duplicate calendar url error with in-trash message', async () => {
			const trashUrl = 'https://trash.com/calendar.ics';
			const folderInTrash = generateFolder({ view: 'appointment', l: FOLDERS.TRASH });
			populateFoldersStore({ customFolders: [folderInTrash] });
			useFolderStore.setState((state) => ({
				folders: {
					...state.folders,
					[folderInTrash.id]: { ...folderInTrash, url: trashUrl }
				}
			}));
			const { user } = setupTest(<AddExternalCalendarModal onClose={vi.fn()} />);
			await user.type(screen.getByRole('textbox', { name: URL_LABEL }), trashUrl);
			expect(
				screen.getByText(
					'A calendar with the same URL is in Trash. Permanently delete it to proceed'
				)
			).toBeVisible();
			expect(screen.getByRole('button', { name: 'Add' })).toBeDisabled();
		});
		test('case-insensitive duplicate calendar name detection', async () => {
			populateFoldersStore({
				view: 'appointment',
				customFolders: [generateFolder({ name: 'My Calendar', view: 'appointment' })]
			});
			const { user } = setupTest(<AddExternalCalendarModal onClose={vi.fn()} />);
			await user.type(screen.getByRole('textbox', { name: URL_LABEL }), VALID_ICS_URL);
			await user.type(screen.getByRole('textbox', { name: CALENDAR_NAME_LABEL }), 'my calendar');
			expect(screen.getByText('A calendar with the same name already exists')).toBeVisible();
			expect(screen.getByRole('button', { name: 'Add' })).toBeDisabled();
		});
		test('case-insensitive duplicate calendar url detection', async () => {
			const urlUpperCase = 'HTTPS://EXAMPLE.COM/CAL.ICS';
			const folderWithUrl = generateFolder({ view: 'appointment' });
			populateFoldersStore({ customFolders: [folderWithUrl] });
			useFolderStore.setState((state) => ({
				folders: {
					...state.folders,
					[folderWithUrl.id]: { ...folderWithUrl, url: 'https://example.com/cal.ics' }
				}
			}));
			const { user } = setupTest(<AddExternalCalendarModal onClose={vi.fn()} />);
			await user.type(screen.getByRole('textbox', { name: URL_LABEL }), urlUpperCase);
			expect(screen.getByText('A calendar with the same URL has already been added')).toBeVisible();
			expect(screen.getByRole('button', { name: 'Add' })).toBeDisabled();
		});
		test('shows invalid url error for malformed urls', async () => {
			const { user } = setupTest(<AddExternalCalendarModal onClose={vi.fn()} />);
			await user.pasteInto(
				screen.getByRole('textbox', { name: URL_LABEL }),
				'not a valid url at all'
			);
			expect(
				screen.getByText('Invalid URL. Please enter a valid http or https address')
			).toBeVisible();
			expect(screen.getByRole('button', { name: 'Add' })).toBeDisabled();
		});
		test('clears url when switching from ICS to CalDAV and back', async () => {
			const { user } = setupTest(<AddExternalCalendarModal onClose={vi.fn()} />);
			const typeSelect = screen.getByText('ICS');

			// Enter URL in ICS
			await user.type(screen.getByRole('textbox', { name: URL_LABEL }), VALID_ICS_URL);
			expect(screen.getByRole('textbox', { name: URL_LABEL })).toHaveValue(VALID_ICS_URL);

			// Switch to CalDAV
			await user.click(typeSelect);
			await user.click(screen.getByText('CalDAV'));
			expect(screen.queryByRole('textbox', { name: URL_LABEL })).not.toBeInTheDocument();

			// Switch back to ICS
			await user.click(screen.getByText('CalDAV'));
			await user.click(screen.getByText('ICS'));
			expect(screen.getByRole('textbox', { name: URL_LABEL })).toHaveValue('');
		});
	});
});
