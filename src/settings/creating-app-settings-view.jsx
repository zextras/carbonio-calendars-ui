/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useMemo } from 'react';
import { Container, Padding, Text, Row, Checkbox, Select } from '@zextras/carbonio-design-system';
import { DefaultCalendarOptions } from './components/utils';

export default function CreatingAppointmentSettings({ t, settingsObj, updateSettings }) {
	const defaultCalendarOptions = useMemo(() => DefaultCalendarOptions(t), [t]);
	return (
		<Container
			padding={{ all: 'medium' }}
			background="gray6"
			mainAlignment="baseline"
			crossAlignment="baseline"
		>
			<Row padding={{ all: 'small' }}>
				<Text size="large" weight="bold">
					{t('settings.label.default_calendar', 'Default calendar')}
				</Text>
			</Row>
			<Row
				padding={{ horizontal: 'small', bottom: 'small' }}
				mainAlignment="space-between"
				crossAlignment="baseline"
				orientation="horizontal"
				width="100%"
			>
				<Select
					items={defaultCalendarOptions}
					onChange={() => null}
					defaultSelection={{
						label: 'Calendar',
						value: 'calendar'
					}}
				/>
			</Row>

			<Row
				padding={{ horizontal: 'small', top: 'small' }}
				orientation="vertical"
				mainAlignment="baseline"
				crossAlignment="baseline"
			>
				<Text size="large" weight="bold">
					{t('label.time_zones', 'Time zones')}
				</Text>
				<Padding top="small" />
				<Checkbox
					value={settingsObj.zimbraPrefUseTimeZoneListInCalendar === 'TRUE'}
					label={t(
						'settings.label.show_timezones',
						'Show time zone while creating new appointment'
					)}
					onClick={() =>
						updateSettings({
							target: {
								name: 'zimbraPrefUseTimeZoneListInCalendar',
								value: settingsObj.zimbraPrefUseTimeZoneListInCalendar === 'TRUE' ? 'FALSE' : 'TRUE'
							}
						})
					}
				/>
			</Row>
		</Container>
	);
}
