/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useHistory, useLocation, useParams } from 'react-router-dom';
import { useCallback } from 'react';
import { useAddBoardCallback } from '@zextras/zapp-shell';
import { closeEventFn, editEventFn, moveToBardFn, openEventFn } from '../utils/actions-fn';

export const useSearchActionsFn = (event) => {
	const history = useHistory();
	const { pathname } = useLocation();
	const { apptId, ridZ, action } = useParams();
	const addBoard = useAddBoardCallback();

	const moveToBoard = useCallback(
		(ev, editor) => moveToBardFn(ev, { addBoard, apptId, ridZ, editor, action, history, pathname }),
		[action, addBoard, apptId, history, pathname, ridZ]
	);

	const edit = useCallback(
		(ev) => editEventFn(ev, { action, history, pathname, apptId, ridZ }),
		[action, apptId, history, pathname, ridZ]
	);

	const open = useCallback(
		(ev) =>
			openEventFn(ev, {
				action,
				history,
				pathname,
				apptId: event?.resource?.id,
				ridZ: event?.resource?.ridZ
			}),
		[action, event?.resource?.id, event?.resource?.ridZ, history, pathname]
	);

	const close = useCallback(
		(ev) => closeEventFn(ev, { action, history, pathname, apptId, ridZ }),
		[action, apptId, history, pathname, ridZ]
	);

	return {
		edit,
		open,
		close,
		moveToBoard
	};
};
