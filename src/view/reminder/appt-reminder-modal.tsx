/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
/* eslint-disable import/extensions */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { FC, ReactElement } from 'react';
import { Container } from '@zextras/zapp-ui';
import { map } from 'lodash';
import { ApptReminderModalProps } from '../../types/appointment-reminder';
import ApptReminderCard from './reminder-card';
import ModalFooter from '../../commons/modal-footer';
// @ts-ignore
import { ModalHeader } from '../../commons/modal-header';

const ApptReminderModal: FC<ApptReminderModalProps> = ({
	events,
	t,
	dispatch,
	onConfirm,
	removeReminder,
	toggleModal,
	setActive
}): ReactElement => (
	<>
		<Container
			padding={{ all: 'small' }}
			mainAlignment="center"
			crossAlignment="flex-start"
			height="fit"
			width="100%"
		>
			<ModalHeader title={t(`label.appt_reminder`, { count: events.length || 1 })} />
			<Container maxHeight={320} style={{ overflow: 'auto', display: 'block' }}>
				{map(events, (appt) => (
					<ApptReminderCard
						dispatch={dispatch}
						event={appt}
						t={t}
						key={`reminder-${appt?.resource?.id}-${appt?.resource?.ridZ}`}
						removeReminder={removeReminder}
						toggleModal={toggleModal}
						setActive={setActive}
					/>
				))}
			</Container>
			<ModalFooter
				label={t('label.dismiss', {
					count: events.length || 1,
					defaultValue: 'Dismiss',
					defaultValue_Plural: 'Dismiss all'
				})}
				onConfirm={onConfirm}
			/>
		</Container>
	</>
);

export default ApptReminderModal;
