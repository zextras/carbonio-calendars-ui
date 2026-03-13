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

import { AddIcsFromUrlModal } from './add-ics-from-url-modal';
import * as createFolderApi from '../../soap/create-folder-request';
import { setupTest, screen } from '@test-setup';
import { generateFolder } from '@test-utils/folders/folders-generator';
import { populateFoldersStore } from '@test-utils/store/folders';
import { CreateFolderResponse } from 'types/soap/createFolder';

const ICS_URL_LABEL = 'Calendar ICS URL*';
const CALENDAR_NAME_LABEL = 'Calendar name*';
const VALID_ICS_URL = 'https://a/1.ics';

describe('AddIcsFromUrlModal', () => {
	test('renders modal content', () => {
		setupTest(<AddIcsFromUrlModal onClose={vi.fn()} />);

		expect(screen.getByText('Add ICS from URL')).toBeVisible();
		expect(screen.getByRole('textbox', { name: ICS_URL_LABEL })).toBeVisible();
		expect(screen.getByRole('textbox', { name: CALENDAR_NAME_LABEL })).toBeVisible();
		expect(screen.getByText('Select color')).toBeVisible();
		expect(screen.getByRole('button', { name: 'Cancel' })).toBeVisible();
		expect(screen.getByRole('button', { name: 'Add' })).toBeDisabled();
	});

	test('enables add button after required fields are filled', async () => {
		const { user } = setupTest(<AddIcsFromUrlModal onClose={vi.fn()} />);

		await user.type(screen.getByRole('textbox', { name: ICS_URL_LABEL }), VALID_ICS_URL);
		await user.type(screen.getByRole('textbox', { name: CALENDAR_NAME_LABEL }), 'b');

		expect(screen.getByRole('button', { name: 'Add' })).toBeEnabled();
	});

	test('shows protocol error when url does not start with http or https', async () => {
		const { user } = setupTest(<AddIcsFromUrlModal onClose={vi.fn()} />);

		await user.type(screen.getByRole('textbox', { name: ICS_URL_LABEL }), 'a.b');

		expect(screen.getByText("The URL should begin with 'http://' or 'https://'")).toBeVisible();
		expect(screen.getByRole('button', { name: 'Add' })).toBeDisabled();
	});

	test('shows invalid ics link error when url is not a valid ics link', async () => {
		const { user } = setupTest(<AddIcsFromUrlModal onClose={vi.fn()} />);

		await user.type(screen.getByRole('textbox', { name: ICS_URL_LABEL }), 'ciao');

		expect(
			screen.getByText('Invalid URL. Make sure it links directly to an .ics calendar file')
		).toBeVisible();
		expect(screen.getByRole('button', { name: 'Add' })).toBeDisabled();
	});

	test('shows duplicate calendar name error when name already exists', async () => {
		populateFoldersStore({
			view: 'appointment',
			customFolders: [generateFolder({ name: 'External calendar', view: 'appointment' })]
		});
		const { user } = setupTest(<AddIcsFromUrlModal onClose={vi.fn()} />);

		await user.type(screen.getByRole('textbox', { name: ICS_URL_LABEL }), VALID_ICS_URL);
		await user.type(
			screen.getByRole('textbox', { name: CALENDAR_NAME_LABEL }),
			'External calendar'
		);

		expect(screen.getByText('A calendar with the same name already exists')).toBeVisible();
		expect(screen.getByRole('button', { name: 'Add' })).toBeDisabled();
	});

	test('calls onClose on cancel click', async () => {
		const onClose = vi.fn();
		const { user } = setupTest(<AddIcsFromUrlModal onClose={onClose} />);
		await user.click(screen.getByRole('button', { name: 'Cancel' }));

		expect(onClose).toHaveBeenCalledTimes(1);
	});

	test('submits CreateFolderRequest with URL payload on add', async () => {
		const createFolderResponse: CreateFolderResponse = {
			folder: [],
			_jsns: JSNS.mail
		};
		const createFolderRequestSpy = vi
			.spyOn(createFolderApi, 'createFolderRequest')
			.mockResolvedValue(createFolderResponse);
		const onClose = vi.fn();
		const { user } = setupTest(<AddIcsFromUrlModal onClose={onClose} />);

		await user.type(screen.getByRole('textbox', { name: ICS_URL_LABEL }), VALID_ICS_URL);
		await user.type(screen.getByRole('textbox', { name: CALENDAR_NAME_LABEL }), 'x');
		await user.click(screen.getByRole('button', { name: 'Add' }));

		await waitFor(() => {
			expect(createFolderRequestSpy).toHaveBeenCalledWith({
				l: '1',
				name: 'x',
				url: VALID_ICS_URL,
				rgb: '#000000',
				f: '#',
				view: 'appointment'
			});
		});

		await waitFor(() => {
			expect(onClose).toHaveBeenCalledTimes(1);
		});
	});

	test('disables add button while submit request is in progress', async () => {
		let resolveRequest: ((value: CreateFolderResponse) => void) | undefined;
		const pendingRequest = new Promise<CreateFolderResponse>((resolve) => {
			resolveRequest = resolve;
		});

		vi.spyOn(createFolderApi, 'createFolderRequest').mockReturnValue(pendingRequest);
		const onClose = vi.fn();
		const { user } = setupTest(<AddIcsFromUrlModal onClose={onClose} />);

		await user.type(screen.getByRole('textbox', { name: ICS_URL_LABEL }), VALID_ICS_URL);
		await user.type(screen.getByRole('textbox', { name: CALENDAR_NAME_LABEL }), 'x');

		const addButton = screen.getByRole('button', { name: 'Add' });
		expect(addButton).toBeEnabled();

		await user.click(addButton);
		expect(addButton).toBeDisabled();

		resolveRequest?.({
			folder: [],
			_jsns: JSNS.mail
		});

		await waitFor(() => {
			expect(onClose).toHaveBeenCalledTimes(1);
		});
	});

	test('add button is disabled when only the ics url is provided', async () => {
		const { user } = setupTest(<AddIcsFromUrlModal onClose={vi.fn()} />);

		await user.type(screen.getByRole('textbox', { name: ICS_URL_LABEL }), VALID_ICS_URL);

		expect(screen.getByRole('button', { name: 'Add' })).toBeDisabled();
	});

	test('shows sync info text when a valid ics url is entered', async () => {
		const { user } = setupTest(<AddIcsFromUrlModal onClose={vi.fn()} />);

		await user.type(screen.getByRole('textbox', { name: ICS_URL_LABEL }), VALID_ICS_URL);

		expect(
			screen.getByText('This calendar will be read-only and will sync automatically every 12 hours')
		).toBeVisible();
	});

	test('hides sync info text when url has a validation error', async () => {
		const { user } = setupTest(<AddIcsFromUrlModal onClose={vi.fn()} />);

		await user.type(screen.getByRole('textbox', { name: ICS_URL_LABEL }), 'a.b');

		expect(
			screen.queryByText(
				'This calendar will be read-only and will sync automatically every 12 hours'
			)
		).not.toBeInTheDocument();
	});

	test('shows protocol error for non-http(s) protocol url', async () => {
		const { user } = setupTest(<AddIcsFromUrlModal onClose={vi.fn()} />);

		await user.pasteInto(
			screen.getByRole('textbox', { name: ICS_URL_LABEL }),
			'ftp://example.com/calendar.ics'
		);

		expect(screen.getByText("The URL should begin with 'http://' or 'https://'")).toBeVisible();
		expect(screen.getByRole('button', { name: 'Add' })).toBeDisabled();
	});

	test('shows invalid ics link error when url does not end with .ics', async () => {
		const { user } = setupTest(<AddIcsFromUrlModal onClose={vi.fn()} />);

		await user.pasteInto(
			screen.getByRole('textbox', { name: ICS_URL_LABEL }),
			'https://example.com/calendar'
		);

		expect(
			screen.getByText('Invalid URL. Make sure it links directly to an .ics calendar file')
		).toBeVisible();
		expect(screen.getByRole('button', { name: 'Add' })).toBeDisabled();
	});

	test('shows duplicate calendar url error when same url already exists', async () => {
		const existingUrl = 'https://existing.com/calendar.ics';
		const folderWithUrl = generateFolder({ view: 'appointment' });
		populateFoldersStore({ customFolders: [folderWithUrl] });
		useFolderStore.setState((state) => ({
			folders: {
				...state.folders,
				[folderWithUrl.id]: { ...folderWithUrl, url: existingUrl }
			}
		}));

		const { user } = setupTest(<AddIcsFromUrlModal onClose={vi.fn()} />);

		await user.type(screen.getByRole('textbox', { name: ICS_URL_LABEL }), existingUrl);

		expect(screen.getByText('A calendar with the same URL has already been added')).toBeVisible();
		expect(screen.getByRole('button', { name: 'Add' })).toBeDisabled();
	});

	test('shows error snackbar and re-enables add button when creation fails', async () => {
		vi.spyOn(createFolderApi, 'createFolderRequest').mockRejectedValue(new Error('Network error'));
		const { user } = setupTest(<AddIcsFromUrlModal onClose={vi.fn()} />);

		await user.type(screen.getByRole('textbox', { name: ICS_URL_LABEL }), VALID_ICS_URL);
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
		const { user } = setupTest(<AddIcsFromUrlModal onClose={vi.fn()} />);

		await user.type(screen.getByRole('textbox', { name: ICS_URL_LABEL }), VALID_ICS_URL);
		await user.type(screen.getByRole('textbox', { name: CALENDAR_NAME_LABEL }), 'My Calendar');
		await user.click(screen.getByRole('button', { name: 'Add' }));

		expect(screen.getByRole('textbox', { name: ICS_URL_LABEL })).toBeDisabled();
		expect(screen.getByRole('textbox', { name: CALENDAR_NAME_LABEL })).toBeDisabled();

		resolveRequest?.({ folder: [], _jsns: JSNS.mail });
	});
});
