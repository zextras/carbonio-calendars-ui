/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useContext, useMemo } from 'react';
import { replace, split, capitalize } from 'lodash';
import { Chip, Container } from '@zextras/zapp-ui';
import styled from 'styled-components';
import { findLabel } from '../../../../settings/components/utils';
import { EditModalContext } from '../../../../commons/edit-modal-context';

const HoverChip = styled(Chip)`
	background-color: ${({ theme, hovered, grant }) =>
		hovered === grant ? theme.palette.gray3.hover : theme.palette.gray3.regular};
`;

export const GranteeInfo = ({ grant, hovered }) => {
	const { roleOptions } = useContext(EditModalContext);
	const label = useMemo(
		() =>
			`${capitalize(replace(split(grant.d, '@')?.[0], '.', ' '))} - ${
				split(findLabel(roleOptions, grant.perm), ' ')[0]
			}`,
		[grant.d, grant.perm, roleOptions]
	);
	return (
		<Container crossAlignment="flex-start">
			<HoverChip label={label} hovered={hovered} grant={grant} />
		</Container>
	);
};
