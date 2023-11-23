/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useEffect, useState } from 'react';

import { map } from 'lodash';

import { searchResources } from '../../../soap/search-resources';
import { useAppStatusStore } from '../../../store/zustand/store';
import { Resource } from '../../../types/editor';
import { Cn, Contact } from '../../../types/soap/soap-actions';

const normalizeResources = (
	r: Contact
): { id: string; label: string; value: string; email: string; type: string } => ({
	id: r.id,
	label: r.fileAsStr,
	value: r.fileAsStr,
	email: r._attrs.email,
	type: r._attrs.zimbraCalResType
});

const getAllResources = async (
	resources = [] as Cn,
	value = '',
	offset = 0
): Promise<Array<Resource>> => {
	const response = await searchResources(value, offset);
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
