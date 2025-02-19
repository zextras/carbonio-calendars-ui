/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactNode } from 'react';

import { Container, Icon, Padding, Text } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';

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
	return (
		<>
			{action === EVENT_ACTIONS.EXPAND && <Displayer event={event} />}
			<Container background={'gray5'} mainAlignment="center">
				<LargeIcon icon="SearchOutline" color="secondary" />
				<Padding top="medium" />
				<Padding top="extralarge" />
				<Text color="secondary" size="large" weight="bold">
					{t(`label.search_hint`)}
				</Text>
				<Padding top="medium" />
				<Text color="secondary">{t(`message.search_hints`)}</Text>
			</Container>
		</>
	);
};

export default SearchPanel;
