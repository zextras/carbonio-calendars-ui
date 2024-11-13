/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import styled from 'styled-components';

import { calculatePosition } from '../utils';

export const MinutesLine = styled.div.attrs(
	({ width = '3px', color, atPosition }: { width: string; color: string; atPosition: number }) => ({
		width,
		color,
		atPosition
	})
)`
	width: ${(props): string => props.width};
	background-color: ${(props): string => props.color};
	height: 2rem;
	border-radius: none;
	float: left;
	position: absolute;
	left: ${(props): string => calculatePosition(props.atPosition)};
`;
