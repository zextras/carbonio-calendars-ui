/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { ReactElement, useMemo } from 'react';

import { Button, Container, useModal } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';

import { createGroup } from '../../../actions/calendar-actions-fn';

export const CreateGroupAccordionItem = (): ReactElement => {
	const [t] = useTranslation();
	const { createModal, closeModal } = useModal();
	const label = useMemo(() => t('label.create_group', 'Create New Group'), [t]);

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
