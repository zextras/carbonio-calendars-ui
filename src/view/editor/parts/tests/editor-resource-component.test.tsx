/* eslint-disable */
/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { fireEvent, screen, waitFor, within } from '@testing-library/react';

import { generateEditor } from '../../../../commons/editor-generator';
import { reducers } from '../../../../store/redux';
import { Resource } from '../../../../types/editor';
import { EditorResourceComponent } from '../editor-resource-component';
import { setupTest } from '@test-setup';

describe('EditorResourceComponent', () => {
	let store: ReturnType<typeof configureStore>;
	let editor: ReturnType<typeof generateEditor>;
	const onChangeMock = jest.fn();

	const defaultResource: Resource = {
		id: 'r1',
		label: 'DefaultResource',
		email: 'default@example.com',
		type: 'Location'
	};
	const mockSearchOptions = jest.fn(async (_text: string) => [
		{
			id: '1',
			label: 'DefaultResource',
			value: defaultResource
		}
	]);

	beforeEach(() => {
		store = configureStore({ reducer: combineReducers(reducers) });
		editor = generateEditor({ context: { dispatch: store.dispatch, folders: {} } });
		onChangeMock.mockClear();
		mockSearchOptions.mockClear();
	});

	it('renders the component with provided resources', () => {
		setupTest(
			<EditorResourceComponent
				placeholder="Test"
				editorId={editor.id}
				onChange={onChangeMock}
				onSearchOptions={() => Promise.resolve([])}
				resourcesValue={[defaultResource]}
				warningLabel=""
				singleWarningLabel=""
				invalidInputErrorLabel="Invalid input"
				duplicateChipsErrorLabel={'Duplicate input'}
			/>,
			{ store }
		);

		expect(screen.getByPlaceholderText('Test')).toBeInTheDocument();
		const chip = screen.getByTestId('chip');
		expect(chip).toHaveTextContent('DefaultResource');
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
				duplicateChipsErrorLabel={'Duplicate input'}
			/>,
			{ store }
		);

		const input = screen.getByPlaceholderText('Test');
		await user.type(input, 'DefaultResource');
		await waitFor(() => expect(mockSearchOptions).toHaveBeenCalledWith('DefaultResource'));

		const dropDownItem = await screen.findByTestId('dropdown-item');
		expect(dropDownItem).toHaveTextContent('DefaultResource');
		await user.keyboard('{Control>}{Enter}{/Control}');

		await waitFor(async () => {
			expect(onChangeMock).toHaveBeenCalledTimes(1);
			const [resources] = onChangeMock.mock.calls[0];
			expect(resources[0]).toMatchObject({
				label: 'DefaultResource',
				email: 'default@example.com'
			});
			expect(dropDownItem).not.toBeInTheDocument();
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
				duplicateChipsErrorLabel={'Duplicate input'}
			/>,
			{ store }
		);
		expect(screen.queryByText('Invalid input')).not.toBeInTheDocument();

		const input = screen.getByPlaceholderText('Test');
		await user.type(input, 'unknown-resource');
		await user.keyboard('{Enter}');

		await waitFor(() => {
			expect(screen.getByText('Invalid input')).toBeInTheDocument();
		});
	});

	it('allows duplicate entries onChange', async () => {
		const { user } = setupTest(
			<EditorResourceComponent
				placeholder="Test"
				editorId={editor.id}
				onChange={onChangeMock}
				onSearchOptions={mockSearchOptions}
				resourcesValue={[defaultResource]}
				warningLabel=""
				singleWarningLabel=""
				invalidInputErrorLabel="Invalid input"
				duplicateChipsErrorLabel={'Duplicate input'}
			/>,
			{ store }
		);

		// existing default resource chip
		const chip = screen.getByTestId('chip');
		expect(chip).toHaveTextContent('DefaultResource');

		// try to add the same resource again
		const input = screen.getByPlaceholderText('Test');
		await user.type(input, 'DefaultResource');

		const dropDownItem = await screen.findByTestId('dropdown-item');
		expect(dropDownItem).toHaveTextContent('DefaultResource');

		await user.keyboard('{Enter}');

		await waitFor(() => {
			expect(onChangeMock).toHaveBeenCalled();
			const [chips] = onChangeMock.mock.calls.at(-1)!;
			expect(chips).toHaveLength(2);
			expect(dropDownItem).not.toBeInTheDocument();
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
				duplicateChipsErrorLabel={'Duplicate input'}
			/>,
			{ store }
		);

		await user.keyboard('[Enter]');

		expect(onChangeMock).not.toHaveBeenCalled();
		expect(screen.queryByText('Invalid input')).not.toBeInTheDocument();
	});

	it('should clear options after selecting a resource', async () => {
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
				duplicateChipsErrorLabel={'Duplicate input'}
			/>,
			{ store }
		);

		const input = screen.getByPlaceholderText('Test');
		await user.type(input, 'DefaultResource');
		await waitFor(() => expect(mockSearchOptions).toHaveBeenCalledWith('DefaultResource'));

		const dropDownItem = await screen.findByTestId('dropdown-item');
		expect(dropDownItem).toHaveTextContent('DefaultResource');

		await user.keyboard('{Control>}{Enter}{/Control}');

		expect(dropDownItem).not.toBeInTheDocument();
	});

	it('should select the first option when user press Control+Enter', async () => {
		const resource2: Resource = {
			id: 'r2',
			label: 'Room-B',
			email: 'roomb@example.com',
			type: 'Location'
		};

		const mockSearchOptions2 = jest.fn(async (_text: string) => [
			{
				id: '1',
				label: 'DefaultResource',
				value: defaultResource
			},
			{
				id: '2',
				label: 'Resource2',
				value: resource2
			}
		]);

		const { user } = setupTest(
			<EditorResourceComponent
				placeholder="Test"
				editorId={editor.id}
				onChange={onChangeMock}
				onSearchOptions={mockSearchOptions2}
				resourcesValue={[]}
				warningLabel=""
				singleWarningLabel=""
				invalidInputErrorLabel="Invalid input"
				duplicateChipsErrorLabel={'Duplicate input'}
			/>,
			{ store }
		);

		const input = screen.getByPlaceholderText('Test');
		await user.type(input, 'Resource');

		const dropDownItems = await screen.findAllByTestId('dropdown-item');
		expect(dropDownItems).toHaveLength(2);

		await user.keyboard('{Control>}{Enter}{/Control}');

		await waitFor(async () => {
			expect(onChangeMock).toHaveBeenCalledTimes(1);
			const [resources] = onChangeMock.mock.calls[0];
			expect(resources[0]).toMatchObject({
				label: defaultResource.label,
				email: defaultResource.email
			});
		});
	});

	it('shows loader while searching for options', async () => {
		const { user } = setupTest(
			<EditorResourceComponent
				placeholder="Test"
				editorId={editor.id}
				onChange={onChangeMock}
				onSearchOptions={() => new Promise((resolve) => setTimeout(() => resolve([]), 1000))}
				resourcesValue={[]}
				warningLabel=""
				singleWarningLabel=""
				invalidInputErrorLabel="Invalid input"
				duplicateChipsErrorLabel={'Duplicate input'}
			/>,
			{ store }
		);

		const input = screen.getByPlaceholderText('Test');
		await user.type(input, 'Meeting Room');

		await waitFor(() => {
			expect(screen.getByTestId('dropdown-options-loader')).toBeInTheDocument();
		});
	});

	it('shows edit action in added chip', async () => {
		const { user } = setupTest(
			<EditorResourceComponent
				placeholder="Test"
				editorId={editor.id}
				onChange={onChangeMock}
				onSearchOptions={mockSearchOptions}
				resourcesValue={[defaultResource]}
				warningLabel=""
				singleWarningLabel=""
				invalidInputErrorLabel="Invalid input"
				duplicateChipsErrorLabel={'Duplicate input'}
			/>,
			{ store }
		);

		const chip = screen.getByTestId('chip');
		expect(chip).toHaveTextContent('DefaultResource');

		const editButton = within(chip).getByTestId('icon: EditOutline');
		expect(editButton).toBeInTheDocument();

		await user.click(editButton);
		expect(onChangeMock).toHaveBeenCalledTimes(0); // No change on edit click
	});

	it('triggers onChange when user commit edit using edit chip action', async () => {
		const { user } = setupTest(
			<EditorResourceComponent
				placeholder="Test"
				editorId={editor.id}
				onChange={onChangeMock}
				onSearchOptions={mockSearchOptions}
				resourcesValue={[defaultResource]}
				warningLabel=""
				singleWarningLabel=""
				invalidInputErrorLabel="Invalid input"
				duplicateChipsErrorLabel={'Duplicate input'}
			/>,
			{ store }
		);

		const chip = screen.getByTestId('chip');
		expect(chip).toHaveTextContent('DefaultResource');

		const editButton = within(chip).getByTestId('icon: EditOutline');
		expect(editButton).toBeInTheDocument();

		await user.click(editButton);
		expect(onChangeMock).toHaveBeenCalledTimes(0);

		const input = screen.getByPlaceholderText('Test');

		await user.clear(input);
		await user.type(input, 'UpdatedResource');
		await user.keyboard('{Enter}');
		await waitFor(() => {
			expect(onChangeMock).toHaveBeenCalledTimes(1);
			const [resources] = onChangeMock.mock.calls[0];
			expect(resources[0]).toMatchObject({
				label: 'UpdatedResource',
				email: ''
			});
		});
	});

	it('should add resource chip when user presses NumberPadEnter after typing', async () => {
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
				duplicateChipsErrorLabel={'Duplicate input'}
			/>,
			{ store }
		);

		const input = screen.getByPlaceholderText('Test');
		await user.type(input, 'DefaultResource');
		await waitFor(() => expect(mockSearchOptions).toHaveBeenCalledWith('DefaultResource'));

		const dropDownItem = await screen.findByTestId('dropdown-item');
		expect(dropDownItem).toHaveTextContent('DefaultResource');

		fireEvent.keyDown(input, { code: 'NumpadEnter' });

		await waitFor(async () => {
			expect(onChangeMock).toHaveBeenCalledTimes(1);
			const [resources] = onChangeMock.mock.calls[0];
			expect(resources[0]).toMatchObject({
				label: 'DefaultResource',
				email: ''
			});
		});
	});
});
