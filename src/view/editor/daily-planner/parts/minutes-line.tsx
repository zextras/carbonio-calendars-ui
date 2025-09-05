/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import styled from '@emotion/styled';

import { calculatePosition } from '../utils';

export const MinutesLine = styled.div<{ $width?: string; $color: string; $atPosition: number }>`
	width: ${(props): string => props.$width ?? '3px'};
	background-color: ${(props): string | undefined => props.$color};
	height: 2rem;
	border-radius: none;
	float: left;
	position: absolute;
	left: ${(props): string => calculatePosition(props.$atPosition)};
`;
