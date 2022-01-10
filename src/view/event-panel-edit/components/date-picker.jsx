/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useMemo } from 'react';
import momentLocalizer from 'react-widgets-moment';
import { Container, Padding, Select } from '@zextras/zapp-ui';
import Styler from './date-picker-style';
import AllDayCheckbox from './all-day-checkbox';
import EndDatePicker from './end-date-picker';
import StartDatePicker from './start-date-picker';
import { findLabel, TimeZonesOptions } from '../../../settings/components/utils';

momentLocalizer();

export default function DatePicker({
	start,
	startTimeZone,
	end,
	allDay,
	onChange,
	onAllDayChange,
	settings,
	onTimeZoneChange,
	invite,
	t
}) {
	const timeZonesOptions = useMemo(() => TimeZonesOptions(t), [t]);
	return (
		<>
			<Styler allDay={allDay} orientation="horizontal" height="fit" mainAlignment="flex-start">
				<StartDatePicker start={start} end={end} onChange={onChange} allDay={allDay} />
				<Padding left="small" />
				<EndDatePicker start={start} end={end} onChange={onChange} allDay={allDay} />
			</Styler>
			<Container padding={{ top: 'large' }}>
				{settings.prefs.zimbraPrefUseTimeZoneListInCalendar === 'TRUE' && (
					<>
						<Padding top="small" />
						<Select
							items={timeZonesOptions}
							onChange={onTimeZoneChange}
							defaultSelection={
								invite?.start.tz
									? {
											label: findLabel(timeZonesOptions, invite?.start.tz),
											value: invite?.start.tz
									  }
									: {
											label: findLabel(
												timeZonesOptions,
												startTimeZone || settings.prefs.zimbraPrefTimeZoneId
											),
											value: startTimeZone || settings.prefs.zimbraPrefTimeZoneId
									  }
							}
						/>
					</>
				)}
			</Container>
			<AllDayCheckbox
				allDay={allDay}
				end={end}
				onAllDayChange={onAllDayChange}
				onChange={onChange}
				start={start}
			/>
		</>
	);
}
