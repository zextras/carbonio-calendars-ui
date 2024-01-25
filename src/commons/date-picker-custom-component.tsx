/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, ReactElement, useCallback, useEffect, useState } from 'react';

import { Padding, Row, Input, IconButton } from '@zextras/carbonio-design-system';
import styled from 'styled-components';

type CustomComponentProps = {
	value: Date;
	onClick: () => void;
	onChange: (a: string) => unknown;
	label: string;
	icon?: string;
	testId?: string;
};

const CustomInputWrapper = styled(Row)`
	border-bottom: 0.0625rem solid ${({ theme }): string => theme.palette.gray4.regular};
	border-radius: 0.125rem;
	&:hover {
		background: ${({ theme }): string => theme.palette.gray2.regular};
	}

	&:focus-within {
		border-bottom: 0.0625rem solid ${({ theme }): string => theme.palette.primary.regular};
	}
`;

const DatePickerCustomComponent: FC<CustomComponentProps> = React.forwardRef(
	function DatePickerCustomComponentFn(
		{ value, onClick, onChange, label, icon = 'CalendarOutline', testId = 'picker' },
		ref
	): ReactElement {
		const [input, setInput] = useState(value.toString());
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
			setInput(value.toString());
		}, [value]);

		return (
			<CustomInputWrapper background="gray4">
				<Row takeAvailableSpace minWidth="9.375rem" background="transparent">
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
						<IconButton
							data-testid={testId}
							icon={icon}
							size="large"
							onClick={onClick}
							backgroundColor="transparent"
							iconColor="text"
						/>
					</Padding>
				</Row>
			</CustomInputWrapper>
		);
	}
);

export default DatePickerCustomComponent;
