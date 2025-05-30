/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

declare module './react-big-calendar' {
	interface TimeGridProps extends ReactBigCalendar.TimeGridProps {
		enableAutoScroll?: boolean;
		eventOffset?: ReactBigCalendar.TimeGridProps['eventOffset'];
	}
}
