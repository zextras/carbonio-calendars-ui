/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { screen } from '@testing-library/react';

import { EditorAttachments } from './editor-attachments';
import { generateEditor } from '../../../commons/editor-generator';
import { reducers } from '../../../store/redux';
import mockedData from '../../../test/generators';
import { setupTest } from '@test-setup';

const DELETE_PERMANENTLY_ICON = 'icon: DeletePermanentlyOutline';

const folder = {
	absFolderPath: '/Test',
	id: '5',
	l: '1',
	name: 'Test',
	view: 'appointment'
};
const folders = mockedData.calendars.getCalendarsMap({ folders: [folder] });

describe('editor attachments', () => {
	test('delete single upload attachment', async () => {
		const store = configureStore({ reducer: combineReducers(reducers) });
		const event = mockedData.getEvent();
		const attachmentFiles = [
			{
				contentType: 'image/jpeg',
				size: 7162,
				name: '2',
				filename: 'download.jpeg',
				disposition: 'attachment',
				aid: 'a1'
			}
		];
		const attach = { mp: [], aid: ['a1'] };
		const invite = mockedData.getInvite({ event });
		const context = { folders, dispatch: store.dispatch, attach, attachmentFiles };
		const editor = generateEditor({ invite, context });

		const { user } = setupTest(<EditorAttachments editorId={editor.id} expanded />, { store });

		expect(editor.attach).toBe(attach);
		expect(editor.attachmentFiles).toBe(attachmentFiles);
		expect(screen.getByText(/download.jpeg/i)).toBeInTheDocument();

		await user.click(screen.getByTestId(DELETE_PERMANENTLY_ICON));
		expect(screen.queryByText(/download.jpeg/i)).not.toBeInTheDocument();
	});

	test('delete single inline attachment', async () => {
		const store = configureStore({ reducer: combineReducers(reducers) });
		const event = mockedData.getEvent();
		const attachmentFiles = [
			{
				contentType: 'text/plain',
				size: 100,
				name: 'inline',
				filename: 'inline.txt',
				disposition: 'inline'
			}
		];
		const attach = { mp: [{ part: 'inline', mid: '1234-5678' }], aid: [] };
		const invite = mockedData.getInvite({ event });
		const context = { folders, dispatch: store.dispatch, attach, attachmentFiles };
		const editor = generateEditor({ invite, context });

		const { user } = setupTest(<EditorAttachments editorId={editor.id} expanded />, { store });

		expect(editor.attach).toBe(attach);
		expect(editor.attachmentFiles).toBe(attachmentFiles);
		expect(screen.getByText(/inline.txt/i)).toBeInTheDocument();

		await user.click(screen.getByTestId(DELETE_PERMANENTLY_ICON));
		expect(screen.queryByText(/inline.txt/i)).not.toBeInTheDocument();
	});

	test('multiple attachments and remove one', async () => {
		const store = configureStore({ reducer: combineReducers(reducers) });
		const event = mockedData.getEvent();
		const attachmentFiles = [
			{
				contentType: 'image/jpeg',
				size: 7000,
				name: 'files',
				filename: 'files.jpg',
				disposition: 'attachment',
				aid: 'a1'
			},
			{
				contentType: 'text/plain',
				size: 500,
				name: 'inline',
				filename: 'inline.txt',
				disposition: 'inline'
			}
		];
		const attach = { mp: [{ part: 'inline', mid: '1234-5678' }], aid: ['a1'] };
		const invite = mockedData.getInvite({ event });
		const context = { folders, dispatch: store.dispatch, attach, attachmentFiles };
		const editor = generateEditor({ invite, context });

		const { user } = setupTest(<EditorAttachments editorId={editor.id} expanded />, { store });

		expect(editor.attach).toBe(attach);
		expect(editor.attachmentFiles).toBe(attachmentFiles);
		expect(screen.getByText(/files.jpg/i)).toBeInTheDocument();
		expect(screen.getByText(/inline.txt/i)).toBeInTheDocument();

		const deleteButtons = screen.getAllByTestId(DELETE_PERMANENTLY_ICON);
		await user.click(deleteButtons[0]);

		expect(screen.queryByText(/files.jpg/i)).not.toBeInTheDocument();
		expect(screen.getByText(/inline.txt/i)).toBeInTheDocument();
	});

	test('remove all attachments', async () => {
		const store = configureStore({ reducer: combineReducers(reducers) });
		const event = mockedData.getEvent();
		const attachmentFiles = [
			{
				contentType: 'image/jpeg',
				size: 7000,
				name: 'files',
				filename: 'files.jpg',
				disposition: 'attachment',
				aid: 'a1'
			},
			{
				contentType: 'text/plain',
				size: 500,
				name: 'inline',
				filename: 'inline.txt',
				disposition: 'inline'
			}
		];
		const attach = { mp: [{ part: 'inline', mid: '1234-5678' }], aid: ['a1'] };
		const invite = mockedData.getInvite({ event });
		const context = { folders, dispatch: store.dispatch, attach, attachmentFiles };
		const editor = generateEditor({ invite, context });

		const { user } = setupTest(<EditorAttachments editorId={editor.id} expanded />, { store });

		const deleteAllLink = screen.getByText(/delete all/i);
		await user.click(deleteAllLink);

		expect(screen.queryByText(/files.jpg/i)).not.toBeInTheDocument();
		expect(screen.queryByText(/inline.txt/i)).not.toBeInTheDocument();
	});
});
