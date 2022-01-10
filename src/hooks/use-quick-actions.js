/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { editAppointment, moveInstanceToTrash } from './use-event-actions';

export const useQuickActions = (event, context, t) =>
	event?.resource?.iAmOrganizer
		? [
				editAppointment(event, context, t),
				moveInstanceToTrash(event, { ...context, isInstance: true }, t)
		  ]
		: [];
