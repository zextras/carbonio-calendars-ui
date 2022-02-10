/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, ReactElement, useCallback, useEffect, useState } from 'react';
import { Padding, Row, Icon, Input } from '@zextras/carbonio-design-system';
import styled from 'styled-components';

type CustomComponentProps = {
	value: unknown;
	onClick: () => void;
	onChange: (a: string) => unknown;
	label: string;
};

const CustomInputWrapper = styled(Row)`
	border-bottom: 1px solid ${({ theme }): string => theme.palette.gray4};
	border-radius: 2px;
	&:hover {
		background: ${({ theme }): string => theme.palette.gray2};
	}

	&:focus-within {
		border-bottom: 1px solid ${({ theme }): string => theme.palette.primary};
	}
`;

const DatePickerCustomComponent: FC<CustomComponentProps> = ({
	value,
	onClick,
	onChange,
	label
}): ReactElement => {
	const [input, setInput] = useState(value);
	const [timer, setTimer] = useState<null | ReturnType<typeof setTimeout>>(null);

	const throttledOnChange = useCallback(
		(data) => {
			clearTimeout(timer as ReturnType<typeof setTimeout>);
			const newTimer = setTimeout(() => {
				onChange(data);
			}, 1000);

			setTimer(newTimer);
		},
		[onChange, timer]
	);

	useEffect(() => {
		setInput(value);
	}, [value]);

	return (
		<CustomInputWrapper background="gray4">
			<Row takeAvailableSpace minWidth="150px" background="transparent">
				<Input
					label={label}
					value={input}
					onChange={(e: React.FormEvent<HTMLInputElement>): void => {
						setInput((e.target as HTMLInputElement).value);
						throttledOnChange(e);
					}}
					hideBorder
					disabled
				/>
			</Row>
			<Row>
				<Padding horizontal="small">
					<Icon
						icon="CalendarOutline"
						size="large"
						onClick={onClick}
						backgroundColor="transparent"
						iconColor="text"
					/>
				</Padding>
			</Row>
		</CustomInputWrapper>
	);
};

export default DatePickerCustomComponent;
