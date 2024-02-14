/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Editor, IdentityItem, Resource } from '../../types/editor';
import { InviteFreeBusy } from '../../types/store/invite';
import type { RootState } from '../redux';

export const selectEditor =
	(id: string) =>
	(state: RootState): Editor =>
		state.editor.editors[id];

export function selectEditors(state: RootState): Record<string, Editor> {
	return state.editor.editors;
}

export const selectEditorIsRichText =
	(id: string) =>
	(state: RootState): boolean | undefined =>
		state?.editor?.editors?.[id]?.isRichText;

export const selectOrganizer =
	(id: string) =>
	(state: RootState): IdentityItem =>
		state?.editor?.editors?.[id]?.organizer;

export const selectSender =
	(id: string) =>
	(state: RootState): IdentityItem =>
		state?.editor?.editors?.[id]?.sender;

export const selectEditorTitle =
	(id: string) =>
	(state: RootState): string | undefined =>
		state?.editor?.editors?.[id]?.title;

export const selectEditorLocation =
	(id: string) =>
	(state: RootState): string | undefined =>
		state?.editor?.editors?.[id]?.location;

export const selectEditorRoom =
	(id: string) =>
	(state: RootState): Editor['room'] | undefined =>
		state?.editor?.editors?.[id]?.room;

export const selectEditorAttendees =
	(id: string) =>
	(state: RootState): Array<any> =>
		state?.editor?.editors?.[id]?.attendees;

export const selectEditorUid =
	(id: string) =>
	(state: RootState): string | undefined =>
		state?.editor?.editors?.[id]?.uid;

export const selectEditorOptionalAttendees =
	(id: string) =>
	(state: RootState): Array<any> =>
		state?.editor?.editors?.[id]?.optionalAttendees;

export const selectEditorAllDay =
	(id: string) =>
	(state: RootState): boolean | undefined =>
		state?.editor?.editors?.[id]?.allDay;

export const selectEditorFreeBusy =
	(id: string) =>
	(state: RootState): InviteFreeBusy | undefined =>
		state?.editor?.editors?.[id]?.freeBusy;

export const selectEditorClass =
	(id: string) =>
	(state: RootState): string | undefined =>
		state?.editor?.editors?.[id]?.class;

export const selectEditorStart =
	(id: string) =>
	(state: RootState): number | undefined =>
		state?.editor?.editors?.[id]?.start;

export const selectEditorEnd =
	(id: string) =>
	(state: RootState): number | undefined =>
		state?.editor?.editors?.[id]?.end;

export const selectEditorRichText =
	(id: string) =>
	(state: RootState): string =>
		state?.editor?.editors?.[id]?.richText;

export const selectEditorPlainText =
	(id: string) =>
	(state: RootState): string =>
		state?.editor?.editors?.[id]?.plainText;

export const selectEditorTimezone =
	(id: string) =>
	(state: RootState): string | undefined =>
		state?.editor?.editors?.[id]?.timezone;

export const selectEditorReminder =
	(id: string) =>
	(state: RootState): string | undefined =>
		state?.editor?.editors?.[id]?.reminder;

export const selectEditorRecurrence =
	(id: string) =>
	(state: RootState): any =>
		state?.editor?.editors?.[id]?.recur;

export const selectEditorRecurrenceFrequency =
	(id: string) =>
	(state: RootState): string | undefined =>
		state?.editor?.editors?.[id]?.recur?.[0]?.add?.[0]?.rule?.[0]?.freq;

export const selectEditorRecurrenceInterval =
	(id: string) =>
	(state: RootState): { ival: number } | undefined =>
		state?.editor?.editors?.[id]?.recur?.[0]?.add?.[0]?.rule?.[0]?.interval?.[0]?.ival && {
			ival: state?.editor?.editors?.[id]?.recur?.[0]?.add?.[0]?.rule?.[0]?.interval?.[0]?.ival
		};

export const selectEditorRecurrenceByDay =
	(id: string) =>
	(state: RootState): { wkday: Array<{ day: string }> } | undefined =>
		state?.editor?.editors?.[id]?.recur?.[0]?.add?.[0]?.rule?.[0]?.byday?.[0]?.wkday && {
			wkday: state?.editor?.editors?.[id]?.recur?.[0]?.add?.[0]?.rule?.[0]?.byday?.[0]?.wkday
		};

export const selectEditorRecurrenceUntilDate =
	(id: string) =>
	(state: RootState): string | undefined =>
		state?.editor?.editors?.[id]?.recur?.[0]?.add?.[0]?.rule?.[0]?.until?.[0]?.d;

export const selectEditorRecurrenceSetPos =
	(id: string) =>
	(state: RootState): string | undefined =>
		state?.editor?.editors?.[id]?.recur?.[0]?.add?.[0]?.rule?.[0]?.bysetpos?.poslist;

export const selectEditorRecurrenceCount =
	(id: string) =>
	(state: RootState): number | undefined =>
		state?.editor?.editors?.[id]?.recur?.[0]?.add?.[0]?.rule?.[0]?.count?.[0]?.num;

export const selectEditorCalendar =
	(id: string) =>
	(state: RootState): any =>
		state?.editor?.editors?.[id]?.calendar;

export const selectEditorCalendarId =
	(id: string) =>
	(state: RootState): string | undefined =>
		state?.editor?.editors?.[id]?.calendar?.id;

export const selectEditorIsNew =
	(id: string) =>
	(state: RootState): boolean =>
		state?.editor?.editors?.[id]?.isNew;

export const selectEditorInviteId =
	(id: string) =>
	(state: RootState): string | undefined =>
		state?.editor?.editors?.[id]?.inviteId;

export const selectEditorAttachmentFiles =
	(id: string) =>
	(state: RootState): Array<any> =>
		state?.editor?.editors?.[id]?.attachmentFiles;

export const selectEditorAttachmentAid =
	(id: string) =>
	(state: RootState): Array<string> =>
		state?.editor?.editors?.[id]?.attach?.aid;

export const selectEditorAttach =
	(id: string) =>
	(state: RootState): Array<any> =>
		state?.editor?.editors?.[id]?.attach?.mp;

export const selectEditorDisabled =
	(id: string) =>
	(state: RootState): Record<string, boolean> =>
		state?.editor?.editors?.[id]?.disabled;

export const selectEditorMeetingRoom =
	(id: string) =>
	(state: RootState): Array<Resource> | undefined =>
		state?.editor?.editors?.[id]?.meetingRoom;

export const selectEditorEquipment =
	(id: string) =>
	(state: RootState): Array<Resource> | undefined =>
		state?.editor?.editors?.[id]?.equipment;

export const selectIsInstance =
	(id: string) =>
	(state: RootState): boolean =>
		state?.editor?.editors?.[id]?.isInstance;

export const selectIsSeries =
	(id: string) =>
	(state: RootState): boolean =>
		state?.editor?.editors?.[id]?.isSeries;

export const selectIsException =
	(id: string) =>
	(state: RootState): boolean =>
		state?.editor?.editors?.[id]?.isException;
