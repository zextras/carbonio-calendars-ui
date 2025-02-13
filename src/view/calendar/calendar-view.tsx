/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { Suspense, lazy, ReactElement } from 'react';

import { Button, Container } from '@zextras/carbonio-design-system';
import { noop } from 'lodash';
import { Routes, Route } from 'react-router-dom';

import { useUpdateView } from '../../carbonio-ui-commons/hooks/use-update-view';
import { EVENT_ACTIONS } from '../../constants/event-actions';
import EventPanelView from '../event-panel-view/event-panel-view';

const CalendarComponent = lazy(
	() => import(/* webpackChunkName: "calendar-component" */ './calendar-component')
);

export default function CalendarView(): ReactElement {
	useUpdateView();

	return (
		<Container
			background={'gray6'}
			padding={{ all: 'large' }}
			style={{ overflowY: 'auto', position: 'relative' }}
			data-testid="MainCalendarContainer"
		>
			<Routes>
				<Route path={`:calendarId?/:action?/:apptId?/:ridZ?`}>
					<Suspense
						fallback={
							<Container height="50%" mainAlignment="center" crossAlignment="center">
								<Button loading disabled label="" type="ghost" onClick={noop} />
							</Container>
						}
					>
						<CalendarComponent />
					</Suspense>
					<Route path={`:calendarId/:action(${EVENT_ACTIONS.EXPAND})/:apptId/:ridZ?`}>
						<EventPanelView />
					</Route>
				</Route>
			</Routes>
		</Container>
	);
}
