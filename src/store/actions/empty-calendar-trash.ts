/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { emptyCalendarTrashRequest } from '../../soap/empty-calendar-trash-request';

export const emptyCalendarTrash = async (): Promise<any> => emptyCalendarTrashRequest();
