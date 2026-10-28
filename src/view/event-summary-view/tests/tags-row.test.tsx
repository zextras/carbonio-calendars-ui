/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import {
	Tag,
	useRunSearchIntegration,
	useTagStore,
	ZIMBRA_STANDARD_COLORS
} from '@zextras/carbonio-ui-commons';

import { screen, setupTest } from '../../../__test__/test-setup';
import { EventType } from '../../../types/event';
import TagsRow from '../tags-row';

vi.mock('@zextras/carbonio-ui-commons', async () => ({
	...(await vi.importActual('@zextras/carbonio-ui-commons')),
	useRunSearchIntegration: vi.fn()
}));

const event = { resource: { id: '1', tags: ['10', '11'] } } as unknown as EventType;
const customTag: Tag = { id: '10', name: 'work', rgb: '#abcdef' };
const standardTag: Tag = { id: '11', name: 'home', color: 4 };

describe('TagsRow', () => {
	beforeEach(() => {
		useTagStore.setState({ tags: { [customTag.id]: customTag, [standardTag.id]: standardTag } });
	});

	it.each([false, true])('renders each tag chip with its own color (hideIcon: %s)', (hideIcon) => {
		setupTest(<TagsRow event={event} hideIcon={hideIcon} />);

		// tags are listed sorted by name: "home", then "work"
		const [homeAvatar, workAvatar] = screen.getAllByTestId('avatar');
		expect(homeAvatar).toHaveStyleRule('background-color', ZIMBRA_STANDARD_COLORS[4].hex);
		expect(workAvatar).toHaveStyleRule('background-color', '#abcdef');
	});

	it('triggers the search with the custom color of the clicked tag', async () => {
		const runSearchSpy = vi.fn();
		vi.mocked(useRunSearchIntegration).mockReturnValue(runSearchSpy);

		const { user } = setupTest(<TagsRow event={event} />);
		await user.click(screen.getByText('work'));

		expect(runSearchSpy).toHaveBeenCalledWith(
			[expect.objectContaining({ avatarBackground: '#abcdef', label: 'tag:work' })],
			'calendars'
		);
	});
});
