/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useTagStore } from '@zextras/carbonio-ui-commons';

import { TagAccordionItem } from './custom-accordion-components/tag-accordion-item';
import { TagsAggregatorAccordionItem } from './custom-accordion-components/tags-aggregator-accordion-item';
import { useSecondaryBarTreeTags } from './use-secondary-bar-tree-tags';
import { useLocalStorage } from '../../../__mocks__/@zextras/carbonio-shell-ui';
import { setupHook } from '../../__test__/test-setup';

describe('useSecondaryBarTreeTags', () => {
	it('should render the tags aggregator accordion item', () => {
		useLocalStorage.mockReturnValue([[], vi.fn()]);
		const tags = {
			'1': {
				id: '1',
				name: 'ZZZZ AAAA',
				color: 4,
				n: 46
			},
			'9999': {
				id: '9999',
				name: 'AAAA BBBB',
				color: 5,
				n: 23
			}
		};
		useTagStore.setState({ tags });

		const {
			result: { current: result }
		} = setupHook(useSecondaryBarTreeTags);

		expect(result).toEqual([
			{
				id: 'tags',
				CustomComponent: TagsAggregatorAccordionItem,
				items: [
					{
						id: '9999',
						CustomComponent: TagAccordionItem
					},
					{
						id: '1',
						CustomComponent: TagAccordionItem
					}
				],
				open: false,
				onClose: expect.any(Function),
				onOpen: expect.any(Function)
			}
		]);
	});
});
