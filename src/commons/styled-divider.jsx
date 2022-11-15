/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import styled from 'styled-components';

const StyledDivider = styled.hr`
	border: 0;
	height: 0;
	border-top: 0.0625rem solid ${(props) => props.theme.palette.gray2.regular};
	width: calc(100% - 2rem);
	margin: 0;
`;

export default StyledDivider;
