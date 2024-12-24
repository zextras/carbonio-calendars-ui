/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type * as ReactBigCalendar from 'react-big-calendar';

declare module 'react-big-calendar' {
	interface TimeGridProps extends ReactBigCalendar.TimeGridProps {
		enableAutoScroll?: boolean;
		eventOffset?: ReactBigCalendar.TimeGridProps['eventOffset'];
	}
}
