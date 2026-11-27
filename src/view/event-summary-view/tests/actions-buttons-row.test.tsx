/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { noop } from 'lodash';

import { ActionsButtonsRow } from '../actions-buttons-row';
import { setupTest, screen } from '@test-setup';
import { reducers } from 'store/redux';
import mockedData from 'test/generators';
import { EventType } from 'types/event';

const PRINT = 'action.print';
const SHOW_ORIGINAL = 'action.show_original';

const setup = (event: EventType): ReturnType<typeof setupTest> =>
	setupTest(<ActionsButtonsRow event={event} onClose={noop} />, {
		store: configureStore({ reducer: combineReducers(reducers) })
	});

// the labels of the open dropdown, in menu order
const menuLabels = (): Array<string | null> =>
	screen
		.getAllByText(/^action\./)
		.map((node) => node.textContent)
		.filter((label) => label === PRINT || label === SHOW_ORIGINAL);

describe('ActionsButtonsRow print action', () => {
	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it('should list print right above show original for a single appointment', async () => {
		const { user } = setup(mockedData.getEvent());

		await user.click(screen.getByRole('button', { name: /instance/i }));

		expect(screen.getByTestId('icon: PrinterOutline')).toBeVisible();
		expect(menuLabels()).toEqual([PRINT, SHOW_ORIGINAL]);
	});

	it('should list print right above show original in the instance dropdown of an occurrence', async () => {
		const { user } = setup(mockedData.getEvent({ resource: { isRecurrent: true } }));

		await user.click(screen.getByRole('button', { name: /instance/i }));

		expect(menuLabels()).toEqual([PRINT, SHOW_ORIGINAL]);
	});

	it('should not list print in the series dropdown of an occurrence', async () => {
		const { user } = setup(mockedData.getEvent({ resource: { isRecurrent: true } }));

		await user.click(screen.getByRole('button', { name: /series/i }));

		expect(screen.getByText(SHOW_ORIGINAL)).toBeVisible();
		expect(screen.queryByText(PRINT)).not.toBeInTheDocument();
	});

	it('should close the menu and start the print flow when print is selected', async () => {
		const open = vi.fn(() => null);
		vi.stubGlobal('open', open);
		const { user } = setup(mockedData.getEvent());

		await user.click(screen.getByRole('button', { name: /instance/i }));
		await user.click(screen.getByText(PRINT));

		expect(open).toHaveBeenCalledWith('', '_blank');
		expect(screen.queryByText(PRINT)).not.toBeInTheDocument();
		expect(await screen.findByText('message.print_popup_blocked')).toBeVisible();
	});
});
