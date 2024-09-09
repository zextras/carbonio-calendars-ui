/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ComponentProps, ReactComponentElement } from 'react';

import { Container, Icon, Padding, Text } from '@zextras/carbonio-design-system';
import { t } from '@zextras/carbonio-shell-ui';
import { useRouteMatch, Switch, Route } from 'react-router-dom';
import styled from 'styled-components';

import Displayer from './displayer';
import { useSelectedEventFromArray } from '../../hooks/use-selected-event-from-array';
import { EventActionsEnum } from '../../types/enums/event-actions-enum';

const LargeIcon = styled(Icon)`
	transform: scale(3.5);
`;

const SearchPanel = ({ appointments }: ComponentProps<any>): ReactComponentElement<any> => {
	const { path } = useRouteMatch();
	const event = useSelectedEventFromArray(appointments);
	return (
		<Switch>
			<Route path={`${path}/:action(${EventActionsEnum.EXPAND})/:apptId/:ridZ?`}>
				<Displayer event={event} />
			</Route>
			<Route
				path={path}
				render={(): ReactComponentElement<any> => (
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
				)}
			/>
		</Switch>
	);
};

export default SearchPanel;
