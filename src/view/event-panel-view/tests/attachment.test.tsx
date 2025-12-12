/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { screen, render } from '@testing-library/react';
import { useFolderStore } from '@zextras/carbonio-ui-commons';
import * as PreviewModule from '@zextras/carbonio-ui-preview';

import { reducers } from '../../../store/redux';
import { Attachment } from '../attachment';
import { setupTest, UserEvent } from '@test-setup';

const setupFoldersStore = (): void => {
	useFolderStore.setState(() => ({
		folders: {}
	}));
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const renderAttachment = (props: any): { user: UserEvent } & ReturnType<typeof render> => {
	setupFoldersStore();
	const store = configureStore({
		reducer: combineReducers(reducers),
		preloadedState: {}
	});

	return setupTest(<Attachment {...props} />, { store });
};

const createPreviewSpy = vi.fn();
const contextValue = {
	createPreview: createPreviewSpy,
	initPreview: vi.fn(),
	openPreview: vi.fn(),
	emptyPreview: vi.fn()
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
		removeAttachment: vi.fn(),
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
		const windowOpenSpy = vi.spyOn(window, 'open').mockImplementation(vi.fn());
		const props = {
			...baseProps,
			id: '1',
			disabled: false,
			isEditor: false,
			attachment: { ...mockAttachment }
		};

		const { user } = renderAttachment(props);
		const downloadButton = screen.getByTestId('action-button');
		await user.click(downloadButton);

		expect(windowOpenSpy).toHaveBeenCalledTimes(1);
	});

	test('calls createPreview when a file is set to be viewed with the previewer', async () => {
		const spyOpen = vi.spyOn(window, 'open').mockImplementation(vi.fn());
		const unsupportedAttachment = {
			name: 'test-file.ts',
			size: 1024,
			contentType: 'application/ts',
			filename: 'test-file.ts'
		};
		const props = {
			...baseProps,
			disabled: true,
			editor: true,
			attachment: unsupportedAttachment
		};

		vi.spyOn(PreviewModule, 'PreviewsManagerContext', 'get').mockReturnValue(
			React.createContext(contextValue) as unknown as typeof PreviewModule.PreviewsManagerContext
		);

		const { user } = renderAttachment(props);
		const previewButton = screen.getByText('test-file.ts');
		await user.click(previewButton);

		expect(createPreviewSpy).toHaveBeenCalledTimes(0);
		expect(spyOpen).toHaveBeenCalledWith(
			'/service/home/~/?auth=co&id=1&part=test-file.ts&disp=a',
			'_blank'
		);
	});

	test('calls download service when a file is not set to be viewed with the previewer', async () => {
		vi.spyOn(PreviewModule, 'PreviewsManagerContext', 'get').mockReturnValue(
			React.createContext(contextValue) as unknown as typeof PreviewModule.PreviewsManagerContext
		);

		const { user } = renderAttachment(baseProps);
		const previewButton = screen.getByText('test-file.pdf');
		await user.click(previewButton);

		expect(createPreviewSpy).toHaveBeenCalledTimes(1);
		expect(createPreviewSpy).toHaveBeenCalledWith(
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
		const deleteButton = screen.getByTestId('action-button');
		await user.click(deleteButton);

		expect(props.removeAttachment).toHaveBeenCalledWith('part1');
	});
});
