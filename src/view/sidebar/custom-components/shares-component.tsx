/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { ReactElement, useMemo } from 'react';

import { Button, Container, useModal } from '@zextras/carbonio-design-system';
import { t } from '@zextras/carbonio-shell-ui';

import { findShares } from '../../../actions/calendar-actions-fn';

export const SharesComponent = (): ReactElement => {
	const createModal = useModal();
	const label = useMemo(() => t('find_shares', 'Find shares'), []);

	const onClick = useMemo(() => findShares({ createModal }), [createModal]);

	return (
		<Container padding={{ horizontal: 'medium', vertical: 'small' }}>
			<Button type="outlined" label={label} width="fill" color="primary" onClick={onClick} />
		</Container>
	);
};
