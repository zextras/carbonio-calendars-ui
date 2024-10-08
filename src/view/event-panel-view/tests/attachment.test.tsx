/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { screen, render, waitFor, act } from '@testing-library/react';

import { useFolderStore } from '../../../carbonio-ui-commons/store/zustand/folder';
import { previewContextMock } from '../../../carbonio-ui-commons/test/mocks/carbonio-ui-preview';
import { setupTest, UserEvent } from '../../../carbonio-ui-commons/test/test-setup';
import { reducers } from '../../../store/redux';
import { Attachment } from '../attachment';

const setupFoldersStore = (): void => {
	useFolderStore.setState(() => ({
		folders: {}
	}));
};

const mockCreatePreview = jest.fn();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const renderAttachment = (props: any): { user: UserEvent } & ReturnType<typeof render> => {
	setupFoldersStore();
	const store = configureStore({
		reducer: combineReducers(reducers),
		preloadedState: {}
	});

	return setupTest(<Attachment {...props} />, { store });
};

describe('Attachment', () => {
	const mockAttachment = {
		name: 'test-file.pdf',
		size: 1024,
		contentType: 'application/pdf',
		filename: 'test-file.pdf'
	};

	const baseProps = {
		subject: 'Test Subject',
		id: '1',
		part: 'part1',
		isEditor: false,
		removeAttachment: jest.fn(),
		disabled: false,
		iconColors: [{ extension: 'pdf', color: 'blue' }],
		attachment: mockAttachment
	};

	test('renders correctly', () => {
		renderAttachment(baseProps);
		expect(screen.getByText('test-file.pdf')).toBeVisible();
		expect(screen.getByText('1.00 KB')).toBeVisible();
	});

	test('does not show recurrent icon if not recurrent', () => {
		renderAttachment(baseProps);
		expect(screen.queryByTestId('icon: Repeat')).not.toBeInTheDocument();
	});

	test('calls download function when download button is clicked', async () => {
		const windowOpenSpy = jest.spyOn(window, 'open').mockImplementation(jest.fn());
		const props = {
			...baseProps,
			id: '1',
			disabled: false,
			isEditor: false,
			attachment: { ...mockAttachment }
		};

		const { user } = renderAttachment(props);
		const attachment = screen.getByText('test-file.pdf');
		await user.hover(attachment);
		const downloadButton = screen.getByRole('button');
		await act(async () => {
			await user.click(downloadButton);
		});

		await waitFor(() => expect(windowOpenSpy).toHaveBeenCalledTimes(1));
	});

	test('calls createPreview when preview is clicked', async () => {
		const { user } = renderAttachment(baseProps);
		const previewButton = screen.getByText('test-file.pdf');
		await act(async () => {
			await user.click(previewButton);
		});

		expect(previewContextMock.createPreview).toHaveBeenCalledTimes(1);
		expect(previewContextMock.createPreview).toHaveBeenCalledWith(
			expect.objectContaining({
				src: expect.any(String),
				previewType: expect.any(String),
				extension: 'pdf',
				filename: 'test-file.pdf',
				size: '1.00 KB'
			})
		);
	});

	test('calls removeAttachment when delete button is clicked', async () => {
		const props = {
			...baseProps,
			disabled: true,
			editor: true
		};

		const { user } = renderAttachment(props);
		const attachment = screen.getByText('test-file.pdf');
		await user.hover(attachment);
		const deleteButton = screen.getByRole('button');
		await user.click(deleteButton);
		await waitFor(() => {
			expect(props.removeAttachment).toHaveBeenCalledWith('part1');
		});
	});
});
