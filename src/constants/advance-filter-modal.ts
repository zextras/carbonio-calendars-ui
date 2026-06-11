/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { addMonths, startOfDay, subMonths } from 'date-fns';

export const DEFAULT_DATE_START = startOfDay(subMonths(new Date(), 1)).getTime();
export const DEFAULT_DATE_END = startOfDay(addMonths(new Date(), 1)).getTime();
