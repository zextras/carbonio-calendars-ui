import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { screen } from '@testing-library/react';
import React from 'react';
import { setupTest } from '../../carbonio-ui-commons/test/test-setup';
import { CALENDAR_APP_ID } from '../../constants';
import { reducers } from '../../store/redux';
import EditorPanelWrapper from './editor-panel-wrapper';
import { mockEmptyStore } from '../../test/generators/generators';

describe('Editor board wrapper', () => {
	test('it doesnt render without editorId or callbacks', () => {
		const emptyStore = mockEmptyStore();

		const store = configureStore({
			devTools: {
				name: CALENDAR_APP_ID
			},
			reducer: combineReducers(reducers),
			preloadedState: emptyStore
		});
		setupTest(<EditorPanelWrapper />, { store });
		expect(screen.queryByTestId('EditorPanel')).not.toBeInTheDocument();
		expect(screen.queryByTestId('EditorBackgroundContainer')).not.toBeInTheDocument();
		expect(screen.queryByTestId('AppointmentCardContainer')).not.toBeInTheDocument();
		expect(screen.queryByTestId('EditorHeader')).not.toBeInTheDocument();
	});
});
