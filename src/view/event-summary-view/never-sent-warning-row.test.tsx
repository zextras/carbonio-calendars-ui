/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { screen } from '@testing-library/react';

import { NeverSentWarningRow } from './never-sent-warning-row';
import { setupTest } from '@test-setup';

describe('never sent warning row', () => {
	it('wont render any icon if neverSent is false', () => {
		setupTest(<NeverSentWarningRow neverSent={false} label={'label'} />);
		expect(screen.queryByTestId('icon: AlertCircleOutline')).not.toBeInTheDocument();
	});
	it('renders correctly', () => {
		setupTest(<NeverSentWarningRow neverSent label={'label'} />);
		expect(screen.getByTestId('icon: AlertCircleOutline')).toBeVisible();
	});
	it('renders a label', () => {
		setupTest(<NeverSentWarningRow neverSent label={'label'} />);
		expect(screen.getByText('label')).toBeVisible();
	});
});
