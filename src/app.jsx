/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { lazy, useEffect, Suspense } from 'react';
import {
	Spinner,
	addRoute,
	addSettingsView,
	addSearchView,
	addBoardView,
	registerActions,
	registerComponents,
	ACTION_TYPES,
	getBridgedFunctions
} from '@zextras/carbonio-shell-ui';
import { useTranslation } from 'react-i18next';
import { SyncDataHandler } from './view/sidebar/sync-data-handler';
import InviteResponse from './shared/invite-response/invite-response';
import Notifications from './view/notifications';
import { CALENDAR_APP_ID, CALENDAR_ROUTE } from './constants';
import { getSettingsSubSections } from './settings/sub-sections';
import { generateEditor } from './commons/editor-generator';
import { AppointmentReminder } from './view/reminder/appointment-reminder';

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
		<LazyCalendarView />
	</Suspense>
);

const EditorView = () => (
	<Suspense fallback={<Spinner />}>
		<LazyEditorView />
	</Suspense>
);
const SettingsView = () => (
	<Suspense fallback={<Spinner />}>
		<LazySettingsView />
	</Suspense>
);

const SidebarView = (props) => (
	<Suspense fallback={<Spinner />}>
		<LazySidebarView {...props} />
	</Suspense>
);

const SearchView = (props) => (
	<Suspense fallback={<Spinner />}>
		<LazySearchView {...props} />
	</Suspense>
);

export default function App() {
	const [t] = useTranslation();
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
	}, [t]);

	useEffect(() => {
		registerActions({
			action: () => ({
				id: 'new-appointment',
				label: t('label.new_appointment', 'New Appointment'),
				icon: 'CalendarModOutline',
				click: (ev) => {
					ev?.preventDefault?.();
					const { editor, callbacks } = generateEditor({
						context: { title: t('label.new_appointment', 'New Appointment'), panel: false }
					});
					getBridgedFunctions().addBoard(`${CALENDAR_ROUTE}/`, { ...editor, callbacks });
				},
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
	}, [t]);

	return (
		<>
			<AppointmentReminder />
			<SyncDataHandler />
			<Notifications />
		</>
	);
}
