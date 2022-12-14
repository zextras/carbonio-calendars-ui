/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Chip, Container } from '@zextras/carbonio-design-system';
import React, { useContext, useMemo } from 'react';
import styled from 'styled-components';
import { EditModalContext } from '../../../../commons/edit-modal-context';
import { findLabel } from '../../../../settings/components/utils';

const HoverChip = styled(Chip)`
	background-color: ${({ theme, hovered, grant }) =>
		hovered === grant ? theme.palette.gray3.hover : theme.palette.gray3.regular};
`;

export const GranteeInfo = ({ grant, hovered }) => {
	const { roleOptions } = useContext(EditModalContext);

	const role = useMemo(
		() => findLabel(roleOptions, grant.perm || roleOptions, grant[0]?.perm || ''),
		[roleOptions, grant]
	);

	const label = useMemo(() => {
		const composeLabel = (name) => `${name} - ${role}`;
		return grant.d ? composeLabel(grant.d) : composeLabel(grant.zid);
	}, [grant, role]);

	return (
		<Container crossAlignment="flex-start">
			<HoverChip label={label} hovered={hovered} grant={grant} />
		</Container>
	);
};
