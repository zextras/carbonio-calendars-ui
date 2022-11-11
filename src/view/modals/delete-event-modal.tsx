/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { filter, size } from 'lodash';
import React, { ReactElement, useCallback, useMemo, useState } from 'react';
import { Checkbox, Container, Padding, Text } from '@zextras/carbonio-design-system';
import { Spinner, replaceHistory, t, useFolders } from '@zextras/carbonio-shell-ui';
import { useDispatch } from 'react-redux';
import styled from 'styled-components';
import ModalFooter from '../../commons/modal-footer';
import { EventType } from '../../types/event';
import { Invite } from '../../types/store/invite';
import { ModalHeader } from '../../commons/modal-header';
import { ModifyStandardMessageModal } from './modify-standard-message-modal';
import { useDeleteActions, UseDeleteActionsType } from '../../hooks/use-delete-actions';

const ItalicText = styled(Text)`
	font-style: italic;
`;

type DeleteEventModalProps = {
	event: EventType;
	invite: Invite;
	context: any;
	onClose: () => void;
};

type DeleteEventModalContentProps = {
	actions: UseDeleteActionsType;
	title: string;
	isSingleInstance: boolean;
	isException: boolean;
	isInstanceOfSeries: boolean;
	invite: Invite;
	event: EventType;
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
	event,
	onConfirm,
	onClose,
	isSeries
}: DeleteEventModalContentProps): ReactElement => {
	const { name } = invite;
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
				{isSeries && !isException && event.resource.iAmOrganizer && (
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
				{!event.resource.iAmOrganizer && (
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
	context,
	onClose
}: DeleteEventModalProps): ReactElement => {
	const { isOrganizer, isException, participants } = invite;
	const participantsSize = useMemo(() => size(participants), [participants]);
	const dispatch = useDispatch();
	const folders = useFolders();
	const calendarFolders = useMemo(() => filter(folders, ['view', 'appointment']), [folders]);
	const isInstance = context?.isInstance;
	const isRecurrent = !!invite.recurrenceRule;
	const isSeries = isRecurrent && !isInstance;
	const isSingleInstance = isInstance && !isRecurrent;
	const isInstanceOfSeries = isRecurrent && isInstance;

	const [isAskingConfirmation, setIsAskingConfirmation] = useState<boolean>(
		() => participantsSize > 0 && (isException || isInstance)
	);

	const toggleAskConfirmation = useCallback(() => {
		setIsAskingConfirmation((a) => !a);
	}, []);

	const actions = useDeleteActions(event, invite, {
		isInstance,
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
			if (isOrganizer && participantsSize > 0 && !isAskingConfirmation) {
				return toggleAskConfirmation;
			}
			return actions?.deleteRecurrentSerie;
		}
		return actions?.deleteNonRecurrentEvent;
	}, [
		isException,
		isSingleInstance,
		isInstanceOfSeries,
		isSeries,
		actions?.deleteNonRecurrentEvent,
		actions?.deleteRecurrentInstance,
		actions?.deleteRecurrentSerie,
		isOrganizer,
		participantsSize,
		isAskingConfirmation,
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
					event={event}
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
