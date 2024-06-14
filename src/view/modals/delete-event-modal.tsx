/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement, useCallback, useMemo, useState } from 'react';

import { Checkbox, Container, Padding, Text } from '@zextras/carbonio-design-system';
import { Spinner, replaceHistory, t } from '@zextras/carbonio-shell-ui';
import { size } from 'lodash';
import styled from 'styled-components';

import { ModifyStandardMessageModal } from './modify-standard-message-modal';
import { useFoldersMap } from '../../carbonio-ui-commons/store/zustand/folder';
import ModalFooter from '../../commons/modal-footer';
import { ModalHeader } from '../../commons/modal-header';
import { useDeleteActions, UseDeleteActionsType } from '../../hooks/use-delete-actions';
import { useAppDispatch } from '../../store/redux/hooks';
import { EventType } from '../../types/event';
import { Invite } from '../../types/store/invite';

const ItalicText = styled(Text)`
	font-style: italic;
`;

type DeleteEventModalProps = {
	event: EventType;
	invite: Invite;
	onClose: () => void;
};

type DeleteEventModalContentProps = {
	actions: UseDeleteActionsType;
	title: string;
	isSingleInstance: boolean;
	isException: boolean;
	isInstanceOfSeries: boolean;
	invite: Invite;
	onConfirm: () => void;
	onClose: () => void;
	isSeries: boolean;
};

const DeleteEventModalContent = ({
	actions,
	title,
	isSingleInstance,
	isException,
	isInstanceOfSeries,
	invite,
	onConfirm,
	onClose,
	isSeries
}: DeleteEventModalContentProps): ReactElement => {
	const { name, isOrganizer } = invite;
	const displayMessage = useMemo(() => {
		if (isSingleInstance || isException) {
			return t(
				'message.sure_to_delete_appointment',
				'Are you sure you want to delete the appointment ?'
			);
		}
		if (isInstanceOfSeries) {
			return t('message.you_sure_delete_instance', {
				title: name,
				defaultValue: `Are you sure you want to delete this instance of “{{title}}” appointment?`
			});
		}
		// series
		return t(
			'message.sure_to_delete_all_occurences_appointment',
			'Are you sure you want to delete all occurrences of this appointment?'
		);
	}, [isSingleInstance, isException, isInstanceOfSeries, name]);
	return (
		<Container mainAlignment="center" crossAlignment="flex-start" height="fit">
			<ModalHeader title={title} onClose={onClose} />
			<Container
				padding={{ vertical: 'medium' }}
				mainAlignment="baseline"
				crossAlignment="baseline"
			>
				<Text overflow="break-word">{displayMessage}</Text>
				{isSeries && !isException && isOrganizer && (
					<>
						<Padding top="small" />
						<Checkbox
							value={actions?.deleteAll}
							onClick={actions?.toggleDeleteAll}
							label={t('message.delete_all_occurences', 'Delete all occurrences')}
						/>
						<Checkbox
							value={!actions?.deleteAll}
							onClick={actions?.toggleDeleteAll}
							label={t(
								'message.delete_future_occurences',
								'Delete this instance and all future occurrences'
							)}
						/>
						<Padding horizontal="extralarge">
							<Padding horizontal="small">
								<ItalicText overflow="break-word">
									{t(
										'message.delete_future_occurences_warning',
										'This will also delete all exceptions (before and after this instance) in the series'
									)}
								</ItalicText>
							</Padding>
						</Padding>
					</>
				)}
				{!isOrganizer && (
					<>
						<Padding top="small" />
						<Checkbox
							value={actions?.notifyOrganizer}
							onClick={actions?.toggleNotifyOrganizer}
							label={t('label.notify_organizer', 'Notify organizer')}
						/>
					</>
				)}
			</Container>
			<ModalFooter
				onConfirm={onConfirm}
				label={t('label.delete', 'Delete')}
				disabled={!invite}
				color="error"
			/>
		</Container>
	);
};

export const DeleteEventModal = ({
	event,
	invite,
	onClose
}: DeleteEventModalProps): ReactElement => {
	const { isOrganizer, isException, participants } = invite;
	const participantsSize = useMemo(() => size(participants), [participants]);
	const dispatch = useAppDispatch();
	const calendarFolders = useFoldersMap();
	const isInstance = !!event.resource.ridZ;
	const isRecurrent = !!invite.recurrenceRule;
	const isSeries = isRecurrent && !isInstance;
	const isSingleInstance = isInstance && !isRecurrent;
	const isInstanceOfSeries = isRecurrent && isInstance;

	const [isAskingConfirmation, setIsAskingConfirmation] = useState<boolean>(
		() =>
			participantsSize > 0 &&
			(isException || isInstance) &&
			isOrganizer &&
			!event.resource.inviteNeverSent
	);

	const toggleAskConfirmation = useCallback(() => {
		setIsAskingConfirmation((a) => !a);
	}, []);

	const actions = useDeleteActions(event, invite, {
		isSingleInstance: isException || isInstanceOfSeries || false,
		replaceHistory,
		onClose,
		dispatch,
		folders: calendarFolders
	});

	const onConfirm = useMemo(() => {
		if (isException || isInstanceOfSeries) {
			return actions?.deleteRecurrentInstance;
		}
		if (isSingleInstance) {
			return actions?.deleteNonRecurrentEvent;
		}
		if (isSeries) {
			if (
				isOrganizer &&
				participantsSize > 0 &&
				!isAskingConfirmation &&
				!event.resource.inviteNeverSent
			) {
				return toggleAskConfirmation;
			}
			return actions?.deleteRecurrentSerie;
		}
		return actions?.deleteNonRecurrentEvent;
	}, [
		isException,
		isInstanceOfSeries,
		isSingleInstance,
		isSeries,
		actions?.deleteNonRecurrentEvent,
		actions?.deleteRecurrentInstance,
		actions?.deleteRecurrentSerie,
		isOrganizer,
		participantsSize,
		isAskingConfirmation,
		event.resource.inviteNeverSent,
		toggleAskConfirmation
	]);

	const title = useMemo(() => `${t('label.delete', 'Delete')} ${event.title}`, [event.title]);
	return invite ? (
		<Container
			mainAlignment="center"
			crossAlignment="flex-start"
			height="fit"
			padding={{ top: 'small', right: 'small', bottom: 'extralarge', left: 'small' }}
		>
			{isAskingConfirmation ? (
				<ModifyStandardMessageModal
					title={title}
					onClose={onClose}
					confirmLabel={t('action.send_cancellation', 'Send Cancellation')}
					onConfirm={onConfirm}
					invite={invite}
				/>
			) : (
				<DeleteEventModalContent
					actions={actions}
					title={title}
					isSingleInstance={isSingleInstance}
					isException={isException}
					isInstanceOfSeries={isInstanceOfSeries}
					invite={invite}
					onConfirm={onConfirm}
					onClose={onClose}
					isSeries={isSeries}
				/>
			)}
		</Container>
	) : (
		<Spinner />
	);
};
