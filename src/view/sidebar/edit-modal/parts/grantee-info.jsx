/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useContext, useMemo } from 'react';

import { Chip, Container } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { EditModalContext } from '../../../../commons/edit-modal-context';
import { SHARE_USER_TYPE } from '../../../../constants';
import { findLabel } from '../../../../settings/components/utils';

const HoverChip = styled(Chip)`
	background-color: ${({ theme, hovered, grant }) =>
		hovered === grant ? theme.palette.gray3.hover : theme.palette.gray3.regular};
`;

export const GranteeInfo = ({ grant, hovered }) => {
	const [t] = useTranslation();
	const { roleOptions } = useContext(EditModalContext);

	const role = useMemo(
		() => findLabel(roleOptions, grant.perm || roleOptions, grant[0]?.perm || ''),
		[roleOptions, grant]
	);

	const label = useMemo(() => {
		const publicLabel = grant.gt === SHARE_USER_TYPE.PUBLIC ? t('public', 'public') : ''; // todo: find a default value
		const composeLabel = (name) => `${name} - ${role}`;
		return composeLabel(grant.d ?? grant.zid ?? publicLabel);
	}, [grant.d, grant.gt, grant.zid, role, t]);

	return (
		<Container crossAlignment="flex-start">
			<HoverChip label={label} hovered={hovered} grant={grant} />
		</Container>
	);
};
