/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { screen } from '@testing-library/react';
import * as shell from '@zextras/carbonio-ui-commons';
import defaultSettings from '@zextras/carbonio-ui-commons';

import { EditorReminder } from './editor-reminder';
import { generateEditor } from '../../../commons/editor-generator';
import { reducers } from '../../../store/redux';
import { setupTest } from '@test-setup';

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
