/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import styled from 'styled-components';

const StyledDivider = styled.hr`
	border: 0px;
	height: 0px;
	border-top: 1px solid ${(props) => props.theme.palette.gray2.regular};
	width: calc(100% - 32px);
	margin: 0px;
`;

export default StyledDivider;
