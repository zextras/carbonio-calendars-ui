/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';
import { screen } from '@testing-library/react';
import moment from 'moment-timezone';
import { setupTest } from '../../test/utils/test-utils';
import EditorPanelWrapper from './editor-panel-wrapper';
import {
	generateCalendarSliceItem,
	generateEditorSliceItem,
	getRandomEditorId,
	mockEmptyStore
} from '../../../__mocks__/generators/generators';

moment.tz.setDefault('America/New_York');

// jest.mock('react-widgets-moment', () => jest.fn());

/* describe('Editor panel', async () => {
	const isNew = false;
	const editorId = getRandomEditorId(isNew);
	const calendars = {
		calendars: generateCalendarSliceItem()
	};
	const editor = {
		activeId: editorId,
		editors: generateEditorSliceItem({ editorId })
	};

	const store = mockEmptyStore({ calendars, editor });
	const options = {
		preloadedState: store
	};
	setupTest(<EditorPanelWrapper />, options);
	expect(
		screen.getByRole('textbox', {
			name: /Event title/i
		})
	).toHaveValue(editor.editors[editorId].title);
}); */

describe('Editor panel wrapper', () => {
	test('it doesnt render without editorid or callbacks', () => {
		const store = mockEmptyStore();
		const options = {
			preloadedState: store
		};
		setupTest(<EditorPanelWrapper />, options);
		expect(screen.queryByTestId('EditorPanel')).not.toBeInTheDocument();
		expect(screen.queryByTestId('EditorBackgroundContainer')).not.toBeInTheDocument();
		expect(screen.queryByTestId('AppointmentCardContainer')).not.toBeInTheDocument();
		expect(screen.queryByTestId('EditorHeader')).not.toBeInTheDocument();
	});
	describe('it renders with editorid and callbacks', () => {
		test('without background container when it is not expanded', () => {
			const isNew = false;
			const editorId = getRandomEditorId(isNew);
			const calendars = {
				calendars: generateCalendarSliceItem()
			};
			const editor = {
				activeId: editorId,
				editors: generateEditorSliceItem({ editorId })
			};

			const store = mockEmptyStore({ calendars, editor });
			const options = {
				preloadedState: store
			};
			setupTest(<EditorPanelWrapper />, options);
			expect(screen.getByTestId('EditorPanel')).toBeInTheDocument();
			expect(screen.getByTestId('EditorBackgroundContainer')).toBeInTheDocument();
			expect(screen.getByTestId('AppointmentCardContainer')).toBeInTheDocument();
			expect(screen.getByTestId('EditorHeader')).toBeInTheDocument();
		});
		test('with background container when it is expanded', () => {
			const isNew = false;
			const editorId = getRandomEditorId(isNew);
			const calendars = {
				calendars: generateCalendarSliceItem()
			};
			const editor = {
				activeId: editorId,
				editors: generateEditorSliceItem({ editorId })
			};

			const store = mockEmptyStore({ calendars, editor });
			const options = {
				preloadedState: store
			};
			setupTest(<EditorPanelWrapper />, options);
			// todo: click screen.getByTestId('icon: Expand') to expand the container to let the test pass
			expect(screen.getByTestId('EditorPanel')).toBeInTheDocument();
			expect(screen.getByTestId('EditorBackgroundContainer')).toBeInTheDocument();
			expect(screen.getByTestId('AppointmentCardContainer')).toBeInTheDocument();
			expect(screen.getByTestId('EditorHeader')).toBeInTheDocument();
		});
	});
});
