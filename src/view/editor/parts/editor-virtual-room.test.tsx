/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { screen } from '@testing-library/react';

import { EditorVirtualRoom } from './editor-virtual-room';
import { reducers } from '../../../store/redux';
import * as shell from '@test-mocks/@zextras/carbonio-shell-ui';
import { setupTest } from '@test-setup';

const store = configureStore({ reducer: combineReducers(reducers) });

const chatsIntegrationDataTestId = 'chats-room-component';
const wscIntegrationDataTestId = 'wsc-room-component';

const FakeChatsIntegrationComponent = vi.fn(
	(): React.JSX.Element => <div data-testid={chatsIntegrationDataTestId} />
);

const FakeWscIntegrationComponent = vi.fn(
	(): React.JSX.Element => <div data-testid={wscIntegrationDataTestId} />
);

const spyUseIntegratedIntegration = (chatsIsEnabled: boolean, wscIsEnabled: boolean): void => {
	vi.spyOn(shell, 'useIntegratedComponent').mockImplementation((id: string) => {
		if (id === 'room-selector') return [FakeChatsIntegrationComponent, chatsIsEnabled];
		if (id === 'wsc-room-selector') return [FakeWscIntegrationComponent, wscIsEnabled];
		return [vi.fn(), false];
	});
};

describe('Editor virtual rooms', () => {
	test('If only ChatsRoomSelector is available, it should be rendered', () => {
		spyUseIntegratedIntegration(true, false);
		setupTest(<EditorVirtualRoom editorId={'editorId'} />, { store });

		expect(screen.getByTestId(chatsIntegrationDataTestId)).toBeInTheDocument();
	});

	test('If only WscRoomSelector is available, it should be rendered', () => {
		spyUseIntegratedIntegration(false, true);
		setupTest(<EditorVirtualRoom editorId={'editorId'} />, { store });

		expect(screen.getByTestId(wscIntegrationDataTestId)).toBeInTheDocument();
	});

	test('If ChatsRoomSelector and WscRoomSelector are both available, only ChatsRoomSelector should be rendered', () => {
		spyUseIntegratedIntegration(true, true);
		setupTest(<EditorVirtualRoom editorId={'editorId'} />, { store });

		expect(screen.getByTestId(chatsIntegrationDataTestId)).toBeInTheDocument();
		expect(screen.queryByTestId(wscIntegrationDataTestId)).not.toBeInTheDocument();
	});

	test('If ChatsRoomSelector and WscRoomSelector are both unavailable, nothing should be rendered', () => {
		spyUseIntegratedIntegration(false, false);
		setupTest(<EditorVirtualRoom editorId={'editorId'} />, { store });

		expect(screen.queryByTestId(chatsIntegrationDataTestId)).not.toBeInTheDocument();
		expect(screen.queryByTestId(wscIntegrationDataTestId)).not.toBeInTheDocument();
	});
});
