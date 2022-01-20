/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ComponentProps, ReactComponentElement } from 'react';
import { useRouteMatch, Switch, Route } from 'react-router-dom';
import { Container, Padding, Text, Icon } from '@zextras/carbonio-design-system';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import Displayer from './displayer';
import { Editor } from './editor';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { useSearchEvent } from './hooks/use-search-event';

const LargeIcon = styled(Icon)`
	transform: scale(3.5);
`;

const SearchPanel = ({ appointments }: ComponentProps<any>): ReactComponentElement<any> => {
	const { path } = useRouteMatch();
	const [t] = useTranslation();

	const event = useSearchEvent(appointments);

	return (
		<Switch>
			<Route path={`${path}/:action(edit)/:apptId/:ridZ?`}>
				<Editor event={event} />
			</Route>
			<Route path={`${path}/:action(view)/:apptId/:ridZ?`}>
				<Displayer event={event} />
			</Route>
			<Route
				path={path}
				render={(): ReactComponentElement<any> => (
					<Container background="gray5" mainAlignment="center">
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
