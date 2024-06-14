/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, {
	Dispatch,
	ReactElement,
	SetStateAction,
	useCallback,
	useMemo,
	useState
} from 'react';

import { Dropdown, Icon, Padding, Row, Text, Tooltip } from '@zextras/carbonio-design-system';
import { Tag, useTags, ZIMBRA_STANDARD_COLORS } from '@zextras/carbonio-shell-ui';
import { includes, reduce } from 'lodash';

import { EventType } from '../types/event';
import { useTagExist } from '../view/tags/tag-actions';

export type TagItems = Tag & {
	customComponent: ReactElement;
	label: string;
};

export const TagIconComponent = ({
	event,
	disableOuterTooltip
}: {
	event: EventType;
	disableOuterTooltip: Dispatch<SetStateAction<boolean>>;
}): React.JSX.Element => {
	const [showDropdown, setShowDropdown] = useState(false);
	const onIconClick = useCallback((ev) => {
		ev.stopPropagation();
		setShowDropdown((o) => !o);
	}, []);

	const onDropdownClose = useCallback(() => {
		setShowDropdown(false);
	}, []);

	const tags = useTags();

	const tagItems = useMemo(
		() =>
			reduce(
				tags,
				(acc: Array<Tag>, v) => {
					if (includes(event?.resource?.tags, v.id)) {
						return [...acc, v];
					}
					return acc;
				},
				[]
			),
		[event?.resource?.tags, tags]
	);
	const tagIcon = useMemo(() => (tagItems?.length > 1 ? 'TagsMoreOutline' : 'Tag'), [tagItems]);
	const tagIconColor = useMemo(
		() =>
			tagItems?.length === 1 && tagItems?.[0]?.color
				? ZIMBRA_STANDARD_COLORS[tagItems?.[0]?.color]?.hex
				: undefined,
		[tagItems]
	);
	const tagName = useMemo(() => (tagItems?.length === 1 ? tagItems?.[0]?.name : ''), [tagItems]);
	const isTagInStore = useTagExist(tagItems);

	const showMultiTagIcon = useMemo(
		() => event?.resource?.tags?.length > 1,
		[event?.resource?.tags]
	);

	const showTagIcon = useMemo(
		() =>
			event?.resource?.tags &&
			event?.resource?.tags?.length !== 0 &&
			event?.resource?.tags?.[0] !== '' &&
			!showMultiTagIcon &&
			isTagInStore,
		[event?.resource?.tags, showMultiTagIcon, isTagInStore]
	);

	const tagsDropdownItems = useMemo(
		() =>
			reduce(
				tags,
				(acc: Array<TagItems>, v) => {
					if (includes(event?.resource?.tags, v.id))
						acc.push({
							...v,
							color: parseInt(ZIMBRA_STANDARD_COLORS[v.color ?? 0].hex, 10),
							label: v.name,
							customComponent: (
								<Row takeAvailableSpace mainAlignment="flex-start">
									<Row takeAvailableSpace mainAlignment="space-between">
										<Row mainAlignment="flex-end">
											<Padding right="small">
												<Icon icon="Tag" color={ZIMBRA_STANDARD_COLORS[v.color ?? 0].hex} />
											</Padding>
										</Row>
										<Row takeAvailableSpace mainAlignment="flex-start">
											<Text>{v.name}</Text>
										</Row>
									</Row>
								</Row>
							)
						});
					return acc;
				},
				[]
			),
		[event?.resource?.tags, tags]
	);
	return (
		<>
			{showTagIcon && (
				<Tooltip placement="top" label={tagName}>
					<Padding left="extrasmall">
						<Icon
							size="medium"
							data-testid="TagSingleIcon"
							icon={tagIcon}
							color={tagIconColor}
							onMouseEnter={(): void => disableOuterTooltip(true)}
							onMouseLeave={(): void => disableOuterTooltip(false)}
							onFocus={(): void => disableOuterTooltip(true)}
							onBlur={(): void => disableOuterTooltip(false)}
						/>
					</Padding>
				</Tooltip>
			)}
			{showMultiTagIcon && (
				<Dropdown items={tagsDropdownItems} forceOpen={showDropdown} onClose={onDropdownClose}>
					<Padding left="extrasmall">
						<Icon
							size="medium"
							data-testid="TagMultiIcon"
							icon={tagIcon}
							onClick={onIconClick}
							color={tagIconColor}
							onMouseEnter={(): void => disableOuterTooltip(true)}
							onMouseLeave={(): void => disableOuterTooltip(false)}
							onFocus={(): void => disableOuterTooltip(true)}
							onBlur={(): void => disableOuterTooltip(false)}
						/>
					</Padding>
				</Dropdown>
			)}
		</>
	);
};
