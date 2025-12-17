/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { screen } from '@testing-library/react';

import { EditorReminder } from './editor-reminder';
import { generateEditor } from '../../../commons/editor-generator';
import { reducers } from '../../../store/redux';
import * as shell from '@test-mocks/@zextras/carbonio-shell-ui';
import { setupTest } from '@test-setup';
import defaultSettings from '@test-utils/settings/default-settings';

shell.getUserSettings.mockImplementation(() => ({
	...defaultSettings,
	prefs: {
		...defaultSettings.prefs,
		zimbraPrefCalendarApptReminderWarningTime: '0'
	}
}));

describe('editor reminder', () => {
	test('if setting is set to 0 the default selected value will be never', async () => {
		const store = configureStore({ reducer: combineReducers(reducers) });
		const editor = generateEditor({ context: { dispatch: store.dispatch, folders: {} } });

		setupTest(<EditorReminder editorId={editor.id} />, { store });

		expect(screen.getByText('Never')).toBeVisible();
	});
});
