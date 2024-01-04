/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useEffect, useState } from 'react';

import { soapFetch } from '@zextras/carbonio-shell-ui';
import { map } from 'lodash';

import { SearchReturnType } from '../../../soap/search-request';
import { searchResources } from '../../../soap/search-resources';
import { useAppSelector } from '../../../store/redux/hooks';
import { selectEditorEquipment, selectEditorMeetingRoom } from '../../../store/selectors/editor';
import { useAppStatusStore } from '../../../store/zustand/store';
import { Resource } from '../../../types/editor';
import { Cn, Contact } from '../../../types/soap/soap-actions';

const normalizeResources = (
	r: Contact
): { id: string; label: string; value: string; email: string; type: string } => ({
	id: r.id,
	label: r._attrs.fullName,
	value: r._attrs.fullName,
	email: r._attrs.email,
	type: r._attrs.zimbraCalResType
});

const getAllResources = async (
	resources = [] as Cn,
	value = '',
	offset = 0
): Promise<Array<Resource>> => {
	const response = await searchResources(value, offset, 100);
	if (response.cn) {
		const newValue = resources.concat(response.cn);
		if (response.more) {
			return getAllResources(newValue, value, response.cn.length);
		}
		return map(newValue, (r) => normalizeResources(r));
	}
	return map(resources, (r) => normalizeResources(r));
};

export const EditorResourcesController = (): null => {
	const [resources, setResources] = useState<Array<Resource> | undefined>();

	useEffect(() => {
		if (!resources) {
			getAllResources().then((res) => {
				useAppStatusStore.setState({ resources: res });
				setResources(res);
			});
		}
	}, [resources]);
	return null;
};

export const searchCalendarResourcesRequest = async (value: string): Promise<SearchReturnType> => {
	const response: SearchReturnType = await soapFetch('SearchCalendarResources', {
		attrs: 'email,zimbraCalResType,fullName',
		searchFilter: {
			conds: {
				or: '1',
				cond: {
					attr: 'zimbraCalResType',
					op: 'eq',
					value
				}
			}
		},
		_jsns: 'urn:zimbraAccount'
	});
	return response?.Fault ? { ...response.Fault, error: true } : response;
};

export const EditorResourcesControllerV2 = ({ editorId }: { editorId: string }): null => {
	const meetingRoomsValue = useAppSelector(selectEditorMeetingRoom(editorId));
	const equipmentsValue = useAppSelector(selectEditorEquipment(editorId));

	const [isLoading, setIsLoading] = useState<boolean>(false);

	useEffect(() => {
		if (!isLoading) {
			if (meetingRoomsValue) {
				searchCalendarResourcesRequest('Location').then((res) => {
					setIsLoading(true);
					useAppStatusStore.setState({
						meetingRoom: map(res.calresource, (r) => normalizeResources(r))
					});
				});
			}
			if (equipmentsValue) {
				searchCalendarResourcesRequest('Equipment').then((res) => {
					setIsLoading(true);
					useAppStatusStore.setState({
						equipment: map(res.calresource, (r) => normalizeResources(r))
					});
				});
			}
		}
	}, [equipmentsValue, isLoading, meetingRoomsValue, setIsLoading]);
	return null;
};
