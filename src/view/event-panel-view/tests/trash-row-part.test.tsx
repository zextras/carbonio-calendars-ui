/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { screen } from '@testing-library/react';
import { format } from 'date-fns';

import { TrashRow } from '../trash-row-part';
import { TIME_FORMAT_PREF_NAME } from '../../../commons/time-format';
import { reducers } from '../../../store/redux';
import mockedData from '../../../test/generators';
import { setupTest } from '@test-setup';
import defaultSettings from '@test-utils/settings/default-settings';
import * as shell from '@test-mocks/@zextras/carbonio-shell-ui';

describe('TrashRow', () => {
	it('shows the event date and time in 12-hour format by default', () => {
		const event = mockedData.getEvent();
		const store = configureStore({ reducer: combineReducers(reducers) });

		setupTest(<TrashRow event={event} />, { store });

		const text = `${format(event.start, 'dd/MM/yyyy')}, [${format(event.start, 'hh:mm a')}]-[${format(event.end, 'hh:mm a')}]`;
		expect(screen.getByText(text)).toBeVisible();
	});

	it('shows the event date and time in 24-hour format when the time format pref is TRUE', () => {
		shell.useUserSettings.mockReturnValueOnce({
			...defaultSettings,
			prefs: { ...defaultSettings.prefs, [TIME_FORMAT_PREF_NAME]: '24h' }
		});
		const event = mockedData.getEvent();
		const store = configureStore({ reducer: combineReducers(reducers) });

		setupTest(<TrashRow event={event} />, { store });

		const text = `${format(event.start, 'dd/MM/yyyy')}, [${format(event.start, 'HH:mm')}]-[${format(event.end, 'HH:mm')}]`;
		expect(screen.getByText(text)).toBeVisible();
	});
});
