/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { Suspense, lazy, useEffect, useState, useCallback } from 'react';
import { Container, Text, SnackbarManager } from '@zextras/carbonio-design-system';
import { isEmpty } from 'lodash';
import moment from 'moment';
import { useDispatch, useSelector } from 'react-redux';
import CalendarStyle from './calendar-style';
import { selectCalendars } from '../../store/selectors/calendars';
import { selectApptStatus } from '../../store/selectors/appointments';
import { setSearchRange } from '../../store/actions/set-search-range';
import { EventContext } from '../../commons/event-context';
import EventPanelView from '../event-panel-view/event-panel-view';
import { EventEditPanel } from '../event-panel-edit/appointment-edit-panel';
import { EventActionsEnum } from '../../types/enums/event-actions-enum';
import { DeleteEventModal } from '../delete/delete-event-modal';

const CalendarComponent = lazy(() =>
	import(/* webpackChunkName: "calendar-component" */ './calendar-component')
);

export default function CalendarView() {
	const [event, setEvent] = useState(null);
	const [action, setAction] = useState(null);
	const [deleteModal, setDeleteModal] = useState(false);
	const calendars = useSelector(selectCalendars);
	const [primaryCalendar, setPrimaryCalendar] = useState({});
	const status = useSelector(selectApptStatus);
	const dispatch = useDispatch();
	const [isInstance, setIsInstance] = useState(false);

	const closePanel = useCallback(() => {
		setEvent(null);
		setAction(null);
	}, []);

	const toggleDeleteModal = useCallback(
		(appt, value) => {
			if (appt) {
				setIsInstance(value);
			}
			if (deleteModal) {
				closePanel();
			}
			setDeleteModal(!deleteModal);
		},
		[closePanel, deleteModal]
	);

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
		setPrimaryCalendar(calendars?.[10] ?? {});
	}, [dispatch, status, calendars]);

	return (
		<SnackbarManager>
			<Container
				background="gray6"
				padding={{ all: 'medium' }}
				style={{ overflowY: 'auto', position: 'relative' }}
			>
				<EventContext.Provider value={{ event, setEvent, action, setAction, toggleDeleteModal }}>
					<CalendarStyle primaryCalendar={primaryCalendar} />
					<Suspense fallback={<Text>Loading...</Text>}>
						<CalendarComponent />
					</Suspense>
					{event && action === EventActionsEnum.EXPAND && (
						<EventPanelView event={event} action={action} close={closePanel} />
					)}
					{event && action === EventActionsEnum.EDIT && (
						<EventEditPanel event={event} action={action} close={closePanel} />
					)}
					{deleteModal && (
						<DeleteEventModal
							open={deleteModal}
							event={event}
							isInstance={isInstance}
							onClose={toggleDeleteModal}
						/>
					)}
				</EventContext.Provider>
			</Container>
		</SnackbarManager>
	);
}
