/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { combineReducers, configureStore, type EnhancedStore } from '@reduxjs/toolkit';
import { act, screen } from '@testing-library/react';
import { useActions } from '@zextras/carbonio-shell-ui';

import { EditorLocation } from './editor-location';
import { generateEditor } from '../../../commons/editor-generator';
import { reducers, type RootState } from '../../../store/redux';
import type { Editor } from '../../../types/editor';
import { setupTest } from '@test-setup';

const START = new Date('2026-11-10T09:00:00.000Z').getTime();
const END = new Date('2026-11-10T10:30:00.000Z').getTime();
const LOCATION = 'https://teams.example.com/meeting/123';
const NEW_LOCATION = 'https://teams.example.com/meeting/456';
const PROVIDER_BUTTON = 'icon: PinOutline';

const setupEditor = (
	overrides: Partial<Pick<Editor, 'allDay' | 'timezone' | 'start' | 'end'>> = {}
): { store: EnhancedStore<RootState>; editorId: string } => {
	const store = configureStore({ reducer: combineReducers(reducers) });
	const editor = generateEditor({
		context: {
			dispatch: store.dispatch,
			folders: {},
			title: 'Weekly sync',
			location: LOCATION,
			start: START,
			end: END,
			allDay: false,
			timezone: 'Europe/Rome',
			...overrides
		}
	});
	return { store, editorId: editor.id };
};

const mockLocationProvider = (): ReturnType<typeof vi.fn> => {
	const execute = vi.fn();
	vi.mocked(useActions).mockImplementation(() => [
		{ id: 'location-provider', label: 'Location provider', execute }
	]);
	return execute;
};

describe('EditorLocation', () => {
	test('without a location provider the provider button is not shown', () => {
		vi.mocked(useActions).mockImplementation(() => []);
		const { store, editorId } = setupEditor();

		setupTest(<EditorLocation editorId={editorId} />, { store });

		expect(screen.getByTestId('editor-location')).toBeVisible();
		expect(screen.queryByTestId(PROVIDER_BUTTON)).not.toBeInTheDocument();
	});

	test('the location provider receives title, start, end, location, all day and timezone of the event', async () => {
		const execute = mockLocationProvider();
		const { store, editorId } = setupEditor();

		const { user } = setupTest(<EditorLocation editorId={editorId} />, { store });
		await user.click(screen.getByTestId(PROVIDER_BUTTON));

		expect(execute).toHaveBeenCalledTimes(1);
		expect(execute).toHaveBeenCalledWith({
			eventTitle: 'Weekly sync',
			eventStartAt: new Date(START),
			eventEndAt: new Date(END),
			eventLocation: LOCATION,
			eventAllDay: false,
			eventTimezone: 'Europe/Rome',
			onConfirm: expect.any(Function)
		});
	});

	test('the location provider receives all day true for an all day event', async () => {
		const execute = mockLocationProvider();
		const { store, editorId } = setupEditor({ allDay: true, timezone: 'America/New_York' });

		const { user } = setupTest(<EditorLocation editorId={editorId} />, { store });
		await user.click(screen.getByTestId(PROVIDER_BUTTON));

		expect(execute).toHaveBeenCalledWith(
			expect.objectContaining({ eventAllDay: true, eventTimezone: 'America/New_York' })
		);
	});

	test('the location provider receives no dates, not invalid ones, when the editor has no start and end', async () => {
		const execute = mockLocationProvider();
		const { store, editorId } = setupEditor({ start: undefined, end: undefined });

		const { user } = setupTest(<EditorLocation editorId={editorId} />, { store });
		await user.click(screen.getByTestId(PROVIDER_BUTTON));

		expect(execute).toHaveBeenCalledWith(
			expect.objectContaining({ eventStartAt: undefined, eventEndAt: undefined })
		);
	});

	test('the location provider receives the location just typed, before it is saved in the editor', async () => {
		const execute = mockLocationProvider();
		const { store, editorId } = setupEditor();

		const { user } = setupTest(<EditorLocation editorId={editorId} />, { store });
		const input = screen.getByRole('textbox');
		await user.clear(input);
		await user.type(input, 'Room 1');
		expect(store.getState().editor.editors[editorId].location).toBe(LOCATION);
		await user.click(screen.getByTestId(PROVIDER_BUTTON));

		expect(execute).toHaveBeenCalledWith(expect.objectContaining({ eventLocation: 'Room 1' }));
	});

	test('the location confirmed by the provider replaces the input value and the editor location', async () => {
		const execute = mockLocationProvider();
		const { store, editorId } = setupEditor();

		const { user } = setupTest(<EditorLocation editorId={editorId} />, { store });
		await user.click(screen.getByTestId(PROVIDER_BUTTON));
		const { onConfirm } = execute.mock.calls[0][0];
		act(() => {
			onConfirm(NEW_LOCATION);
			vi.advanceTimersByTime(500);
		});

		expect(screen.getByRole('textbox')).toHaveValue(NEW_LOCATION);
		expect(store.getState().editor.editors[editorId].location).toBe(NEW_LOCATION);
	});

	test('a location confirmed by the provider that is not a string leaves the location as it was', async () => {
		const execute = mockLocationProvider();
		const { store, editorId } = setupEditor();

		const { user } = setupTest(<EditorLocation editorId={editorId} />, { store });
		await user.click(screen.getByTestId(PROVIDER_BUTTON));
		const { onConfirm } = execute.mock.calls[0][0];
		act(() => {
			onConfirm(undefined);
			vi.advanceTimersByTime(500);
		});
		await user.click(screen.getByTestId(PROVIDER_BUTTON));

		expect(execute).toHaveBeenLastCalledWith(expect.objectContaining({ eventLocation: LOCATION }));
		expect(screen.getByRole('textbox')).toHaveValue(LOCATION);
		expect(store.getState().editor.editors[editorId].location).toBe(LOCATION);
	});
});
