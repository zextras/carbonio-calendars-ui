/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, ReactElement, useMemo } from 'react';
import { Row, Padding, Icon, Text, Chip } from '@zextras/carbonio-design-system';
import { includes, map, reduce } from 'lodash';
import styled from 'styled-components';
import { useTags, ZIMBRA_STANDARD_COLORS } from '@zextras/carbonio-shell-ui';
import { EventType } from '../../types/event';

const TagChip = styled(Chip)`
	margin-right: ${({ theme }): string => theme.sizes.padding.extrasmall};
	padding: 1px 8px !important;
	margin-bottom: 4px;
`;

const TagsRow: FC<{ event: EventType }> = ({ event }): ReactElement => {
	const tagsFromStore = useTags();
	const tags = useMemo(
		() =>
			reduce(
				tagsFromStore,
				(acc: any, v) => {
					if (includes(event?.resource?.tags, v.id))
						acc.push({
							...v,
							color: ZIMBRA_STANDARD_COLORS[v.color ?? 0].hex,
							label: v.name
						});
					return acc;
				},
				[]
			),
		[event?.resource?.tags, tagsFromStore]
	);

	return (
		<Row width="fill" mainAlignment="flex-start" padding={{ top: 'small' }}>
			<Row takeAvailableSpace mainAlignment="flex-start">
				<Padding right="small">
					<Icon icon="TagsMoreOutline" size="medium" />
				</Padding>
				{event?.resource?.tags?.length > 0 && (
					<Row orientation="horizontal" crossAlignment="flex-start" mainAlignment="flex-start">
						<Text color="secondary" size="small" overflow="break-word">
							{map(tags, (tag) => (
								<TagChip
									label={tag.name}
									avatarBackground={tag.color}
									background="gray2"
									hasAvatar
									avatarIcon="Tag"
								/>
							))}
						</Text>
					</Row>
				)}
			</Row>
		</Row>
	);
};

export default TagsRow;
