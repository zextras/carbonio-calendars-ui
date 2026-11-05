/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { t } from '@zextras/carbonio-shell-ui';

import { MeetingRoomsAvailabilitySettings } from './meeting-rooms-availability-settings';
import { MeetingRoomsAvailabilityWidget } from './meeting-rooms-availability-widget';
import {
	DEFAULT_CONFIG,
	deserializeConfig,
	serializeConfig,
	type MeetingRoomsAvailabilityConfig
} from './utils';
import { CALENDAR_APP_ID } from '../../constants';
import {
	DASHBOARD_WIDGET_CONTRACT_VERSION,
	type DashboardWidgetAction
} from '../../types/dashboard-widget';

export const meetingRoomsAvailabilityWidget: DashboardWidgetAction<MeetingRoomsAvailabilityConfig> =
	{
		id: `${CALENDAR_APP_ID}:meeting-rooms-availability`,
		label: t('widget.meeting_rooms_availability.label', 'Meeting rooms availability'),
		description: t(
			'widget.meeting_rooms_availability.description',
			"Today's availability of the selected meeting rooms"
		),
		icon: 'BuildingOutline',
		execute: () => undefined,
		contractVersion: DASHBOARD_WIDGET_CONTRACT_VERSION,
		defaultSize: { columns: 8, rows: 5 },
		Component: MeetingRoomsAvailabilityWidget,
		SettingsComponent: MeetingRoomsAvailabilitySettings,
		defaultConfig: DEFAULT_CONFIG,
		serialize: serializeConfig,
		deserialize: deserializeConfig
	};
