/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { ReactElement, useMemo } from 'react';

import { Button, Container, useModal } from '@zextras/carbonio-design-system';
import { t } from '@zextras/carbonio-shell-ui';

import { createCalendarGroupRequest } from '../../../soap/create-calendar-group-request';

export const CreateGroupComponent = (): ReactElement => {
	const { createModal, closeModal } = useModal();
	const label = useMemo(() => t('label.create_group', 'Create New Group'), []);

	const onClick = (): void => {
		createCalendarGroupRequest({ name: 'New Group', calendarIds: ['1'] }).then((resp) => {
			console.log('Group created', resp);
		});
	};

	return (
		<Container padding={{ horizontal: 'medium', vertical: 'small' }}>
			<Button type="outlined" label={label} width="fill" color="primary" onClick={onClick} />
		</Container>
	);
};
