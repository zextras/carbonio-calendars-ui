/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { screen } from '@testing-library/react';
import { useTheme } from '@zextras/carbonio-design-system';
import { ErrorSoapBodyResponse } from '@zextras/carbonio-shell-ui';

import * as itemAction from '../../../soap/item-action-request';
import { reducers } from '../../../store/redux';
import mockedData from '../../../test/generators';
import { DeletePermanently } from '../delete-permanently';
import { setupHook, setupTest } from '@test-setup';
import { createSoapAPIInterceptor } from '@test-utils/network/msw/create-api-interceptor';
import { buildSoapErrorResponseBody } from '@test-utils/utils/soap';

describe('delete-permanently', () => {
	it('renders a title', () => {
		const store = configureStore({ reducer: combineReducers(reducers) });
		setupTest(<DeletePermanently onClose={vi.fn()} event={mockedData.getEvent()} />, { store });

		expect(
			screen.getByText('Are you sure you want to delete this appointment permanently?')
		).toBeVisible();
	});
	it('has a title color text', () => {
		const store = configureStore({ reducer: combineReducers(reducers) });

		setupTest(
			<DeletePermanently
				onClose={vi.fn()}
				event={mockedData.getEvent({ resource: { isRecurrent: true } })}
			/>,
			{ store }
		);
		const { result } = setupHook(useTheme, { store });
		expect(
			screen.getByText('Are you sure you want to delete this appointment permanently?')
		).toHaveStyle(`color: ${result.current.palette.text.regular}`);
	});
	it('has a description color text', () => {
		const store = configureStore({ reducer: combineReducers(reducers) });

		setupTest(
			<DeletePermanently
				onClose={vi.fn()}
				event={mockedData.getEvent({ resource: { isRecurrent: true } })}
			/>,
			{ store }
		);
		const { result } = setupHook(useTheme, { store });
		expect(
			screen.getByText(
				'This will delete all occurrences of this appointment and you will not be able to recover it again, continue?'
			)
		).toHaveStyle(`color: ${result.current.palette.text.regular}`);
	});
	it('renders a recurrent description', () => {
		const store = configureStore({ reducer: combineReducers(reducers) });
		setupTest(
			<DeletePermanently
				onClose={vi.fn()}
				event={mockedData.getEvent({ resource: { isRecurrent: true } })}
			/>,
			{ store }
		);

		expect(
			screen.getByText(
				'This will delete all occurrences of this appointment and you will not be able to recover it again, continue?'
			)
		).toBeVisible();
	});
	it('renders a single event description', () => {
		const store = configureStore({ reducer: combineReducers(reducers) });
		setupTest(<DeletePermanently onClose={vi.fn()} event={mockedData.getEvent()} />, { store });

		expect(
			screen.getByText(
				'By deleting permanently this appointment you will not be able to recover it anymore, continue?'
			)
		).toBeVisible();
	});
	it('renders a button', () => {
		const store = configureStore({ reducer: combineReducers(reducers) });
		setupTest(<DeletePermanently onClose={vi.fn()} event={mockedData.getEvent()} />, { store });

		expect(screen.getByRole('button', { name: 'Delete permanently' })).toBeVisible();
	});
	it('is enabled by default', () => {
		const store = configureStore({ reducer: combineReducers(reducers) });
		setupTest(<DeletePermanently onClose={vi.fn()} event={mockedData.getEvent()} />, { store });

		expect(screen.getByRole('button', { name: 'Delete permanently' })).toBeEnabled();
	});
	it('has an error background color', () => {
		const store = configureStore({ reducer: combineReducers(reducers) });
		setupTest(<DeletePermanently onClose={vi.fn()} event={mockedData.getEvent()} />, { store });
		const { result } = setupHook(useTheme, { store });

		expect(screen.getByRole('button', { name: 'Delete permanently' })).toHaveStyle(
			`background-color: ${result.current.palette.error.regular}`
		);
	});
	it('onClick will call itemAction request', async () => {
		const store = configureStore({ reducer: combineReducers(reducers) });
		const itemActionSpy = vi.spyOn(itemAction, 'itemActionRequest');
		const { user } = setupTest(
			<DeletePermanently onClose={vi.fn()} event={mockedData.getEvent()} />,
			{ store }
		);
		await user.click(screen.getByRole('button', { name: 'Delete permanently' }));
		expect(itemActionSpy).toHaveBeenCalled();
	});
	it('onClick will call itemAction request with delete operation', async () => {
		const store = configureStore({ reducer: combineReducers(reducers) });
		const itemActionSpy = vi.spyOn(itemAction, 'itemActionRequest');
		const event = mockedData.getEvent();
		const { user } = setupTest(<DeletePermanently onClose={vi.fn()} event={event} />, { store });
		await user.click(screen.getByRole('button', { name: 'Delete permanently' }));
		expect(itemActionSpy).toHaveBeenCalledWith(expect.objectContaining({ op: 'delete' }));
	});

	it('onClick will call itemAction request with event id', async () => {
		const store = configureStore({ reducer: combineReducers(reducers) });
		const itemActionSpy = vi.spyOn(itemAction, 'itemActionRequest');
		const event = mockedData.getEvent();
		const { user } = setupTest(<DeletePermanently onClose={vi.fn()} event={event} />, { store });
		await user.click(screen.getByRole('button', { name: 'Delete permanently' }));
		expect(itemActionSpy).toHaveBeenCalledWith(expect.objectContaining({ id: event.resource.id }));
	});
	it('on success a successful snackbar will appear', async () => {
		const store = configureStore({ reducer: combineReducers(reducers) });
		const event = mockedData.getEvent();
		const { user } = setupTest(<DeletePermanently onClose={vi.fn()} event={event} />, { store });
		await user.click(screen.getByRole('button', { name: 'Delete permanently' }));

		expect(await screen.findByText('Permanent deletion completed successfully')).toBeVisible();
	});
	it('on fail an error snackbar will appear', async () => {
		const interceptor = createSoapAPIInterceptor<unknown, ErrorSoapBodyResponse>(
			'ItemAction',
			buildSoapErrorResponseBody()
		);

		const store = configureStore({ reducer: combineReducers(reducers) });
		const event = mockedData.getEvent();
		const { user } = setupTest(<DeletePermanently onClose={vi.fn()} event={event} />, { store });
		await user.click(screen.getByRole('button', { name: 'Delete permanently' }));
		await interceptor;
		expect(await screen.findByText('Something went wrong, please try again')).toBeVisible();
	});
});
