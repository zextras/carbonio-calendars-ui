/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { Tag, useTagStore, ZIMBRA_STANDARD_COLORS } from '@zextras/carbonio-ui-commons';

import { screen, setupTest } from '../../__test__/test-setup';
import { EventType } from '../../types/event';
import { TagIconComponent } from '../tag-icon-component';

const buildEvent = (tags: Array<string>): EventType =>
	({ resource: { id: '1', tags } }) as unknown as EventType;

const setTags = (tags: Array<Tag>): void => {
	useTagStore.setState({ tags: Object.fromEntries(tags.map((tag) => [tag.id, tag])) });
};

describe('TagIconComponent', () => {
	it('colors the single tag icon with the custom color of the tag', () => {
		setTags([{ id: '10', name: 'work', rgb: '#abcdef' }]);

		setupTest(<TagIconComponent event={buildEvent(['10'])} />);

		expect(screen.getByTestId('TagSingleIcon')).toHaveStyleRule('color', '#abcdef');
	});

	it('colors the single tag icon with the standard color of the tag', () => {
		setTags([{ id: '10', name: 'work', color: 4 }]);

		setupTest(<TagIconComponent event={buildEvent(['10'])} />);

		expect(screen.getByTestId('TagSingleIcon')).toHaveStyleRule(
			'color',
			ZIMBRA_STANDARD_COLORS[4].hex
		);
	});

	it('colors each tag in the multi-tag dropdown with its own color', async () => {
		setTags([
			{ id: '10', name: 'work', rgb: '#abcdef' },
			{ id: '11', name: 'home', color: 4 }
		]);

		const { user } = setupTest(<TagIconComponent event={buildEvent(['10', '11'])} />);
		await user.click(screen.getByTestId('TagMultiIcon'));

		// tags are listed sorted by name: "home", then "work"
		const [homeIcon, workIcon] = screen.getAllByTestId('icon: Tag');
		expect(homeIcon).toHaveStyleRule('color', ZIMBRA_STANDARD_COLORS[4].hex);
		expect(workIcon).toHaveStyleRule('color', '#abcdef');
	});
});
