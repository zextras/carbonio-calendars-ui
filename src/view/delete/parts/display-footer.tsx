/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useIntegratedFunction } from '@zextras/zapp-shell';
import { map, reduce, size } from 'lodash';
import React, { ReactElement, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import ModalFooter from '../../../commons/modal-footer';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const DisplayFooter = ({
	actions,
	event,
	invite,
	isInstance,
	toggleAskConfirmation,
	onClose,
	isAskingConfirmation
}: any): ReactElement => {
	const [t] = useTranslation();
	const participantsSize = useMemo(() => size(invite?.participants), [invite]);
	const { isRecurrent, iAmOrganizer, isException } = event.resource;
	const [openComposer, available] = useIntegratedFunction('compose');

	const isSecondaryActive = useMemo(
		() =>
			invite &&
			(isAskingConfirmation ||
				(isRecurrent && isInstance && iAmOrganizer && participantsSize > 0) ||
				(!isRecurrent && isInstance && iAmOrganizer && participantsSize > 0)),
		[iAmOrganizer, invite, isAskingConfirmation, isInstance, isRecurrent, participantsSize]
	);

	const secondaryColor = useMemo(
		() => (isSecondaryActive ? 'primary' : undefined),
		[isSecondaryActive]
	);

	const secondaryBtnType = useMemo(
		() => (isSecondaryActive ? 'outlined' : undefined),
		[isSecondaryActive]
	);

	const secondaryLabel = useMemo(
		() => (isSecondaryActive ? t('action.edit_message', 'Edit Message') : undefined),
		[isSecondaryActive, t]
	);

	const label = useMemo(
		() =>
			isSecondaryActive
				? t('action.send_cancellation', 'Send Cancellation')
				: t('label.delete', 'Delete'),
		[isSecondaryActive, t]
	);

	const onConfirm = useMemo(() => {
		if (isException) {
			return actions?.deleteRecurrentInstance;
		}
		// single instance
		if (isInstance && !isRecurrent) {
			if (iAmOrganizer && !isAskingConfirmation) {
				return actions?.deleteNonRecurrentEvent;
			}
			return actions?.deleteNonRecurrentEvent;
		}
		// instance of a series
		if (isRecurrent && isInstance) {
			return actions?.deleteRecurrentInstance;
		}
		// series
		if (isRecurrent && !isInstance) {
			if (iAmOrganizer && !isAskingConfirmation) {
				return participantsSize > 0 ? toggleAskConfirmation : actions?.deleteRecurrentSerie;
			}
			return actions?.deleteRecurrentSerie;
		}
		return actions?.deleteNonRecurrentEvent;
	}, [
		actions?.deleteNonRecurrentEvent,
		actions?.deleteRecurrentInstance,
		actions?.deleteRecurrentSerie,
		iAmOrganizer,
		isAskingConfirmation,
		isException,
		isInstance,
		isRecurrent,
		participantsSize,
		toggleAskConfirmation
	]);

	const onEditMessage = useCallback(() => {
		onClose();
		if (available)
			openComposer(onConfirm, {
				text: [
					'text',
					`${t('message.meeting_canceled', 'The following meeting has been cancelled')}:`
				],
				subject: `${t('label.cancelled', 'Cancelled')} ${event.title}`,
				to: reduce(
					invite?.participants ?? [],
					(acc, v) => {
						map(v, (contact: never) => acc.push(contact));
						return acc;
					},
					[]
				)
			});
	}, [onClose, available, openComposer, onConfirm, t, event.title, invite?.participants]);

	return (
		<ModalFooter
			onConfirm={onConfirm}
			label={label}
			secondaryColor={secondaryColor}
			secondaryBtnType={secondaryBtnType}
			secondaryLabel={secondaryLabel}
			secondaryAction={isSecondaryActive && onEditMessage}
			secondaryDisabled={!isSecondaryActive}
			disabled={!invite}
			color="error"
		/>
	);
};
