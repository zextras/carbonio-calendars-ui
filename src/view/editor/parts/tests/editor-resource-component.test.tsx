/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { screen } from '@testing-library/react';
import { DropdownItem } from '@zextras/carbonio-design-system';

import { setupTest } from '@zextras/carbonio-ui-commons';
import { generateEditor } from '../../../../commons/editor-generator';
import { TEST_SELECTORS } from '../../../../constants/test-utils';
import { reducers } from '../../../../store/redux';
import { Resource } from '../../../../types/editor';
import { EditorResourceComponent } from '../editor-resource-component';

function mockSearchOptions(): Promise<Array<DropdownItem & { value?: Resource }>> {
	return Promise.resolve([
		{
			id: '1',
			label: 'First Option',
			value: {
				label: 'My resource',
				email: 'mynewresource@test.com'
			}
		}
	]);
}
describe('EditorResourceComponent', () => {
	it('should clear typed text after selecting the first option with enter', async () => {
		const store = configureStore({ reducer: combineReducers(reducers) });
		const editor = generateEditor({ context: { dispatch: store.dispatch, folders: {} } });
		const onChangeMock = jest.fn();
		const { user } = setupTest(
			<EditorResourceComponent
				placeholder={'Test'}
				editorId={editor.id}
				onChange={onChangeMock}
				onSearchOptions={mockSearchOptions}
				resourcesValue={[]}
				warningLabel={''}
				singleWarningLabel={''}
			/>,
			{ store }
		);

		const resourceInput = screen.getByRole('textbox', { name: 'Test' });
		await user.type(resourceInput, 'aaaaaa');
		const dropdown = await screen.findByTestId(TEST_SELECTORS.DROPDOWN);
		await user.keyboard('[Enter]');

		expect(dropdown).not.toBeInTheDocument();
		expect(resourceInput).toHaveValue('');
	});

	it('should not remove current chips after selecting the first option with Enter', async () => {
		const store = configureStore({ reducer: combineReducers(reducers) });
		const editor = generateEditor({ context: { dispatch: store.dispatch, folders: {} } });
		const onChangeMock = jest.fn();
		const resource1 = {
			label: 'My resource 1',
			email: 'myresource@test.com'
		};
		const { user } = setupTest(
			<EditorResourceComponent
				placeholder={'Test'}
				editorId={editor.id}
				onChange={onChangeMock}
				onSearchOptions={mockSearchOptions}
				resourcesValue={[resource1]}
				warningLabel={''}
				singleWarningLabel={''}
			/>,
			{ store }
		);

		const resourceInput = screen.getByRole('textbox', { name: 'Test' });
		await user.type(resourceInput, 'aaaaaa');
		const dropdown = await screen.findByTestId(TEST_SELECTORS.DROPDOWN);
		await user.keyboard('[Enter]');
		expect(dropdown).not.toBeInTheDocument();
		expect(onChangeMock).toHaveBeenCalledWith([
			resource1,
			expect.objectContaining({ email: 'mynewresource@test.com' })
		]);
	});
});
