/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback, useState } from 'react';

import { Icon, IconButton, Row, Shimmer, Text, Tooltip } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';

import { AppointmentCardContainer } from './appointment-card-container';
import { useAttendeesAvailability } from '../../../hooks/use-attendees-availability';
import { getIsBusyAtTimeOfTheEvent } from '../../../view/editor/parts/editor-availability-warning-row';

const RowContainer = ({ children }: JSX.ElementChildrenAttribute): JSX.Element => (
	<Row width="fill" mainAlignment="flex-start" padding={{ vertical: 'small' }}>
		{children}
	</Row>
);

export const AvailabilityChecker = ({
	email,
	start,
	end,
	allDay,
	rootId,
	uid
}: {
	email: string;
	start: number;
	end: number;
	allDay: boolean;
	rootId: string;
	uid?: string;
}): JSX.Element | null => {
	const [open, setOpen] = useState(false);
	const something = useAttendeesAvailability(start, [{ email }], uid);
	const [t] = useTranslation();

	const onClick = useCallback(() => {
		setOpen((prevValue) => !prevValue);
	}, []);
	if (!something) {
		const label = t('label.checking_availability', 'Checking your availability');
		return (
			<RowContainer>
				<Row mainAlignment="flex-start" padding={{ right: 'small' }}>
					<Shimmer.Icon size="large" />
				</Row>

				<Row takeAvailableSpace mainAlignment="flex-start">
					<Tooltip placement="right" label={label}>
						<Text size="medium" overflow="break-word">
							{label}
						</Text>
					</Tooltip>
				</Row>
			</RowContainer>
		);
	}
	const isBusy = getIsBusyAtTimeOfTheEvent(something[0], start, end, something, allDay);
	if (isBusy) {
		const label = t('label.check_availability', 'Check your availability');

		return (
			<RowContainer>
				<Row mainAlignment="flex-start" padding={{ right: 'small' }}>
					<Icon size="large" icon="CalendarWarning" color={'warning'} />
				</Row>

				<Row mainAlignment="flex-start">
					<Tooltip placement="right" label={label}>
						<Text size="medium" overflow="break-word">
							{label}
						</Text>
					</Tooltip>
				</Row>

				<Row mainAlignment="flex-start" padding={{ horizontal: 'extrasmall' }}>
					<IconButton
						customSize={{ iconSize: 'large', paddingSize: 0 }}
						icon={open ? 'ChevronUpOutline' : 'ChevronDownOutline'}
						onClick={onClick}
					/>
				</Row>
				{open && <AppointmentCardContainer start={start} end={end} rootId={rootId} uid={uid} />}
			</RowContainer>
		);
	}
	const label = t('label.available', 'You are available');
	return (
		<RowContainer>
			<Row mainAlignment="flex-start" padding={{ right: 'small' }}>
				<Icon size="large" icon="Appointment" color={'success'} />
			</Row>

			<Row takeAvailableSpace mainAlignment="flex-start">
				<Tooltip placement="right" label={label}>
					<Text size="medium" overflow="break-word">
						{label}
					</Text>
				</Tooltip>
			</Row>
		</RowContainer>
	);
};
