/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { ReactElement, useMemo } from 'react';

import { Button, Container, useModal } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';

import { findShares } from '../../../actions/calendar-actions-fn';

export const FindSharesAccordionItem = (): ReactElement => {
	const [t] = useTranslation();
	const { createModal, closeModal } = useModal();
	const label = useMemo(() => t('find_shares', 'Find shares'), [t]);

	const onClick = useMemo(() => findShares({ createModal, closeModal }), [closeModal, createModal]);

	return (
		<Container padding={{ horizontal: 'medium', vertical: 'small' }}>
			<Button type="outlined" label={label} width="fill" color="primary" onClick={onClick} />
		</Container>
	);
};
