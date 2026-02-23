/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { waitFor } from '@testing-library/react';
import { getRootsArray } from '@zextras/carbonio-ui-commons';

import { SharedAccountAccordion } from './shared-account-accordion';
import { reducers } from '../../store/redux';
import { useLocalStorage } from '@test-mocks/@zextras/carbonio-shell-ui';
import { screen, setupTest } from '@test-setup';
import { populateFoldersStore } from '@test-utils/store/folders';
import { getMocksContext } from '@test-utils/utils/mocks-context';

const store = configureStore({ reducer: combineReducers(reducers) });

function setupSharedAccountTest(): {
	email: string;
	sharedAccount: { id: string; name: string };
} {
	populateFoldersStore();
	const mocksContext = getMocksContext();
	useLocalStorage.mockReturnValue([[], vi.fn()]);

	const { sendOnBehalf } = mocksContext.identities;
	const {
		identity: { email }
	} = sendOnBehalf[0];

	const rootsArray = getRootsArray();
	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	const sharedAccount = rootsArray.find((root) => root.name === email)!;

	return { email, sharedAccount };
}

describe('SharedAccountAccordion', () => {
	it('should render Accordion correctly when valid shared account ID passed', () => {
		const { email, sharedAccount } = setupSharedAccountTest();

		setupTest(<SharedAccountAccordion rootId={sharedAccount.id} />, { store });

		expect(screen.getByText(email)).toBeInTheDocument();
	});

	it('should not render Accordion when invalid shared account ID passed', () => {
		const { email, sharedAccount } = setupSharedAccountTest();

		setupTest(<SharedAccountAccordion rootId={`${sharedAccount.id}invalid`} />, { store });

		expect(screen.queryByText(email)).not.toBeInTheDocument();
	});

	it('should show calendars when shared account accordion is expanded', async () => {
		const { sharedAccount } = setupSharedAccountTest();

		const { user } = setupTest(<SharedAccountAccordion rootId={sharedAccount.id} />, { store });

		const accordionButton = screen.getAllByRole('button');
		await user.click(accordionButton[0]);

		const calendarItem = screen.getByText('Calendar');

		expect(calendarItem).toBeInTheDocument();
	});

	it('should update the open status in local storage when accordion is toggled', async () => {
		const { sharedAccount } = setupSharedAccountTest();

		const funMock = vi.fn();
		useLocalStorage.mockReturnValue([[], funMock]);

		const { user } = setupTest(<SharedAccountAccordion rootId={sharedAccount.id} />, { store });

		const accordionButton = screen.getAllByRole('button');
		await user.click(accordionButton[0]);
		const calendarElement = screen.getByText('Calendar');
		expect(calendarElement).toBeVisible();

		expect(funMock).toHaveBeenLastCalledWith([sharedAccount.id]);

		await user.click(accordionButton[0]);
		await waitFor(() => {
			expect(calendarElement).not.toBeVisible();
		});

		expect(funMock).toHaveBeenLastCalledWith([]);
	});
});
