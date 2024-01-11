/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useEffect, useState } from 'react';

import { map } from 'lodash';

import { searchCalendarResourcesRequest } from '../../../soap/search-calendar-resources-request';
import { useAppSelector } from '../../../store/redux/hooks';
import { selectEditorEquipment, selectEditorMeetingRoom } from '../../../store/selectors/editor';
import { useAppStatusStore } from '../../../store/zustand/store';
import { Contact } from '../../../types/soap/soap-actions';

const normalizeResources = (
	r: Contact
): { id: string; label: string; value: string; email: string; type: string } => ({
	id: r.id,
	label: r._attrs.fullName,
	value: r._attrs.fullName,
	email: r._attrs.email,
	type: r._attrs.zimbraCalResType
});

export const EditorResourcesController = ({ editorId }: { editorId: string }): null => {
	const meetingRoomsValue = useAppSelector(selectEditorMeetingRoom(editorId));
	const equipmentsValue = useAppSelector(selectEditorEquipment(editorId));

	const [isLoading, setIsLoading] = useState<boolean>(false);

	useEffect(() => {
		if (!isLoading) {
			if (meetingRoomsValue) {
				searchCalendarResourcesRequest('Location').then((res) => {
					setIsLoading(true);
					useAppStatusStore.setState({
						meetingRoom: res.calresource
							? map(res.calresource, (r) => normalizeResources(r))
							: undefined
					});
				});
			}
			if (equipmentsValue) {
				searchCalendarResourcesRequest('Equipment').then((res) => {
					setIsLoading(true);
					useAppStatusStore.setState({
						equipment: res.calresource
							? map(res.calresource, (r) => normalizeResources(r))
							: undefined
					});
				});
			}
		}
	}, [equipmentsValue, isLoading, meetingRoomsValue, setIsLoading]);
	return null;
};
