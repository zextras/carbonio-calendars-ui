/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { lazy, useEffect, Suspense } from 'react';
import {
	registerAppData,
	Spinner,
	getBridgedFunctions,
	registerComponents
} from '@zextras/carbonio-shell-ui';
import { SyncDataHandler } from './view/sidebar/sync-data-handler';
import InviteResponse from './shared/invite-response/invite-response';
import Notifications from './view/notifications';
import AppointmentReminder from './view/reminder/appointment-reminder';

const LazyCalendarView = lazy(() =>
	import(/* webpackChunkName: "calendar-view" */ './view/calendar/calendar-view')
);
const LazyEditorView = lazy(() =>
	import(/* webpackChunkName: "calendar-edit" */ './view/event-panel-edit/event-edit-panel')
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
const EditorView = (context) => (
	<Suspense fallback={<Spinner />}>
		<LazyEditorView context={context} />
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
	console.log(
		'%c CALENDAR APP LOADED',
		'color: white; background: #8bc34a;padding: 4px 8px 2px 4px; font-family: sans-serif; border-radius: 12px; width: 100%'
	);

	useEffect(() => {
		registerAppData({
			icon: 'CalendarModOutline',
			views: {
				app: CalendarView,
				settings: SettingsView,
				sidebar: SidebarView,
				board: EditorView,
				search: SearchView
			},
			newButton: {
				primary: {
					id: 'new-appointment',
					label: 'New Appointment',
					icon: 'CalendarOutline',
					click: () => {
						getBridgedFunctions().addBoard('/', { isBoard: true });
					}
				},
				secondaryItems: []
			}
		});
	}, []);

	useEffect(() => {
		registerComponents({
			id: 'invites-reply',
			component: InviteResponse
		});
	}, []);

	return (
		<>
			<SyncDataHandler />
			<AppointmentReminder />
			<Notifications />
		</>
	);
}
