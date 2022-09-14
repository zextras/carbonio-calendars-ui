/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';
import { screen } from '@testing-library/react';
import { FakeComponent } from './calendar-component';
import { setupTest } from '../../test/utils/test-utils';

test('Fake', async () => {
	const a = 5;
	const b = 1;
	setupTest(<FakeComponent a={a} b={b} />);
	expect(screen.getByTestId('fake')).toHaveTextContent('6');
});
