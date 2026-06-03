/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { lazy, Suspense, useEffect, useMemo } from 'react';

import { ModalManager } from '@zextras/carbonio-design-system';
import type * as SearchUI from '@zextras/carbonio-search-ui';
import {
	addRoute,
	addSettingsView,
	addBoardView,
	registerActions,
	registerComponents,
	registerFunctions,
	SecondaryBarComponentProps,
	NewAction,
	useIntegratedFunction,
	upsertApp
} from '@zextras/carbonio-shell-ui';
import { FOLDER_VIEW, useInitializeFolders, useFoldersMap } from '@zextras/carbonio-ui-commons';
import { map } from 'lodash';
import { useTranslation } from 'react-i18next';

import { AuthGuard } from './auth-guard';
import { CenteredSpinner } from './components/CenteredSpinner';
import { SyncDataHandler } from './components/sync-data-handler';
import { QuotaRefreshHandler } from './components/quota-refresh-handler';
import { CALENDAR_APP_ID, CALENDAR_BOARD_ID, CALENDAR_ROUTE } from './constants';
import { CalendarIntegrations } from './constants/event-actions';
import { useOnClickNewButton } from './hooks/on-click-new-button';
import { getSettingsSubSections } from './settings/sub-sections';
import { createAppointmentIntegration } from './shared/create-apppointment-integration';
import { InviteResponseComp } from './shared/invite-response/invite-response';
import { getCalendarGroupsRequest } from './soap/get-calendar-groups-request';
import { StoreProvider } from './store/redux';
import { useAppDispatch } from './store/redux/hooks';
import { updateCalendarGroupsStore } from './store/zustand/calendar-group-store';
import { GlobalModalManager } from './view/global-modal-manager';
import Notifications from './view/notifications';
import { AppointmentReminder } from './view/reminder/appointment-reminder';
import { InitializeTags } from './view/tags/initialize-tags';

const LazyCalendarView = lazy(
	() => import(/* webpackChunkName: "calendar-view" */ './view/calendar/calendar-view')
);

const LazyEditorView = lazy(
	() => import(/* webpackChunkName: "calendar-edit" */ './view/editor/editor-board-wrapper')
);
const LazySettingsView = lazy(
	() => import(/* webpackChunkName: "settings-view" */ './settings/settings-view')
);
const LazySecondaryBarView = lazy(
	() => import(/* webpackChunkName: "secondary-bar-view" */ './view/secondary-bar/secondary-bar')
);
const LazySearchView = lazy(
	() => import(/* webpackChunkName: "search-view" */ './view/search/search-view')
);

const CalendarView = (): React.JSX.Element => (
	<Suspense fallback={<CenteredSpinner />}>
		<StoreProvider>
			<ModalManager>
				<LazyCalendarView />
			</ModalManager>
		</StoreProvider>
	</Suspense>
);

const EditorView = (): React.JSX.Element => (
	<Suspense fallback={<CenteredSpinner />}>
		<StoreProvider>
			<ModalManager>
				<LazyEditorView />
			</ModalManager>
		</StoreProvider>
	</Suspense>
);
const SettingsView = (): React.JSX.Element => (
	<Suspense fallback={<CenteredSpinner />}>
		<StoreProvider>
			<ModalManager>
				<LazySettingsView />
			</ModalManager>
		</StoreProvider>
	</Suspense>
);

const SecondaryBarView = (props: SecondaryBarComponentProps): React.JSX.Element => (
	<Suspense fallback={<CenteredSpinner />}>
		<StoreProvider>
			<ModalManager>
				<LazySecondaryBarView {...props} />
			</ModalManager>
		</StoreProvider>
	</Suspense>
);

const SearchView = (props: SearchUI.SearchViewProps): React.JSX.Element => (
	<Suspense fallback={<CenteredSpinner />}>
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

	useInitializeFolders(FOLDER_VIEW.appointment);
	const appLabel = t('label.app_name', 'Calendars');

	useEffect(() => {
		addRoute({
			route: CALENDAR_ROUTE,
			position: 200,
			visible: true,
			label: appLabel,
			primaryBar: 'CalendarModOutline',
			secondaryBar: SecondaryBarView,
			appView: CalendarView
		});
		addSettingsView({
			route: CALENDAR_ROUTE,
			label: appLabel,
			component: SettingsView,
			subSections: getSettingsSubSections()
		});
		addBoardView({
			id: CALENDAR_BOARD_ID,
			component: EditorView
		});

		upsertApp({
			name: CALENDAR_APP_ID,
			display: appLabel
		});
	}, [appLabel]);

	const [addSearchView, isAddSearchViewAvailable] =
		useIntegratedFunction<typeof SearchUI.addSearchView>('search-add-view');
	const [removeSearchView, isRemoveSearchViewAvailable] =
		useIntegratedFunction<typeof SearchUI.removeSearchView>('search-remove-view');

	useEffect(() => {
		if (isAddSearchViewAvailable) {
			addSearchView({
				id: CALENDAR_APP_ID,
				app: CALENDAR_APP_ID,
				route: CALENDAR_ROUTE,
				label: appLabel,
				component: SearchView,
				position: 200,
				icon: 'CalendarModOutline'
			});
		}

		return () => {
			if (isRemoveSearchViewAvailable) {
				removeSearchView(CALENDAR_APP_ID);
			}
		};
	}, [
		addSearchView,
		appLabel,
		isAddSearchViewAvailable,
		isRemoveSearchViewAvailable,
		removeSearchView
	]);

	const newAction = useMemo(
		(): NewAction => ({
			id: 'new-appointment',
			label: t('label.new_appointment', 'New Appointment'),
			icon: 'CalendarModOutline',
			execute: onClickNewButton,
			disabled: false,
			group: CALENDAR_APP_ID,
			primary: true
		}),
		[onClickNewButton, t]
	);

	useEffect(() => {
		registerFunctions({
			id: CalendarIntegrations.CREATE_APPOINTMENT,
			fn: createAppointmentIntegration(dispatch, calendars)
		});
		registerActions<NewAction>({
			action: () => newAction,
			id: 'new-appointment',
			type: 'new'
		});
		registerComponents({
			id: 'invites-reply',
			component: InviteResponseComp
		});
	}, [calendars, dispatch, newAction]);

	useEffect(() => {
		getCalendarGroupsRequest().then((res) => {
			const groups = map(res.group, (group) => ({
				...group,
				calendarId: group.calendarId?.map((x) => x._content) ?? []
			}));
			updateCalendarGroupsStore(groups);
		});
	}, []);

	return null;
};

export default function App(): React.JSX.Element {
	return (
		<AuthGuard>
			<StoreProvider>
				<GlobalModalManager>
					<AppRegistrations />
				</GlobalModalManager>
				<AppointmentReminder />
				<InitializeTags />
				<SyncDataHandler />
				<Notifications />
				<QuotaRefreshHandler />
			</StoreProvider>
		</AuthGuard>
	);
}
