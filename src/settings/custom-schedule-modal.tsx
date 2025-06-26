/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback, useMemo } from 'react';

import { Container, Text, CustomModal, Row, Checkbox } from '@zextras/carbonio-design-system';
import { t } from '@zextras/carbonio-shell-ui';
import { map } from 'lodash';

import { WorkWeekDay } from '../utils/work-week';
import TimePicker from './components/time-picker';
import { getWeekDay } from './components/utils';
import ModalFooter from '../commons/modal-footer';
import { ModalHeader } from '../commons/modal-header';

export default function CustomScheduleModal({
	open,
	toggleModal,
	workingSchedule,
	setWorkingSchedule,
	saveChanges,
	handelDaysClicked,
	disabled
}: {
	open: boolean;
	toggleModal: () => void;
	setWorkingSchedule: React.Dispatch<React.SetStateAction<WorkWeekDay[]>>;
	saveChanges: () => void;
	handelDaysClicked: (arg: WorkWeekDay['day']) => () => void;
	disabled: boolean;
	workingSchedule: Array<WorkWeekDay>;
}): React.JSX.Element {
	const title = useMemo(
		() => t('calendar.modal.custom_schedule.title', 'Customize working hours'),
		[]
	);

	const onFromChange = useCallback(
		(data: { start: string; hour: string; minute: string; day: string }): void => {
			data.start
				? setWorkingSchedule(
						workingSchedule.map((schedule) =>
							schedule.day === data.day
								? {
										...schedule,
										end: `${data.hour}${data.minute}`
									}
								: schedule
						)
					)
				: setWorkingSchedule(
						workingSchedule.map((schedule) =>
							schedule.day === data.day
								? {
										...schedule,
										start: `${data.hour}${data.minute}`
									}
								: schedule
						)
					);
		},
		[setWorkingSchedule, workingSchedule]
	);

	return (
		<CustomModal maxHeight="90vh" size="medium" open={open} onClose={toggleModal}>
			<Container
				padding={{ all: 'large' }}
				mainAlignment="center"
				crossAlignment="flex-start"
				height="fit"
			>
				<ModalHeader title={title} onClose={toggleModal} />
				<Container mainAlignment="flex-start" crossAlignment="baseline">
					<Row padding={{ all: 'small' }}>
						<Text size="large" weight="bold">
							{t('label.work_hour', 'Work hour')}
						</Text>
					</Row>
					<Container
						orientation="vertical"
						mainAlignment="flex-start"
						crossAlignment="baseline"
						maxHeight="60vh"
						style={{ overflowY: 'auto' }}
					>
						{map(workingSchedule, (s, index) => (
							<Row
								width="95%"
								key={`week_day_${index}`}
								orientation="horizontal"
								mainAlignment="flex-start"
							>
								<Row width="35%" mainAlignment="flex-start" crossAlignment="flex-start">
									<Checkbox
										value={s.working}
										onClick={handelDaysClicked(s.day)}
										label={getWeekDay(`${Number(s.day) - 1}`)}
									/>
								</Row>
								<Row width="65%" mainAlignment="flex-start" crossAlignment="flex-start">
									<TimePicker
										start={s.start}
										disabled={!s.working}
										end={s.end}
										onChange={onFromChange}
										day={s.day}
									/>
								</Row>
							</Row>
						))}
					</Container>
				</Container>
				<ModalFooter onConfirm={saveChanges} label={t('label.edit', 'Edit')} disabled={disabled} />
			</Container>
		</CustomModal>
	);
}
