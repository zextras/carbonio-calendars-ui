/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactNode, useMemo } from 'react';

import styled from '@emotion/styled';
import { Container, Icon, Padding, Text } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import Displayer from './displayer';
import { EVENT_ACTIONS } from '../../constants/event-actions';
import { useSelectedEventFromArray } from '../../hooks/use-selected-event-from-array';
import { EventType } from '../../types/event';

const LargeIcon = styled(Icon)`
	transform: scale(3.5);
`;

type SearchPanelProps = {
	appointments: Array<EventType>;
};

const SearchPanel = ({ appointments }: SearchPanelProps): ReactNode => {
	const [t] = useTranslation();
	const event = useSelectedEventFromArray(appointments);
	const { action } = useParams<{ action: string }>();

	const displayerMessage = useMemo(() => {
		if (appointments.length > 0) {
			return {
				title: t(
					'displayer.search_title4',
					'Select one or more results to perform actions or display details.'
				),
				description: ''
			};
		}
		return {
			title: t('displayer.search_title1', 'Start another search'),
			description: t(
				'displayer.search_description1',
				'Or select "Advanced Filters" to refine your search.'
			)
		};
	}, [appointments.length, t]);

	const displayerTitle = useMemo(() => displayerMessage?.title, [displayerMessage?.title]);
	const displayerDescription = useMemo(
		() => displayerMessage?.description,
		[displayerMessage?.description]
	);

	return (
		<>
			{action === EVENT_ACTIONS.EXPAND && <Displayer event={event} />}
			<Container background="gray5">
				<Padding all="medium">
					<Text
						color="gray1"
						overflow="break-word"
						weight="bold"
						size="large"
						style={{ whiteSpace: 'pre-line', textAlign: 'center' }}
					>
						{displayerTitle}
					</Text>
				</Padding>
				<Text
					size="small"
					color="gray1"
					overflow="break-word"
					style={{ whiteSpace: 'pre-line', textAlign: 'center' }}
				>
					{displayerDescription}
				</Text>
			</Container>
		</>
	);
};

export default SearchPanel;
