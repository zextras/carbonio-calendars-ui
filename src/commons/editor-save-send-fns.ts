/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Dispatch } from 'redux';
import { createAppointment } from '../store/actions/new-create-appointment';
import { modifyAppointment } from '../store/actions/new-modify-appointment';
import { proposeNewTime } from '../store/actions/propose-new-time';
import { updateEditor } from '../store/slices/editor-slice';
import { Editor } from '../types/editor';

const createAppointmentFn = ({
	draft,
	editor,
	dispatch
}: {
	draft: boolean;
	editor: Editor;
	dispatch: Dispatch;
}): Promise<any> =>
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	dispatch(createAppointment({ draft, editor })).then(({ payload }) => {
		const { response } = payload;
		if (payload?.response) {
			dispatch(updateEditor({ id: payload.editor.id, editor: payload.editor }));
		}
		return Promise.resolve({ response, editor: payload.editor });
	});

const modifyAppointmentFn = ({
	draft,
	editor,
	dispatch
}: {
	draft: boolean;
	editor: Editor;
	dispatch: Dispatch;
}): Promise<any> =>
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	dispatch(modifyAppointment({ draft, editor })).then(({ payload }) => {
		const { response, error } = payload;
		if (response && !error) {
			dispatch(updateEditor({ id: payload.editor.id, editor: payload.editor }));
			return Promise.resolve({ response, editor: payload.editor });
		}
		return Promise.resolve(payload);
	});

const onProposeNewTime = ({
	editorId,
	dispatch
}: {
	editorId: string;
	dispatch: Dispatch;
}): Promise<any> =>
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	dispatch(proposeNewTime({ id })).then(({ payload }) => {
		const { response, editor, error } = payload;
		if (response && !error) {
			dispatch(updateEditor({ id: editorId, editor }));
			return Promise.resolve({ response, editor });
		}
		return Promise.resolve(payload);
	});

export const onSave = ({
	draft = true,
	isNew = true,
	editor,
	dispatch
}: {
	draft?: boolean;
	isNew?: boolean;
	editor: Editor;
	dispatch: Dispatch;
}): Promise<any> =>
	isNew
		? createAppointmentFn({ draft, editor, dispatch })
		: modifyAppointmentFn({ draft, editor, dispatch });

export const onSend = ({
	isNew,
	editor,
	dispatch
}: {
	isNew: boolean;
	editor: Editor;
	dispatch: Dispatch;
}): Promise<any> =>
	editor?.isProposeNewTime
		? onProposeNewTime({ editorId: editor.id, dispatch })
		: onSave({ draft: false, isNew, editor, dispatch });
