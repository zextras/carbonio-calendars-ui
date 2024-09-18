/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { ReactElement, useMemo } from 'react';

import { Button, Container, useModal } from '@zextras/carbonio-design-system';
import { t } from '@zextras/carbonio-shell-ui';

import {
	useUpdateGroups,
	getCalendarGroups
} from '../../../carbonio-ui-commons/store/zustand/folder';
import { createCalendarGroupRequest } from '../../../soap/create-calendar-group-request';

export const CreateGroupComponent = (): ReactElement => {
	const { createModal, closeModal } = useModal();
	const label = useMemo(() => t('label.create_group', 'Create New Group'), []);
	const updateGroups = useUpdateGroups();
	const currentGroups = getCalendarGroups();

	const onClick = (): void => {
		createCalendarGroupRequest({ name: 'New Group', calendarIds: ['1'] }).then((res) => {
			console.log('Group created', res);
			updateGroups([
				...currentGroups,
				{
					id: res.group.id,
					name: res.group.name,
					calendarId: res.group.calendarId.map((g) => g._content)
				}
			]);
		});
	};

	return (
		<Container padding={{ horizontal: 'medium', vertical: 'small' }}>
			<Button type="outlined" label={label} width="fill" color="primary" onClick={onClick} />
		</Container>
	);
};
