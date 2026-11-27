/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { combineReducers, configureStore } from '@reduxjs/toolkit';

import { setupTest, screen } from '@test-setup';
import { PANEL_VIEW } from 'constants/index';
import { reducers } from 'store/redux';
import mockedData from 'test/generators';
import { EventType } from 'types/event';
import { DisplayerHeader } from 'view/event-panel-view/event-panel-view';

const PRINT = 'action.print';
const SHOW_ORIGINAL = 'action.show_original';

const setup = (event: EventType): ReturnType<typeof setupTest> =>
	setupTest(<DisplayerHeader event={event} panelView={PANEL_VIEW.APP} />, {
		store: configureStore({ reducer: combineReducers(reducers) })
	});

const openMoreActions = async (user: ReturnType<typeof setupTest>['user']): Promise<void> => {
	await user.click(screen.getByTestId('icon: MoreVertical'));
};

// the labels of the open menu, in menu order
const menuLabels = (): Array<string | null> =>
	screen
		.getAllByText(/^action\./)
		.map((node) => node.textContent)
		.filter((label) => label === PRINT || label === SHOW_ORIGINAL);

describe('DisplayerHeader print action', () => {
	it('should list print right above show original for a single appointment', async () => {
		const { user } = setup(mockedData.getEvent());

		await openMoreActions(user);

		expect(screen.getByTestId('icon: PrinterOutline')).toBeVisible();
		expect(menuLabels()).toEqual([PRINT, SHOW_ORIGINAL]);
	});

	it('should list print right above show original for an occurrence of a series', async () => {
		const { user } = setup(mockedData.getEvent({ resource: { isRecurrent: true } }));

		await openMoreActions(user);

		expect(menuLabels()).toEqual([PRINT, SHOW_ORIGINAL]);
	});

	it('should not list print when open on the entire series', async () => {
		const { user } = setup(
			mockedData.getEvent({ resource: { isRecurrent: true, ridZ: undefined } })
		);

		await openMoreActions(user);

		expect(screen.getByText(SHOW_ORIGINAL)).toBeVisible();
		expect(screen.queryByText(PRINT)).not.toBeInTheDocument();
	});
});
