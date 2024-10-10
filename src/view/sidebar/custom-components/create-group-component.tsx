/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { ReactElement, useMemo } from 'react';

import { Button, Container, useModal } from '@zextras/carbonio-design-system';
import { t } from '@zextras/carbonio-shell-ui';

import { createGroup } from '../../../actions/calendar-actions-fn';
import {
	useUpdateGroups,
	getCalendarGroups
} from '../../../carbonio-ui-commons/store/zustand/folder';

export const CreateGroupComponent = (): ReactElement => {
	const { createModal, closeModal } = useModal();
	const label = useMemo(() => t('label.create_group', 'Create New Group'), []);
	const updateGroups = useUpdateGroups();
	const currentGroups = getCalendarGroups();

	const onClick = useMemo(
		() => createGroup({ createModal, closeModal }),
		[closeModal, createModal]
	);

	return (
		<Container padding={{ horizontal: 'medium', vertical: 'small' }}>
			<Button type="outlined" label={label} width="fill" color="primary" onClick={onClick} />
		</Container>
	);
};
