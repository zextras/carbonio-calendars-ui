/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useMemo } from 'react';

import { useTranslation } from 'react-i18next';

import { useAppSelector } from 'store/redux/hooks';
import {
	selectEditorTitle,
	selectEditorDisabled,
	selectEditorMeetingRoom,
	selectEditorEquipment,
	selectEditorAttendees,
	selectEditorOptionalAttendees
} from 'store/selectors/editor';
import { Resource, Editor } from 'types/editor';
import { getDuplicateResourceIds, isValidResource } from 'view/editor/parts/utils';

// Centralized hooks for editor button state (Save / Send)

export type EditorButtonResourcesState = {
	title: string | undefined;
	disabledFlags: Editor['disabled'];
	meetingRooms: Resource[];
	equipments: Resource[];
	hasInvalidResources: boolean;
	hasDuplicateResources: boolean;
	hasResourceIssues: boolean;
};

export const useEditorResourcesState = (editorId: string): EditorButtonResourcesState => {
	const title = useAppSelector(selectEditorTitle(editorId));
	const disabledFlags = useAppSelector(selectEditorDisabled(editorId));
	const meetingRoomsRaw = useAppSelector(selectEditorMeetingRoom(editorId));
	const equipmentsRaw = useAppSelector(selectEditorEquipment(editorId));
	const meetingRooms = useMemo(() => meetingRoomsRaw ?? [], [meetingRoomsRaw]);
	const equipments = useMemo(() => equipmentsRaw ?? [], [equipmentsRaw]);

	const hasInvalidResources = useMemo(
		() => meetingRooms.concat(equipments).some((r) => !isValidResource(r)),
		[meetingRooms, equipments]
	);
	const duplicateIds = useMemo(
		() => getDuplicateResourceIds(meetingRooms.concat(equipments)),
		[meetingRooms, equipments]
	);
	const hasDuplicateResources = duplicateIds.size > 0;
	const hasResourceIssues = useMemo(
		() => [hasInvalidResources, hasDuplicateResources].some(Boolean),
		[hasInvalidResources, hasDuplicateResources]
	);

	return {
		title,
		disabledFlags,
		meetingRooms,
		equipments,
		hasInvalidResources,
		hasDuplicateResources,
		hasResourceIssues
	};
};

const useEditorRecipients = (
	editorId: string
): { attendeesLength: number; optionalLength: number } => {
	const attendees = useAppSelector(selectEditorAttendees(editorId)) ?? [];
	const optional = useAppSelector(selectEditorOptionalAttendees(editorId)) ?? [];
	return { attendeesLength: attendees.length, optionalLength: optional.length };
};

export const useEditorSaveButtonState = (
	editorId: string
): { isDisabled: boolean; tooltip: string } => {
	const { title, disabledFlags, hasResourceIssues } = useEditorResourcesState(editorId);
	const { t } = useTranslation();
	const isDisabled = !!disabledFlags?.saveButton || !title?.length || hasResourceIssues;
	let tooltip = '';
	if (isDisabled) {
		if (disabledFlags?.saveButton) {
			tooltip = t('label.cannot_save', 'Saving is disabled for this event');
		} else if (!title?.length) {
			tooltip = t('label.add_event_title_to_save', 'Add event title to save');
		} else if (hasResourceIssues) {
			tooltip = t('label.fix_input_errors_to_save', 'Fix input errors to save');
		}
	}
	return { isDisabled, tooltip };
};

export const useEditorSendButtonState = (
	editorId: string
): { isDisabled: boolean; tooltip: string } => {
	const { title, disabledFlags, hasResourceIssues, meetingRooms, equipments } =
		useEditorResourcesState(editorId);
	const { attendeesLength, optionalLength } = useEditorRecipients(editorId);
	const { t } = useTranslation();
	const noRecipients =
		!attendeesLength && !optionalLength && !meetingRooms.length && !equipments.length;
	const isDisabled =
		!!disabledFlags?.sendButton || !title?.length || noRecipients || hasResourceIssues;
	let tooltip = '';
	if (isDisabled) {
		if (disabledFlags?.sendButton) {
			tooltip = t('label.cannot_send', 'Sending is disabled for this event');
		} else if (!title?.length) {
			tooltip = t('label.add_event_title_to_send', 'Add event title to send');
		} else if (noRecipients) {
			tooltip = t('label.no_recipients', 'Add at least one attendee or resource to send');
		} else if (hasResourceIssues) {
			tooltip = t('label.fix_input_errors_to_send', 'Fix input errors to send');
		}
	}
	return { isDisabled, tooltip };
};
