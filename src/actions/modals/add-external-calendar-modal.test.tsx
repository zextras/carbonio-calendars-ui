// noinspection HttpUrlsUsage
/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';
import { waitFor } from '@testing-library/react';
import { JSNS } from '@zextras/carbonio-shell-ui';
import { useFolderStore } from '@zextras/carbonio-ui-commons';
import { AddExternalCalendarModal } from './add-external-calendar-modal';
import * as createFolderApi from '../../soap/create-folder-request';
import * as createDataSourceApi from '../../soap/create-data-source-request';
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
	test('renders modal with title, type selector, url, name, color and disabled add button', () => {
		setupTest(<AddExternalCalendarModal onClose={vi.fn()} />);
		expect(screen.getByText('Add external calendars')).toBeVisible();
		expect(screen.getByText(TYPE_LABEL)).toBeVisible();
		expect(screen.getByRole('textbox', { name: URL_LABEL })).toBeVisible();
		expect(screen.getByRole('textbox', { name: CALENDAR_NAME_LABEL })).toBeVisible();
		expect(screen.getByText('Select color')).toBeVisible();
		expect(screen.getByRole('button', { name: 'Add' })).toBeDisabled();
	});
	test('defaults to ICS type', () => {
		setupTest(<AddExternalCalendarModal onClose={vi.fn()} />);
		expect(screen.getByText('ICS')).toBeVisible();
	});
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
		test('shows invalid ics link error when url does not end with .ics', async () => {
			const { user } = setupTest(<AddExternalCalendarModal onClose={vi.fn()} />);
			await user.pasteInto(
				screen.getByRole('textbox', { name: URL_LABEL }),
				'https://example.com/calendar'
			);
			expect(
				screen.getByText('Invalid URL. Make sure it links directly to an .ics calendar file')
			).toBeVisible();
			expect(screen.getByRole('button', { name: 'Add' })).toBeDisabled();
		});
		test('shows protocol error for non-http(s) protocol url', async () => {
			const { user } = setupTest(<AddExternalCalendarModal onClose={vi.fn()} />);
			await user.pasteInto(
				screen.getByRole('textbox', { name: URL_LABEL }),
				'ftp://example.com/calendar.ics'
			);
			expect(screen.getByText("The URL should begin with 'http://' or 'https://'")).toBeVisible();
		});
		test('shows sync info text when a valid ics url is entered', async () => {
			const { user } = setupTest(<AddExternalCalendarModal onClose={vi.fn()} />);
			await user.type(screen.getByRole('textbox', { name: URL_LABEL }), VALID_ICS_URL);
			expect(
				screen.getByText('This calendar will be read-only and will sync every 12 hours')
			).toBeVisible();
		});
		test('hides sync info text when url has a validation error', async () => {
			const { user } = setupTest(<AddExternalCalendarModal onClose={vi.fn()} />);
			await user.type(screen.getByRole('textbox', { name: URL_LABEL }), 'a.b');
			expect(
				screen.queryByText('This calendar will be read-only and will sync every 12 hours')
			).not.toBeInTheDocument();
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

		test('shows caldav-specific fields when CalDAV type is selected', async () => {
			const { user } = setupTest(<AddExternalCalendarModal onClose={vi.fn()} />);
			await selectCalDav(user);

			expect(screen.getByRole('textbox', { name: 'Host*' })).toBeVisible();
			expect(screen.getByRole('textbox', { name: 'Folder name*' })).toBeVisible();
			expect(screen.getByText('This host does not require credentials')).toBeVisible();
			expect(screen.getByRole('textbox', { name: 'Username*' })).toBeVisible();
			// PasswordInput renders as type="password", query by label text
			expect(screen.getByLabelText('Password*')).toBeVisible();
		});

		test('hides ICS-specific fields when CalDAV type is selected', async () => {
			const { user } = setupTest(<AddExternalCalendarModal onClose={vi.fn()} />);
			await selectCalDav(user);

			expect(screen.queryByRole('textbox', { name: URL_LABEL })).not.toBeInTheDocument();
			expect(screen.queryByRole('textbox', { name: CALENDAR_NAME_LABEL })).not.toBeInTheDocument();
		});

		test('add button is disabled when host and folder name are empty', async () => {
			const { user } = setupTest(<AddExternalCalendarModal onClose={vi.fn()} />);
			await selectCalDav(user);

			expect(screen.getByRole('button', { name: 'Add' })).toBeDisabled();
		});

		test('add button is disabled when host is filled but folder name is missing', async () => {
			const { user } = setupTest(<AddExternalCalendarModal onClose={vi.fn()} />);
			await selectCalDav(user);

			await user.pasteInto(screen.getByRole('textbox', { name: 'Host*' }), VALID_CALDAV_HOST);

			expect(screen.getByRole('button', { name: 'Add' })).toBeDisabled();
		});

		test('add button is disabled when host and folder name are filled but credentials are missing', async () => {
			const { user } = setupTest(<AddExternalCalendarModal onClose={vi.fn()} />);
			await selectCalDav(user);

			await user.pasteInto(screen.getByRole('textbox', { name: 'Host*' }), VALID_CALDAV_HOST);
			await user.pasteInto(screen.getByRole('textbox', { name: 'Folder name*' }), 'My Calendars');

			expect(screen.getByRole('button', { name: 'Add' })).toBeDisabled();
		});

		test('add button is enabled when host, folder name, username and password are filled', async () => {
			const { user } = setupTest(<AddExternalCalendarModal onClose={vi.fn()} />);
			await selectCalDav(user);

			// Use pasteInto instead of type to avoid simulating one keypress at a time
			await user.pasteInto(screen.getByRole('textbox', { name: 'Host*' }), VALID_CALDAV_HOST);
			await user.pasteInto(screen.getByRole('textbox', { name: 'Folder name*' }), 'My Calendars');
			await user.pasteInto(screen.getByRole('textbox', { name: 'Username*' }), 'user@example.com');
			// PasswordInput renders as type="password", query by label text
			await user.pasteInto(screen.getByLabelText('Password*'), 'secret');

			expect(screen.getByRole('button', { name: 'Add' })).toBeEnabled();
		});

		test('checking "no credentials" hides username and password fields', async () => {
			const { user } = setupTest(<AddExternalCalendarModal onClose={vi.fn()} />);
			await selectCalDav(user);

			await user.click(screen.getByText('This host does not require credentials'));

			expect(screen.queryByRole('textbox', { name: 'Username*' })).not.toBeInTheDocument();
			expect(screen.queryByRole('textbox', { name: 'Password*' })).not.toBeInTheDocument();
		});

		test('add button is enabled when "no credentials" is checked and host and folder name are filled', async () => {
			const { user } = setupTest(<AddExternalCalendarModal onClose={vi.fn()} />);
			await selectCalDav(user);

			await user.pasteInto(screen.getByRole('textbox', { name: 'Host*' }), VALID_CALDAV_HOST);
			await user.pasteInto(screen.getByRole('textbox', { name: 'Folder name*' }), 'My Calendars');
			await user.click(screen.getByText('This host does not require credentials'));

			expect(screen.getByRole('button', { name: 'Add' })).toBeEnabled();
		});

		test('folder name hint text is visible', async () => {
			const { user } = setupTest(<AddExternalCalendarModal onClose={vi.fn()} />);
			await selectCalDav(user);

			expect(
				screen.getByText(
					'Refers to the parent folder, which will contain all calendars from this host'
				)
			).toBeVisible();
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
			const createDataSourceSpy = vi
				.spyOn(createDataSourceApi, 'createCalDavDataSourceRequest')
				.mockResolvedValue({ _jsns: 'urn:zimbraMail' });
			const onClose = vi.fn();

			const { user } = setupTest(<AddExternalCalendarModal onClose={onClose} />);
			await selectCalDav(user);

			await user.pasteInto(
				screen.getByRole('textbox', { name: 'Host*' }),
				'mailbox1.demo.zextras.io'
			);
			await user.pasteInto(screen.getByRole('textbox', { name: 'Folder name*' }), 'My CalDAV');
			await user.pasteInto(
				screen.getByRole('textbox', { name: 'Username*' }),
				'user@demo.zextras.io'
			);
			await user.pasteInto(screen.getByLabelText('Password*'), 'secret');
			await user.click(screen.getByRole('button', { name: 'Add' }));

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
					name: 'My CalDAV',
					pollingInterval: '1m',
					isEnabled: '1',
					l: '42',
					host: 'mailbox1.demo.zextras.io',
					username: 'user@demo.zextras.io',
					password: 'secret',
					a: { n: 'zimbraDataSourceAttribute', _content: 'p:/principals/users/_USERNAME_/' }
				});
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
			const createDataSourceSpy = vi
				.spyOn(createDataSourceApi, 'createCalDavDataSourceRequest')
				.mockResolvedValue({ _jsns: 'urn:zimbraMail' });

			const { user } = setupTest(<AddExternalCalendarModal onClose={vi.fn()} />);
			await selectCalDav(user);

			await user.pasteInto(screen.getByRole('textbox', { name: 'Host*' }), 'public.example.com');
			await user.pasteInto(screen.getByRole('textbox', { name: 'Folder name*' }), 'Public CalDAV');
			await user.click(screen.getByText('This host does not require credentials'));
			await user.click(screen.getByRole('button', { name: 'Add' }));

			await waitFor(() => {
				expect(createDataSourceSpy).toHaveBeenCalledWith(
					expect.not.objectContaining({ username: expect.anything(), password: expect.anything() })
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
			vi.spyOn(createDataSourceApi, 'createCalDavDataSourceRequest').mockRejectedValue(
				new Error('Network error')
			);

			const { user } = setupTest(<AddExternalCalendarModal onClose={vi.fn()} />);
			await selectCalDav(user);

			await user.pasteInto(
				screen.getByRole('textbox', { name: 'Host*' }),
				'mailbox1.demo.zextras.io'
			);
			await user.pasteInto(screen.getByRole('textbox', { name: 'Folder name*' }), 'Fail CalDAV');
			await user.click(screen.getByText('This host does not require credentials'));
			await user.click(screen.getByRole('button', { name: 'Add' }));

			await waitFor(() => {
				expect(screen.getByText('Something went wrong, please try again')).toBeVisible();
			});
			expect(screen.getByRole('button', { name: 'Add' })).toBeEnabled();
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
			resolveRequest?.({ folder: [], _jsns: JSNS.mail });
		});
	});
});
