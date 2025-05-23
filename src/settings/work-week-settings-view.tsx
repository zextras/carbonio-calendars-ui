/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useMemo } from 'react';

import {
	Text,
	Button,
	Row,
	Checkbox,
	FormSubSection,
	FormSection,
	Container
} from '@zextras/carbonio-design-system';
import { t } from '@zextras/carbonio-shell-ui';
import { map } from 'lodash';

import { WorkWeekDay } from '../utils/work-week';
import TimePicker from './components/time-picker';
import { getWeekDay } from './components/utils';
import { workWeekSubSection } from './sub-sections';

export default function WorkWeekSettings({
	workingSchedule,
	isRegular,
	handelDaysClicked,
	setIsRegular,
	calculateRegularSchedule,
	toggleModal
}: {
	workingSchedule: Array<WorkWeekDay>;
	isRegular: boolean;
	handelDaysClicked: (arg: string) => () => void;
	setIsRegular: (arg: boolean) => void;
	calculateRegularSchedule: (arg: {
		start: string;
		hour: string;
		minute: string;
		day: string;
	}) => void;
	toggleModal: () => void;
}): React.JSX.Element {
	const sectionTitleWorkWeek = useMemo(() => workWeekSubSection(), []);

	return (
		<FormSection id={sectionTitleWorkWeek.id} label={sectionTitleWorkWeek.label}>
			<FormSubSection>
				<Container gap={'0.5rem'} mainAlignment={'flex-start'} crossAlignment={'flex-start'}>
					{map(workingSchedule, (s, index) => (
						<Row key={`week_day_${index}`}>
							<Checkbox
								value={s.working}
								onClick={handelDaysClicked(s.day)}
								label={getWeekDay(`${Number(s.day) - 1}`)}
							/>
						</Row>
					))}
				</Container>
			</FormSubSection>
			<FormSubSection label={t('label.work_hour', 'Work hour')}>
				<Checkbox
					value={isRegular}
					onClick={(): void => setIsRegular(!isRegular)}
					label={t('label.regular', 'Regular')}
				/>
				<TimePicker
					start={workingSchedule[1]?.start}
					disabled={!isRegular}
					end={workingSchedule[1]?.end}
					onChange={calculateRegularSchedule}
					day="1"
				/>
				<Checkbox
					value={!isRegular}
					onClick={(): void => setIsRegular(!isRegular)}
					label={t('label.custom', 'Custom')}
				/>
				<Button
					width="fill"
					type="outlined"
					label={t('button.customize_modal', 'Open Customize Modal')}
					color="primary"
					disabled={isRegular}
					onClick={toggleModal}
				/>
				<Row orientation="vertical" mainAlignment="flex-start" crossAlignment="flex-start">
					<Text>
						{t('label.timezone_pref_msg', 'The timings follow your timezone preferences.')}
					</Text>
					<Text>
						<i>
							{t(
								'label.your_pref_timezone_msg',
								'Your preferred timezone is: GMT +01:00 Amsterdam, Berlin, Bern, Rome, Stockholm,Vienna.'
							)}
						</i>
					</Text>
				</Row>
			</FormSubSection>
		</FormSection>
	);
}
