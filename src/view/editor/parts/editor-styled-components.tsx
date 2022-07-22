/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { IconCheckbox } from '@zextras/carbonio-design-system';
import styled from 'styled-components';

export const ResizedIconCheckbox = styled(IconCheckbox)`
	[class^='Padding__Comp'] {
		padding: 6px;
		svg {
			height: 20px;
			width: 20px;
			fill: ${({ disabled, theme, value }): string => {
				if (disabled) {
					return theme.palette.secondary.disabled;
				}
				return value ? theme.palette.gray6.regular : theme.palette.currentColor.regular;
			}}
		background: ${({ value, theme }): string =>
			value ? theme.palette.primary.regular : theme.palette.currentColor.regular};
		border-radius: 50%;
	}
`;
