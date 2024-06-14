/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { Suspense, lazy, ReactElement, useEffect } from 'react';

import { Button, Container } from '@zextras/carbonio-design-system';
import { noop } from 'lodash';
import { Switch, Route, useRouteMatch } from 'react-router-dom';

import { UPDATE_VIEW_EVENT } from '../../constants';
import { NoOpRequest } from '../../soap/noop-request';
import { EventActionsEnum } from '../../types/enums/event-actions-enum';
import EventPanelView from '../event-panel-view/event-panel-view';

const CalendarComponent = lazy(
	() => import(/* webpackChunkName: "calendar-component" */ './calendar-component')
);

export default function CalendarView(): ReactElement {
	const { path } = useRouteMatch();

	useEffect(() => {
		window.addEventListener(UPDATE_VIEW_EVENT, NoOpRequest);

		return () => {
			window.removeEventListener(UPDATE_VIEW_EVENT, NoOpRequest);
		};
	}, []);

	return (
		<Container
			background={'gray6'}
			padding={{ all: 'large' }}
			style={{ overflowY: 'auto', position: 'relative' }}
			data-testid="MainCalendarContainer"
		>
			<Switch>
				<Route path={`${path}/:calendarId?/:action?/:apptId?/:ridZ?`}>
					<Suspense
						fallback={
							<Container height="50%" mainAlignment="center" crossAlignment="center">
								<Button loading disabled label="" type="ghost" onClick={noop} />
							</Container>
						}
					>
						<CalendarComponent />
					</Suspense>
					<Route path={`${path}/:calendarId/:action(${EventActionsEnum.EXPAND})/:apptId/:ridZ?`}>
						<EventPanelView />
					</Route>
				</Route>
			</Switch>
		</Container>
	);
}
