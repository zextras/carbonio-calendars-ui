/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useMemo } from 'react';
import {
	Container,
	Text,
	CustomModal,
	Divider,
	Row,
	Checkbox
} from '@zextras/carbonio-design-system';
import { map } from 'lodash';
import TimePicker from './components/time-picker';
import { getWeekDay } from './components/utils';
import { ModalHeader } from '../commons/modal-header';
import ModalFooter from '../commons/modal-footer';

export default function CustomScheduleModal({
	open,
	toggleModal,
	t,
	workingSchedule,
	onFromChange,
	saveChanges,
	handelDaysClicked,
	disabled
}) {
	const title = useMemo(
		() => t('calendar.modal.custom_schedule.title', 'Customize working hours'),
		[t]
	);

	return (
		<CustomModal size="small" title="Title_bold_dark" open={open} onClose={toggleModal}>
			<Container
				padding={{ all: 'large' }}
				mainAlignment="center"
				crossAlignment="flex-start"
				height="fit"
			>
				<ModalHeader title={title} onClose={toggleModal} />
				<Container mainAlignment="baseline" crossAlignment="baseline">
					<Row padding={{ all: 'small' }}>
						<Text size="large" weight="bold">
							{t('label.work_hour', 'Work hour')}
						</Text>
					</Row>
					{map(workingSchedule, (s, index) => (
						<Row key={`week_day_${index}`} orientation="horizontal" mainAlignment="baseline">
							<Row width="35%" mainAlignment="baseline" crossAlignment="flex-start">
								<Checkbox
									value={s.working}
									onClick={handelDaysClicked(s.day)}
									label={getWeekDay(`${Number(s.day) - 1}`, t)}
								/>
							</Row>
							<Row width="65%" mainAlignment="baseline" crossAlignment="flex-start">
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
				<Divider />
				<ModalFooter
					onConfirm={saveChanges}
					onClose={toggleModal}
					label={t('label.edit', 'Edit')}
					disabled={disabled}
				/>
			</Container>
		</CustomModal>
	);
}
