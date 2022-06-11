/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { IdentityItem } from '../../types/editor';
import { InviteFreeBusy } from '../../types/store/invite';
import { Store } from '../../types/store/store';

export const selectEditor =
	(id: string) =>
	(state: Store): string =>
		state.editor.editors[id];

export const selectActiveEditorId = (state: Store): string | undefined => state.editor.activeId;

export function selectEditors(state: Store): any {
	return state.editor.editors;
}

export const selectOrganizer =
	(id: string) =>
	(state: Store): IdentityItem =>
		state?.editor?.editors?.[id]?.organizer;

export const selectEditorTitle =
	(id: string) =>
	(state: Store): string =>
		state?.editor?.editors?.[id]?.title;

export const selectEditorLocation =
	(id: string) =>
	(state: Store): string =>
		state?.editor?.editors?.[id]?.location;

export const selectEditorRoom =
	(id: string) =>
	(state: Store): string =>
		state?.editor?.editors?.[id]?.room;

export const selectEditorAttendees =
	(id: string) =>
	(state: Store): Array<any> =>
		state?.editor?.editors?.[id]?.attendees;

export const selectEditorOptionalAttendees =
	(id: string) =>
	(state: Store): Array<any> =>
		state?.editor?.editors?.[id]?.optionalAttendees;

export const selectEditorAllDay =
	(id: string) =>
	(state: Store): boolean =>
		state?.editor?.editors?.[id]?.allDay;

export const selectEditorFreeBusy =
	(id: string) =>
	(state: Store): InviteFreeBusy =>
		state?.editor?.editors?.[id]?.freeBusy;

export const selectEditorClass =
	(id: string) =>
	(state: Store): string =>
		state?.editor?.editors?.[id]?.class;

export const selectEditorStart =
	(id: string) =>
	(state: Store): string =>
		state?.editor?.editors?.[id]?.start;

export const selectEditorEnd =
	(id: string) =>
	(state: Store): string =>
		state?.editor?.editors?.[id]?.end;

export const selectEditorRichText =
	(id: string) =>
	(state: Store): string =>
		state?.editor?.editors?.[id]?.richText;

export const selectEditorPlainText =
	(id: string) =>
	(state: Store): string =>
		state?.editor?.editors?.[id]?.plainText;
