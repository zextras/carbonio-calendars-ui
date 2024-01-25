/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement, useCallback } from 'react';

import { Text, Container, Padding } from '@zextras/carbonio-design-system';
import { t } from '@zextras/carbonio-shell-ui';

import ModalFooter from '../../commons/modal-footer';
import { ModalHeader } from '../../commons/modal-header';
import { EventType } from '../../types/event';

type ModalProps = {
	event: EventType;
	onClose: () => void;
	onSeries: () => void;
	onInstance: () => void;
};

export const AppointmentTypeHandlingModal = ({
	event,
	onClose,
	onSeries,
	onInstance
}: ModalProps): ReactElement => {
	const onEntireSeries = useCallback((): void => {
		onSeries?.();
		onClose?.();
	}, [onClose, onSeries]);

	const onSingleInstance = useCallback((): void => {
		onInstance?.();
		onClose?.();
	}, [onClose, onInstance]);

	return (
		<Container
			padding={{ all: 'small' }}
			mainAlignment="center"
			crossAlignment="flex-start"
			height="fit"
		>
			<ModalHeader onClose={onClose} title={event.title} />
			<Padding all="small">
				<Text overflow="break-word">
					{t('message.appointment_type_handle', {
						name: event.title,
						defaultValue:
							'"{{name}}” is a recurring appointment. Would you like to open only this instance or the series?'
					})}
				</Text>
			</Padding>
			<ModalFooter
				onConfirm={onSingleInstance}
				label={t('label.single_instance', 'SINGLE INSTANCE')}
				secondaryAction={onEntireSeries}
				secondaryLabel={t('label.entire_serires', 'ENTIRE SERIES')}
				secondaryBtnType="outlined"
				secondaryColor="primary"
			/>
		</Container>
	);
};
