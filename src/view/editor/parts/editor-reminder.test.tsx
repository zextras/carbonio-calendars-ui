/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { screen } from '@testing-library/react';

import { EditorReminder } from './editor-reminder';
import * as shell from '../../../carbonio-ui-commons/test/mocks/carbonio-shell-ui';
import defaultSettings from '../../../carbonio-ui-commons/test/mocks/settings/default-settings';
import { setupTest } from '../../../carbonio-ui-commons/test/test-setup';
import { generateEditor } from '../../../commons/editor-generator';
import { reducers } from '../../../store/redux';

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
