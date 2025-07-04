/* eslint-disable */
/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { screen, waitFor } from '@testing-library/react';

import { generateEditor } from '../../../../commons/editor-generator';
import { reducers } from '../../../../store/redux';
import { Resource } from '../../../../types/editor';
import { EditorResourceComponent } from '../editor-resource-component';
import { setupTest } from '@test-setup';

describe('EditorResourceComponent', () => {
	let store: ReturnType<typeof configureStore>;
	let editor: ReturnType<typeof generateEditor>;
	const onChangeMock = jest.fn();

	const mockSearchOptions = jest.fn(async (text: string) => [
		{
			id: '1',
			label: `Resource: ${text}`,
			value: {
				id: 'res1',
				label: `Resource: ${text}`,
				email: 'resource@example.com',
				type: 'Location'
			}
		}
	]);

	beforeEach(() => {
		store = configureStore({ reducer: combineReducers(reducers) });
		editor = generateEditor({ context: { dispatch: store.dispatch, folders: {} } });
		onChangeMock.mockClear();
		mockSearchOptions.mockClear();
	});

	it('renders the component', () => {
		setupTest(
			<EditorResourceComponent
				placeholder="Test"
				editorId={editor.id}
				onChange={onChangeMock}
				onSearchOptions={mockSearchOptions}
				resourcesValue={[]}
				warningLabel=""
				singleWarningLabel=""
				invalidInputErrorLabel="Invalid input"
			/>,
			{ store }
		);

		expect(screen.getByPlaceholderText('Test')).toBeInTheDocument();
	});

	it('allows adding a valid resource via search', async () => {
		const { user } = setupTest(
			<EditorResourceComponent
				placeholder="Test"
				editorId={editor.id}
				onChange={onChangeMock}
				onSearchOptions={mockSearchOptions}
				resourcesValue={[]}
				warningLabel=""
				singleWarningLabel=""
				invalidInputErrorLabel="Invalid input"
			/>,
			{ store }
		);

		const input = screen.getByPlaceholderText('Test');

		await user.type(input, 'meeting-room');
		await waitFor(() => expect(mockSearchOptions).toHaveBeenCalledWith('meeting-room'));

		await user.keyboard('{Enter}');

		await waitFor(() => {
			expect(onChangeMock).toHaveBeenCalledTimes(1);
			const [resources] = onChangeMock.mock.calls[0];
			expect(resources[0]).toMatchObject({
				label: 'Resource: meeting-room',
				email: 'resource@example.com'
			});
		});
	});

	it('adds invalid chip manually and shows error', async () => {
		const { user } = setupTest(
			<EditorResourceComponent
				placeholder="Test"
				editorId={editor.id}
				onChange={onChangeMock}
				onSearchOptions={mockSearchOptions}
				resourcesValue={[]}
				warningLabel=""
				singleWarningLabel=""
				invalidInputErrorLabel="Invalid input"
			/>,
			{ store }
		);

		const input = screen.getByPlaceholderText('Test');
		await user.type(input, 'unknown-resource');
		await user.keyboard('{Enter}');

		await waitFor(() => {
			expect(screen.getByText('Invalid input')).toBeInTheDocument();
		});
	});

	it('prevents duplicate entries onChange', async () => {
		const resource: Resource = {
			id: 'r1',
			label: 'Room-A',
			email: 'rooma@example.com',
			type: 'Location'
		};

		const { user } = setupTest(
			<EditorResourceComponent
				placeholder="Test"
				editorId={editor.id}
				onChange={onChangeMock}
				onSearchOptions={mockSearchOptions}
				resourcesValue={[resource]}
				warningLabel=""
				singleWarningLabel=""
				invalidInputErrorLabel="Invalid input"
			/>,
			{ store }
		);

		const input = screen.getByPlaceholderText('Test');
		await user.type(input, 'Room-A');
		await user.keyboard('{Enter}');

		await waitFor(() => {
			expect(onChangeMock).toHaveBeenCalled();
			const [chips] = onChangeMock.mock.calls.at(-1)!;
			expect(chips).toHaveLength(1);
		});
	});

	it('should not add resource on Enter key if input is empty', async () => {
		const { user } = setupTest(
			<EditorResourceComponent
				placeholder="Test"
				editorId={editor.id}
				onChange={onChangeMock}
				onSearchOptions={mockSearchOptions}
				resourcesValue={[]}
				warningLabel=""
				singleWarningLabel=""
				invalidInputErrorLabel="Invalid input"
			/>,
			{ store }
		);

		const input = screen.getByPlaceholderText('Test');
		await user.keyboard('[Enter]');

		expect(onChangeMock).not.toHaveBeenCalled();
		expect(screen.queryByText('Invalid input')).not.toBeInTheDocument();
	});

	it('should clear input and options after selecting a resource', async () => {
		const { user } = setupTest(
			<EditorResourceComponent
				placeholder="Test"
				editorId={editor.id}
				onChange={onChangeMock}
				onSearchOptions={mockSearchOptions}
				resourcesValue={[]}
				warningLabel=""
				singleWarningLabel=""
				invalidInputErrorLabel="Invalid input"
			/>,
			{ store }
		);

		const input = screen.getByPlaceholderText('Test');
		await user.type(input, 'meeting-room');
		await waitFor(() => expect(mockSearchOptions).toHaveBeenCalledWith('meeting-room'));

		await user.keyboard('{Enter}');

		expect(input).toHaveValue('');
		expect(screen.queryByText('Resource: meeting-room')).not.toBeInTheDocument();
	});

	it('should select the first option when user press Enter', async () => {
		const { user } = setupTest(
			<EditorResourceComponent
				placeholder="Test"
				editorId={editor.id}
				onChange={onChangeMock}
				onSearchOptions={mockSearchOptions}
				resourcesValue={[]}
				warningLabel=""
				singleWarningLabel=""
				invalidInputErrorLabel="Invalid input"
			/>,
			{ store }
		);

		const input = screen.getByPlaceholderText('Test');
		await user.type(input, 'meeting-room');
		await waitFor(() => expect(mockSearchOptions).toHaveBeenCalledWith('meeting-room'));

		await user.keyboard('{Enter}');

		expect(onChangeMock).toHaveBeenCalled();
		expect(input).toHaveValue('');
	});
});
