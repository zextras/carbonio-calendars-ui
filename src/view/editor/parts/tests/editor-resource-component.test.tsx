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
import { setupTest } from '@test-setup';

import { EditorResourceComponent } from '../editor-resource-component';

describe('EditorResourceComponent', () => {
	let store: ReturnType<typeof configureStore>;
	let editor: ReturnType<typeof generateEditor>;
	const onChangeMock = vi.fn();

	const defaultResource: Resource = {
		id: 'r1',
		label: 'DefaultResource',
		email: 'default@example.com',
		type: 'Location'
	};
	const mockSearchOptions = vi.fn(async (_text: string) => [
		{
			id: '1',
			label: 'DefaultResource',
			value: defaultResource
		}
	]);

	const errorLabelsForTesting = {
		singleResourceUnavailable: 'Resource unavailable',
		multipleResourcesUnavailable: 'Multiple resources unavailable',
		invalidResource: 'Invalid input',
		duplicateResources: 'Duplicate input'
	};

	beforeEach(() => {
		store = configureStore({ reducer: combineReducers(reducers) });
		editor = generateEditor({ context: { dispatch: store.dispatch, folders: {} } });
		onChangeMock.mockClear();
		mockSearchOptions.mockClear();
	});

	describe('Initial Rendering', () => {
		it('renders the component with provided resources', () => {
			setupTest(
				<EditorResourceComponent
					placeholder="Test"
					editorId={editor.id}
					onChange={onChangeMock}
					onSearchOptions={() => Promise.resolve([])}
					resourcesValue={[defaultResource]}
					errorLabels={errorLabelsForTesting}
				/>,
				{ store }
			);

			expect(screen.getByPlaceholderText('Test')).toBeInTheDocument();
			const chip = screen.getByTestId('chip');
			expect(chip).toHaveTextContent('DefaultResource');
		});
	});

	describe('Resource Selection', () => {
		it('allows adding a valid resource via search', async () => {
			const { user } = setupTest(
				<EditorResourceComponent
					placeholder="Test"
					editorId={editor.id}
					onChange={onChangeMock}
					onSearchOptions={mockSearchOptions}
					resourcesValue={[]}
					errorLabels={errorLabelsForTesting}
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

		it('should select the first option when user press Control+Enter', async () => {
			const resource2: Resource = {
				id: 'r2',
				label: 'Room-B',
				email: 'roomb@example.com',
				type: 'Location'
			};

			const mockSearchOptions2 = vi.fn(async (_text: string) => [
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
					errorLabels={errorLabelsForTesting}
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
					errorLabels={errorLabelsForTesting}
				/>,
				{ store }
			);

			const input = screen.getByPlaceholderText('Test');
			await user.type(input, 'Meeting Room');

			await waitFor(() => {
				expect(screen.getByTestId('dropdown-options-loader')).toBeInTheDocument();
			});
		});
	});

	describe('Input Validation', () => {
		it('adds invalid chip manually and shows error', async () => {
			const { user } = setupTest(
				<EditorResourceComponent
					placeholder="Test"
					editorId={editor.id}
					onChange={onChangeMock}
					onSearchOptions={mockSearchOptions}
					resourcesValue={[]}
					errorLabels={errorLabelsForTesting}
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

		it('should not add resource on Enter key if input is empty', async () => {
			const { user } = setupTest(
				<EditorResourceComponent
					placeholder="Test"
					editorId={editor.id}
					onChange={onChangeMock}
					onSearchOptions={mockSearchOptions}
					resourcesValue={[]}
					errorLabels={errorLabelsForTesting}
				/>,
				{ store }
			);

			await user.keyboard('[Enter]');

			expect(onChangeMock).not.toHaveBeenCalled();
			expect(screen.queryByText('Invalid input')).not.toBeInTheDocument();
		});

		it('shows duplicate error when adding a resource with the same id', async () => {
			setupTest(
				<EditorResourceComponent
					placeholder="Test"
					editorId={editor.id}
					onChange={onChangeMock}
					onSearchOptions={mockSearchOptions}
					resourcesValue={[defaultResource, defaultResource]}
					errorLabels={errorLabelsForTesting}
				/>,
				{ store }
			);

			await waitFor(async () => {
				expect(screen.getByText('Duplicate input')).toBeInTheDocument();
			});
		});

		it('shows invalid input error when there is at least one invalid input and multiple duplicate resource with the same id', async () => {
			setupTest(
				<EditorResourceComponent
					placeholder="Test"
					editorId={editor.id}
					onChange={onChangeMock}
					onSearchOptions={mockSearchOptions}
					resourcesValue={[{ label: 'chip101', email: '' }, defaultResource, defaultResource]}
					errorLabels={errorLabelsForTesting}
				/>,
				{ store }
			);

			await waitFor(() => {
				expect(screen.getByText('Invalid input')).toBeInTheDocument();
			});
		});
	});

	describe('Duplicate Handling', () => {
		it('allows duplicate entries onChange', async () => {
			const { user } = setupTest(
				<EditorResourceComponent
					placeholder="Test"
					editorId={editor.id}
					onChange={onChangeMock}
					onSearchOptions={mockSearchOptions}
					resourcesValue={[defaultResource]}
					errorLabels={errorLabelsForTesting}
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
	});

	describe('Keyboard Interactions', () => {
		it('should add resource chip when user presses NumberPadEnter after typing', async () => {
			const { user } = setupTest(
				<EditorResourceComponent
					placeholder="Test"
					editorId={editor.id}
					onChange={onChangeMock}
					onSearchOptions={() => Promise.resolve([])}
					resourcesValue={[]}
					errorLabels={errorLabelsForTesting}
				/>,
				{ store }
			);

			const input = screen.getByPlaceholderText('Test');
			await user.type(input, 'resource1');

			fireEvent.keyDown(input, { code: 'NumpadEnter' });

			await waitFor(async () => {
				expect(onChangeMock).toHaveBeenCalledTimes(1);
				const [resources] = onChangeMock.mock.calls[0];
				expect(resources[0]).toMatchObject({
					label: 'resource1',
					email: ''
				});
			});
		});
		it('should add resource chip when user presses Enter after typing exact match', async () => {
			const { user } = setupTest(
				<EditorResourceComponent
					placeholder="Test"
					editorId={editor.id}
					onChange={onChangeMock}
					onSearchOptions={mockSearchOptions}
					resourcesValue={[]}
					errorLabels={errorLabelsForTesting}
				/>,
				{ store }
			);

			const input = screen.getByPlaceholderText('Test');
			await user.type(input, 'DefaultResource');

			const dropDownItem = await screen.findByTestId('dropdown-item');
			expect(dropDownItem).toHaveTextContent('DefaultResource');

			await user.keyboard('{Enter}');

			await waitFor(async () => {
				expect(onChangeMock).toHaveBeenCalledTimes(1);
				const [resources] = onChangeMock.mock.calls[0];
				expect(resources[0]).toMatchObject({
					label: 'DefaultResource',
					email: defaultResource.email // Ensure email is included
				});
			});
		});
	});

	describe('Chip Editing', () => {
		it('shows edit action in added chip', async () => {
			const { user } = setupTest(
				<EditorResourceComponent
					placeholder="Test"
					editorId={editor.id}
					onChange={onChangeMock}
					onSearchOptions={mockSearchOptions}
					resourcesValue={[defaultResource]}
					errorLabels={errorLabelsForTesting}
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
					errorLabels={errorLabelsForTesting}
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
	});

	describe('Options Management', () => {
		it('should clear options after selecting a resource', async () => {
			const { user } = setupTest(
				<EditorResourceComponent
					placeholder="Test"
					editorId={editor.id}
					onChange={onChangeMock}
					onSearchOptions={mockSearchOptions}
					resourcesValue={[]}
					errorLabels={errorLabelsForTesting}
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
	});

	describe('Unified Error Reporting', () => {
		const availableResource: Resource = {
			id: 'available-room',
			label: 'Available Room',
			email: 'availableroom@example.com',
			type: 'Location'
		};

		const invalidResource: Resource = {
			id: '',
			label: 'Invalid Resource',
			email: '',
			type: 'Location'
		};

		it('shows validation error with highest priority when resource is invalid', async () => {
			setupTest(
				<EditorResourceComponent
					placeholder="Test"
					editorId={editor.id}
					onChange={onChangeMock}
					onSearchOptions={mockSearchOptions}
					resourcesValue={[invalidResource]}
					errorLabels={{
						singleResourceUnavailable: 'Resource unavailable',
						multipleResourcesUnavailable: 'Multiple resources unavailable',
						invalidResource: 'Invalid input detected',
						duplicateResources: 'Duplicate resources detected'
					}}
				/>,
				{ store }
			);

			await waitFor(() => {
				expect(screen.getByText('Invalid input detected')).toBeInTheDocument();
				expect(screen.queryByText('Multiple resources unavailable')).not.toBeInTheDocument();
				expect(screen.queryByText('Duplicate resources detected')).not.toBeInTheDocument();
			});
		});

		it('shows duplicate error when no validation errors exist', async () => {
			setupTest(
				<EditorResourceComponent
					placeholder="Test"
					editorId={editor.id}
					onChange={onChangeMock}
					onSearchOptions={mockSearchOptions}
					resourcesValue={[defaultResource, defaultResource]}
					errorLabels={{
						singleResourceUnavailable: 'Resource unavailable',
						multipleResourcesUnavailable: 'Multiple resources unavailable',
						invalidResource: 'Invalid input detected',
						duplicateResources: 'Duplicate resources detected'
					}}
				/>,
				{ store }
			);

			await waitFor(() => {
				expect(screen.getByText('Duplicate resources detected')).toBeInTheDocument();
				expect(screen.queryByText('Invalid input detected')).not.toBeInTheDocument();
				expect(screen.queryByText('Multiple resources unavailable')).not.toBeInTheDocument();
			});
		});

		it('shows no error when all resources are valid and available', async () => {
			const mockUseAttendeesAvailability = vi.fn();

			vi.mock('../../../../hooks/use-attendees-availability', () => ({
				useAttendeesAvailability: () => mockUseAttendeesAvailability()
			}));

			mockUseAttendeesAvailability.mockReturnValue([
				{
					id: availableResource.id,
					email: availableResource.email,
					b: [],
					f: [{ s: 1640995200000, e: 1641081600000 }],
					t: []
				}
			]);

			setupTest(
				<EditorResourceComponent
					placeholder="Test"
					editorId={editor.id}
					onChange={onChangeMock}
					onSearchOptions={mockSearchOptions}
					resourcesValue={[availableResource]}
					errorLabels={{
						singleResourceUnavailable: 'Resource unavailable',
						multipleResourcesUnavailable: 'Multiple resources unavailable',
						invalidResource: 'Invalid input detected',
						duplicateResources: 'Duplicate resources detected'
					}}
				/>,
				{ store }
			);

			await waitFor(() => {
				expect(screen.queryByText('Multiple resources unavailable')).not.toBeInTheDocument();
				expect(screen.queryByText('Resource unavailable')).not.toBeInTheDocument();
				expect(screen.queryByText('Invalid input detected')).not.toBeInTheDocument();
				expect(screen.queryByText('Duplicate resources detected')).not.toBeInTheDocument();
			});

			vi.unmock('../../../../hooks/use-attendees-availability');
		});
	});
});
