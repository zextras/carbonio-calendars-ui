/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useMemo, useState } from 'react';

import {
	Container,
	Icon,
	Input,
	Padding,
	Row,
	Select,
	SelectProps,
	SelectItem,
	Text
} from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';

import ModalFooter from '../../commons/modal-footer';
import { ModalHeader } from 'commons/modal-header';
import { ColorContainer, Square, TextUpperCase } from 'commons/styled-components';
import { CALENDARS_STANDARD_COLORS } from 'constants/calendar';

const LabelFactory: SelectProps['LabelFactory'] = ({ selected, label, open, focus }) => (
	<ColorContainer
		orientation="horizontal"
		width="fill"
		crossAlignment="center"
		mainAlignment="space-between"
		borderRadius="half"
		background={'gray5'}
		padding={{ all: 'small' }}
	>
		<Row width="100%" takeAvailableSpace mainAlignment="space-between">
			<Row
				orientation="vertical"
				crossAlignment="flex-start"
				mainAlignment="flex-start"
				padding={{ left: 'small' }}
			>
				<Text size="small" color={open || focus ? 'primary' : 'secondary'}>
					{label}
				</Text>
				<TextUpperCase>{selected?.[0]?.label}</TextUpperCase>
			</Row>
			<Padding right="small">
				<Square $color={CALENDARS_STANDARD_COLORS[Number(selected?.[0]?.value ?? 0)].color} />
			</Padding>
		</Row>
		<Icon
			size="large"
			icon={open ? 'ChevronUpOutline' : 'ChevronDownOutline'}
			color={open || focus ? 'primary' : 'secondary'}
			style={{ alignSelf: 'center' }}
		/>
	</ColorContainer>
);

export const AddIcsFromUrlModal = ({ onClose }: { onClose: () => void }): JSX.Element => {
	const [t] = useTranslation();
	const [icsUrl, setIcsUrl] = useState('');
	const [calendarName, setCalendarName] = useState('');
	const [selectedColor, setSelectedColor] = useState('0');

	const colorItems = useMemo<Array<SelectItem>>(
		() =>
			CALENDARS_STANDARD_COLORS.map((color, index) => ({
				label: t(`colors.${color.label}`),
				value: index.toString(),
				customComponent: (
					<Container
						width="100%"
						mainAlignment="space-between"
						orientation="horizontal"
						height="fit"
					>
						<Padding left="small">
							<TextUpperCase>{t(`colors.${color.label}`)}</TextUpperCase>
						</Padding>
						<Padding right="small">
							<Square $color={color.color} />
						</Padding>
					</Container>
				)
			})),
		[t]
	);

	const onConfirm = (): void => onClose();

	return (
		<Container
			data-testid={'add-ics-from-url-modal'}
			padding={{ all: 'small' }}
			mainAlignment="center"
			crossAlignment="flex-start"
			height="fit"
		>
			<ModalHeader onClose={onClose} title={t('action.add_ics_from_url', 'Add ICS from URL')} />
			<Text size="small" color="secondary">
				{t(
					'add_ics_from_url.description',
					'Paste the ICS URL of the calendar you would like to add.'
				)}
			</Text>
			<Padding top="small" />
			<Input
				label={t('add_ics_from_url.ics_url', 'Calendar ICS URL*')}
				backgroundColor="gray5"
				value={icsUrl}
				onChange={(event): void => setIcsUrl(event.target.value)}
			/>
			<Padding top="extrasmall" />
			<Text size="small" color="secondary">
				{t(
					'add_ics_from_url.sync_info',
					'This calendar will be read-only and will sync automatically every 12 hours'
				)}
			</Text>
			<Padding top="medium" />
			<Input
				label={t('add_ics_from_url.calendar_name', 'Calendar name*')}
				backgroundColor="gray5"
				value={calendarName}
				onChange={(event): void => setCalendarName(event.target.value)}
			/>
			<Padding top="medium" />
			<Select
				label={t('label.select_color', 'Select color')}
				items={colorItems}
				defaultSelection={colorItems[0]}
				LabelFactory={LabelFactory}
				onChange={(value): void => {
					if (value) {
						setSelectedColor(value);
					}
				}}
			/>
			<Padding top="medium" />
			<ModalFooter
				onConfirm={onConfirm}
				secondaryAction={onClose}
				label={t('label.add', 'Add')}
				secondaryLabel={t('label.cancel', 'Cancel')}
				disabled={!icsUrl.trim() || !calendarName.trim() || selectedColor === ''}
			/>
		</Container>
	);
};
