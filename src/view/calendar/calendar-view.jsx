/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { Suspense, lazy, useEffect, useMemo } from 'react';
import { Container, Text, SnackbarManager } from '@zextras/carbonio-design-system';
import { isEmpty } from 'lodash';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import { useDispatch, useSelector } from 'react-redux';
import { Switch, Route, useRouteMatch } from 'react-router-dom';
import CalendarStyle from './calendar-style';
import { selectCalendars } from '../../store/selectors/calendars';
import { selectApptStatus } from '../../store/selectors/appointments';
import { setSearchRange } from '../../store/actions/set-search-range';
import EventPanelView from '../event-panel-view/event-panel-view';
import EventEditPanel from '../event-panel-edit/event-edit-panel';
import { EventActionsEnum } from '../../types/enums/event-actions-enum';

const CalendarComponent = lazy(() =>
	import(/* webpackChunkName: "calendar-component" */ './calendar-component')
);

export default function CalendarView() {
	const [t] = useTranslation();
	const calendars = useSelector(selectCalendars);
	const primaryCalendar = useMemo(() => calendars?.[10] ?? {}, [calendars]);
	const status = useSelector(selectApptStatus);
	const dispatch = useDispatch();
	const { path } = useRouteMatch();

	useEffect(() => {
		if (!isEmpty(calendars) && status === 'init') {
			const now = moment();
			dispatch(
				setSearchRange({
					rangeStart: now.startOf('isoWeek').valueOf(),
					rangeEnd: now.endOf('isoWeek').valueOf(),
					init: true
				})
			);
		}
	}, [dispatch, status, calendars]);

	return (
		<SnackbarManager>
			<Container
				background="gray6"
				padding={{ all: 'medium' }}
				style={{ overflowY: 'auto', position: 'relative' }}
			>
				<CalendarStyle primaryCalendar={primaryCalendar} />
				<Suspense fallback={<Text>{t('label.loading', 'Loading...')}</Text>}>
					<CalendarComponent />
				</Suspense>
				<Switch>
					<Route path={`${path}/:calendarId/:action(${EventActionsEnum.EDIT})/:apptId/:ridZ?`}>
						<EventEditPanel />
					</Route>
					<Route path={`${path}/:calendarId/:action(${EventActionsEnum.EXPAND})/:apptId/:ridZ?`}>
						<EventPanelView />
					</Route>
				</Switch>
			</Container>
		</SnackbarManager>
	);
}
