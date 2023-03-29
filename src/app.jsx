/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
	ACTION_TYPES,
	Spinner,
	addBoardView,
	addRoute,
	addSearchView,
	addSettingsView,
	registerActions,
	registerComponents,
	registerFunctions,
	t
} from '@zextras/carbonio-shell-ui';
import { isEmpty } from 'lodash';
import moment from 'moment';
import React, { Suspense, lazy, useEffect } from 'react';
import { CALENDAR_APP_ID, CALENDAR_ROUTE } from './constants';
import { useOnClickNewButton } from './hooks/on-click-new-button';
import { useAppDispatch, useAppSelector } from './hooks/redux';
import { getSettingsSubSections } from './settings/sub-sections';
import { createAppointmentIntegration } from './shared/create-apppointment-integration';
import InviteResponse from './shared/invite-response/invite-response';
import { searchAppointments } from './store/actions/search-appointments';
import { StoreProvider } from './store/redux';
import { selectApptStatus } from './store/selectors/appointments';
import { selectCalendars } from './store/selectors/calendars';
import { CalendarIntegrations } from './types/enums/event-actions-enum';
import Notifications from './view/notifications';
import { AppointmentReminder } from './view/reminder/appointment-reminder';
import { SyncDataHandler } from './view/sidebar/sync-data-handler';

const LazyCalendarView = lazy(() =>
	import(/* webpackChunkName: "calendar-view" */ './view/calendar/calendar-view')
);

const LazyEditorView = lazy(() =>
	import(/* webpackChunkName: "calendar-edit" */ './view/editor/editor-board-wrapper')
);
const LazySettingsView = lazy(() =>
	import(/* webpackChunkName: "settings-view" */ './settings/settings-view')
);
const LazySidebarView = lazy(() =>
	import(/* webpackChunkName: "sidebar-view" */ './view/sidebar/sidebar')
);
const LazySearchView = lazy(() =>
	import(/* webpackChunkName: "search-view" */ './view/search/search-view')
);

const CalendarView = () => (
	<Suspense fallback={<Spinner />}>
		<StoreProvider>
			<LazyCalendarView />
		</StoreProvider>
	</Suspense>
);

const EditorView = () => (
	<Suspense fallback={<Spinner />}>
		<StoreProvider>
			<LazyEditorView />
		</StoreProvider>
	</Suspense>
);
const SettingsView = () => (
	<Suspense fallback={<Spinner />}>
		<StoreProvider>
			<LazySettingsView />
		</StoreProvider>
	</Suspense>
);

const SidebarView = (props) => (
	<Suspense fallback={<Spinner />}>
		<StoreProvider>
			<LazySidebarView {...props} />
		</StoreProvider>
	</Suspense>
);

const SearchView = (props) => (
	<Suspense fallback={<Spinner />}>
		<StoreProvider>
			<LazySearchView {...props} />
		</StoreProvider>
	</Suspense>
);

const AppRegistrations = () => {
	const onClickNewButton = useOnClickNewButton();
	const calendars = useAppSelector(selectCalendars);
	const status = useAppSelector(selectApptStatus);
	const dispatch = useAppDispatch();

	useEffect(() => {
		if (!isEmpty(calendars) && status === 'init') {
			const now = moment();
			const start = now.startOf('isoWeek').valueOf();
			const end = now.endOf('isoWeek').valueOf();
			dispatch(searchAppointments({ spanEnd: end, spanStart: start }));
		}
	}, [dispatch, status, calendars]);

	useEffect(() => {
		addRoute({
			route: CALENDAR_ROUTE,
			position: 2,
			visible: true,
			label: t('label.app_name', 'Calendars'),
			primaryBar: 'CalendarModOutline',
			secondaryBar: SidebarView,
			appView: CalendarView
		});
		addSettingsView({
			route: CALENDAR_ROUTE,
			label: t('label.app_name', 'Calendars'),
			component: SettingsView,
			subSections: getSettingsSubSections(t)
		});
		addSearchView({
			route: CALENDAR_ROUTE,
			component: SearchView
		});
		addBoardView({
			route: CALENDAR_ROUTE,
			component: EditorView
		});
	}, []);

	useEffect(() => {
		registerFunctions({
			id: CalendarIntegrations.CREATE_APPOINTMENT,
			fn: createAppointmentIntegration(dispatch, calendars)
		});
		registerActions({
			action: () => ({
				id: 'new-appointment',
				label: t('label.new_appointment', 'New Appointment'),
				icon: 'CalendarModOutline',
				click: onClickNewButton,
				disabled: false,
				group: CALENDAR_APP_ID,
				primary: true
			}),
			id: 'new-appointment',
			type: ACTION_TYPES.NEW
		});
		registerComponents({
			id: 'invites-reply',
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			component: InviteResponse
		});
	}, [calendars, dispatch, onClickNewButton]);
	return null;
};

export default function App() {
	return (
		<StoreProvider>
			<AppRegistrations />
			<AppointmentReminder />
			<SyncDataHandler />
			<Notifications />
		</StoreProvider>
	);
}
