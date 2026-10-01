/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { ZIMBRA_STANDARD_COLORS } from '@zextras/carbonio-ui-commons';

import { screen, setupTest } from '../../../__test__/test-setup';
import { EventType } from '../../../types/event';
import { TagsDropdownItem } from '../tag-actions';

const event = { resource: { id: '1', tags: [] } } as unknown as EventType;

describe('TagsDropdownItem', () => {
	it('colors the tag icon with the custom color of the tag', () => {
		setupTest(<TagsDropdownItem tag={{ id: '10', name: 'work', rgb: '#abcdef' }} event={event} />);

		expect(screen.getByTestId('icon: TagOutline')).toHaveStyleRule('color', '#abcdef');
	});

	it('colors the tag icon with the standard color of the tag', () => {
		setupTest(<TagsDropdownItem tag={{ id: '10', name: 'work', color: 4 }} event={event} />);

		expect(screen.getByTestId('icon: TagOutline')).toHaveStyleRule(
			'color',
			ZIMBRA_STANDARD_COLORS[4].hex
		);
	});
});
