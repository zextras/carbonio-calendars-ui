/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { t } from '@zextras/carbonio-shell-ui';

import { TodayAppointmentsWidget } from './today-appointments-widget';
import { CALENDAR_APP_ID } from '../../constants';
import { StoreProvider } from '../../store/redux';
import {
	DASHBOARD_WIDGET_CONTRACT_VERSION,
	type DashboardWidgetAction
} from '../../types/dashboard-widget';

/** The widget has no settings: the config is empty */
type TodayAppointmentsConfig = Record<string, never>;

const DEFAULT_CONFIG: TodayAppointmentsConfig = {};

// the dashboard renders the widget outside the calendars providers
const TodayAppointmentsWidgetWithStore = (): React.JSX.Element => (
	<StoreProvider>
		<TodayAppointmentsWidget />
	</StoreProvider>
);

export const todayAppointmentsWidget: DashboardWidgetAction<TodayAppointmentsConfig> = {
	id: `${CALENDAR_APP_ID}:today-appointments`,
	label: t('widget.today_appointments.label', 'Today appointments'),
	description: t(
		'widget.today_appointments.description',
		"Today's appointments, grouped by account"
	),
	icon: 'CalendarModOutline',
	execute: () => undefined,
	contractVersion: DASHBOARD_WIDGET_CONTRACT_VERSION,
	defaultSize: { columns: 6, rows: 6 },
	Component: TodayAppointmentsWidgetWithStore,
	defaultConfig: DEFAULT_CONFIG,
	serialize: (config) => ({ v: 1, data: JSON.stringify(config) }),
	deserialize: () => DEFAULT_CONFIG
};
