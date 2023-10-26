/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useEffect, useState } from 'react';

import { map } from 'lodash';

import { searchResources } from '../../../soap/search-request';
import { useAppStatusStore } from '../../../store/zustand/store';
import { MeetingRoom } from '../../../types/editor';
import { Cn } from '../../../types/soap/soap-actions';

const getAllResources = async (
	resources = [] as Cn,
	value = '',
	offset = 0
): Promise<Array<MeetingRoom>> => {
	const response = await searchResources(value, offset);
	if (response.cn) {
		const newValue = resources.concat(response.cn);
		if (response.more) {
			return getAllResources(newValue, value, response.cn.length);
		}
		return map(newValue, (r) => ({
			id: r.id,
			label: r.fileAsStr,
			value: r.fileAsStr,
			email: r._attrs.email,
			type: r._attrs.zimbraCalResType
		}));
	}
	return map(resources, (r) => ({
		id: r.id,
		label: r.fileAsStr,
		value: r.fileAsStr,
		email: r._attrs.email,
		type: r._attrs.zimbraCalResType
	}));
};

export const EditorResourcesController = (): null => {
	const [resources, setResources] = useState<Array<MeetingRoom> | undefined>();

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
