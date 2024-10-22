/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { screen } from '@testing-library/react';

import { EditorVirtualRoom } from './editor-virtual-room';
import * as shell from '../../../carbonio-ui-commons/test/mocks/carbonio-shell-ui';
import { setupTest } from '../../../carbonio-ui-commons/test/test-setup';
import { reducers } from '../../../store/redux';

const store = configureStore({ reducer: combineReducers(reducers) });

const chatsIntegrationDataTestId = 'chats-room-component';
const wscIntegrationDataTestId = 'wsc-room-component';

const FakeChatsIntegrationComponent = jest.fn(
	(): React.JSX.Element => <div data-testid={chatsIntegrationDataTestId} />
);

const FakeWscIntegrationComponent = jest.fn(
	(): React.JSX.Element => <div data-testid={wscIntegrationDataTestId} />
);

describe('Editor virtual rooms', () => {
	test('If only ChatsRoomSelector is available, it should be rendered', () => {
		jest
			.spyOn(shell, 'useIntegratedComponent')
			.mockReturnValueOnce([FakeChatsIntegrationComponent, true]);
		jest
			.spyOn(shell, 'useIntegratedComponent')
			.mockReturnValueOnce([FakeWscIntegrationComponent, false]);
		setupTest(<EditorVirtualRoom editorId={'editorId'} />, { store });

		expect(screen.getByTestId(chatsIntegrationDataTestId)).toBeInTheDocument();
	});

	test('If only WscRoomSelector is available, it should be rendered', () => {
		jest
			.spyOn(shell, 'useIntegratedComponent')
			.mockReturnValueOnce([FakeChatsIntegrationComponent, false]);
		jest
			.spyOn(shell, 'useIntegratedComponent')
			.mockReturnValueOnce([FakeWscIntegrationComponent, true]);
		setupTest(<EditorVirtualRoom editorId={'editorId'} />, { store });

		expect(screen.getByTestId(wscIntegrationDataTestId)).toBeInTheDocument();
	});

	test('If ChatsRoomSelector and WscRoomSelector are both available, only ChatsRoomSelector should be rendered', () => {
		jest
			.spyOn(shell, 'useIntegratedComponent')
			.mockReturnValueOnce([FakeChatsIntegrationComponent, true]);
		jest
			.spyOn(shell, 'useIntegratedComponent')
			.mockReturnValueOnce([FakeWscIntegrationComponent, true]);
		setupTest(<EditorVirtualRoom editorId={'editorId'} />, { store });

		expect(screen.getByTestId(chatsIntegrationDataTestId)).toBeInTheDocument();
	});

	test('If ChatsRoomSelector and WscRoomSelector are both unavailable, nothing should be rendered', () => {
		jest
			.spyOn(shell, 'useIntegratedComponent')
			.mockReturnValueOnce([FakeChatsIntegrationComponent, false]);
		jest
			.spyOn(shell, 'useIntegratedComponent')
			.mockReturnValueOnce([FakeWscIntegrationComponent, false]);
		setupTest(<EditorVirtualRoom editorId={'editorId'} />, { store });

		expect(screen.queryByTestId(chatsIntegrationDataTestId)).not.toBeInTheDocument();
		expect(screen.queryByTestId(wscIntegrationDataTestId)).not.toBeInTheDocument();
	});
});
