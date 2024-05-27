/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { act, screen } from '@testing-library/react';

import { EditorAttachments } from './editor-attachments';
import { setupTest } from '../../../carbonio-ui-commons/test/test-setup';
import { generateEditor } from '../../../commons/editor-generator';
import { reducers } from '../../../store/redux';
import mockedData from '../../../test/generators';

jest.setTimeout(50000);

const folder = {
	absFolderPath: '/Test',
	id: '5',
	l: '1',
	name: 'Test',
	view: 'appointment'
};

const folders = mockedData.calendars.getCalendarsMap({ folders: [folder] });

describe('editor attachments', () => {
	test('clicking on delete  on an existing attachment will remove the attachment', async () => {
		const store = configureStore({ reducer: combineReducers(reducers) });
		const event = mockedData.getEvent();
		const attachmentFiles = [
			{
				contentType: 'image/jpeg',
				size: 7162,
				name: '2',
				filename: 'download.jpeg',
				disposition: 'attachment'
			}
		];
		const attach = {
			mp: [
				{
					part: '2',
					mid: '7408-7407'
				}
			]
		};
		const invite = mockedData.getInvite({ event });
		const context = { folders, dispatch: store.dispatch, attach, attachmentFiles };
		const editor = generateEditor({ invite, context });
		const { user } = setupTest(<EditorAttachments editorId={editor.id} expanded />, { store });

		expect(editor.attach).toBe(attach);
		expect(editor.attachmentFiles).toBe(attachmentFiles);
		expect(screen.getByText(/download.jpeg/i)).toBeInTheDocument();
		await act(async () => {
			await user.click(screen.getByTestId('icon: DeletePermanentlyOutline'));
		});
		expect(screen.queryByText(/download.jpeg/i)).not.toBeInTheDocument();
	});
});
