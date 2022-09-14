/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import moment from 'moment-timezone';
import { setupTest } from '../../test/utils/test-utils';
import EditorPanelWrapper from './editor-panel-wrapper';
import { generateStore } from '../../../__mocks__/generators/generators';

moment.tz.setDefault('America/New_York');

// jest.mock('react-widgets-moment', () => jest.fn());

test('Editor panel', async () => {
	const store = generateStore();
	const options = {
		preloadedState: store
	};
	setupTest(<EditorPanelWrapper />, options);
	screen.debug();
	// expect(screen.getByTestId('fake')).toHaveTextContent('6');
});
