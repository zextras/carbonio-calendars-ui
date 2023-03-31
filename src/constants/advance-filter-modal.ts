/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import moment from 'moment';

export const DEFAULT_DATE_START = moment().startOf('day').subtract(1, 'months').valueOf();
export const DEFAULT_DATE_END = moment().startOf('day').add(1, 'months').valueOf();
