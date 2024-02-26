/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container, Text } from '@zextras/carbonio-design-system';
import styled from 'styled-components';

export const Square = styled.div`
	width: 1.125rem;
	height: 1.125rem;
	position: relative;
	top: -0.1875rem;
	border: 0.0625rem solid ${({ theme }): string => theme.palette.gray2.regular};
	background: ${({ color }): string | undefined => color};
	border-radius: 0.25rem;
`;
export const ColorContainer = styled(Container)`
	border-bottom: 0.0625rem solid ${({ theme }): string => theme.palette.gray2.regular};
`;

export const TextUpperCase = styled(Text)`
	text-transform: capitalize;
`;
