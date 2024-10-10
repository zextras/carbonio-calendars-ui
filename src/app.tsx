/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { lazy, Suspense, useEffect } from 'react';

import { ModalManager } from '@zextras/carbonio-design-system';
import {
	ACTION_TYPES,
	addBoardView,
	addRoute,
	addSearchView,
	addSettingsView,
	registerActions,
	registerComponents,
	registerFunctions,
	SearchViewProps,
	SecondaryBarComponentProps,
	Spinner
} from '@zextras/carbonio-shell-ui';
import { AnyFunction } from '@zextras/carbonio-shell-ui/lib/utils/typeUtils';
import { useTranslation } from 'react-i18next';

import { useFoldersMap, useUpdateGroups } from './carbonio-ui-commons/store/zustand/folder';
import { FOLDER_VIEW } from './carbonio-ui-commons/constants';
import { useInitializeFolders } from './carbonio-ui-commons/hooks/use-initialize-folders';
import { CALENDAR_APP_ID, CALENDAR_BOARD_ID, CALENDAR_ROUTE } from './constants';
import { CalendarIntegrations } from './constants/event-actions';
import { useOnClickNewButton } from './hooks/on-click-new-button';
import { getSettingsSubSections } from './settings/sub-sections';
import { createAppointmentIntegration } from './shared/create-apppointment-integration';
import InviteResponseComp from './shared/invite-response/invite-response';
import { getCalendarGroupsRequest } from './soap/get-calendar-groups-request';
import { StoreProvider } from './store/redux';
import { useAppDispatch } from './store/redux/hooks';
import Notifications from './view/notifications';
import { AppointmentReminder } from './view/reminder/appointment-reminder';
import { SyncDataHandler } from './view/sidebar/sync-data-handler';

const LazyCalendarView = lazy(
	() => import(/* webpackChunkName: "calendar-view" */ './view/calendar/calendar-view')
);

const LazyEditorView = lazy(
	() => import(/* webpackChunkName: "calendar-edit" */ './view/editor/editor-board-wrapper')
);
const LazySettingsView = lazy(
	() => import(/* webpackChunkName: "settings-view" */ './settings/settings-view')
);
const LazySidebarView = lazy(
	() => import(/* webpackChunkName: "sidebar-view" */ './view/sidebar/sidebar')
);
const LazySearchView = lazy(
	() => import(/* webpackChunkName: "search-view" */ './view/search/search-view')
);

const CalendarView = (): React.JSX.Element => (
	<Suspense fallback={<Spinner />}>
		<StoreProvider>
			<ModalManager>
				<LazyCalendarView />
			</ModalManager>
		</StoreProvider>
	</Suspense>
);

const EditorView = (): React.JSX.Element => (
	<Suspense fallback={<Spinner />}>
		<StoreProvider>
			<ModalManager>
				<LazyEditorView />
			</ModalManager>
		</StoreProvider>
	</Suspense>
);
const SettingsView = (): React.JSX.Element => (
	<Suspense fallback={<Spinner />}>
		<StoreProvider>
			<ModalManager>
				<LazySettingsView />
			</ModalManager>
		</StoreProvider>
	</Suspense>
);

const SidebarView = (props: SecondaryBarComponentProps): React.JSX.Element => (
	<Suspense fallback={<Spinner />}>
		<StoreProvider>
			<ModalManager>
				<LazySidebarView {...props} />{' '}
			</ModalManager>
		</StoreProvider>
	</Suspense>
);

const SearchView = (props: SearchViewProps): React.JSX.Element => (
	<Suspense fallback={<Spinner />}>
		<StoreProvider>
			<ModalManager>
				<LazySearchView {...props} />{' '}
			</ModalManager>
		</StoreProvider>
	</Suspense>
);

const AppRegistrations = (): null => {
	const onClickNewButton = useOnClickNewButton();
	const calendars = useFoldersMap();
	const dispatch = useAppDispatch();
	const [t] = useTranslation();
	const updateGroups = useUpdateGroups();

	useInitializeFolders(FOLDER_VIEW.appointment);

	useEffect(() => {
		const appLabel = t('label.app_name', 'Calendars');
		addRoute({
			route: CALENDAR_ROUTE,
			position: 200,
			visible: true,
			label: appLabel,
			primaryBar: 'CalendarModOutline',
			secondaryBar: SidebarView,
			appView: CalendarView
		});
		addSettingsView({
			route: CALENDAR_ROUTE,
			label: appLabel,
			component: SettingsView,
			subSections: getSettingsSubSections()
		});
		addSearchView({
			route: CALENDAR_ROUTE,
			label: appLabel,
			component: SearchView
		});
		addBoardView({
			id: CALENDAR_BOARD_ID,
			component: EditorView
		});
	}, [t]);

	useEffect(() => {
		registerFunctions({
			id: CalendarIntegrations.CREATE_APPOINTMENT,
			fn: createAppointmentIntegration(dispatch, calendars) as AnyFunction
		});
		registerActions({
			action: () => ({
				id: 'new-appointment',
				label: t('label.new_appointment', 'New Appointment'),
				icon: 'CalendarModOutline',
				onClick: onClickNewButton,
				disabled: false,
				group: CALENDAR_APP_ID,
				primary: true
			}),
			id: 'new-appointment',
			type: ACTION_TYPES.NEW
		});
		registerComponents({
			id: 'invites-reply',
			component: InviteResponseComp
		});
	}, [calendars, dispatch, onClickNewButton, t]);

	useEffect(() => {
		getCalendarGroupsRequest().then((res) => {
			updateGroups(
				res.group.map((g) => ({
					...g,
					calendarId: g.calendarId.map((x) => x._content)
				}))
			);
		});
	}, [updateGroups]);

	return null;
};

export default function App(): React.JSX.Element {
	return (
		<StoreProvider>
			<AppRegistrations />
			<AppointmentReminder />
			<SyncDataHandler />
			<Notifications />
		</StoreProvider>
	);
}
