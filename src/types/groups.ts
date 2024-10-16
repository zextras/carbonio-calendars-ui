/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Calendar } from './store/calendars';

export type GroupCalendar = Pick<Calendar, 'id' | 'name' | 'color'>;
