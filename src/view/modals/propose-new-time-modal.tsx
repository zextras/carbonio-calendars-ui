/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement, useCallback, useMemo, useState } from 'react';

import styled from '@emotion/styled';
import {
	Container,
	CreateModalFn,
	CloseModalFn,
	Text,
	Tooltip,
	useSnackbar
} from '@zextras/carbonio-design-system';
import { format, isSameDay } from 'date-fns';
import { useTranslation } from 'react-i18next';

import { getDateFnsLocale } from '../../commons/date-fns-react-widgets-localizer';
import ModalFooter from '../../commons/modal-footer';
import { ModalHeader } from '../../commons/modal-header';
import { StoreProvider } from '../../store/redux';
import { useAppDispatch, useAppSelector } from '../../store/redux/hooks';
import {
	selectEditor,
	selectEditorAllDay,
	selectEditorOriginalEnd,
	selectEditorOriginalStart,
	selectEditorTimezone,
	selectEditorTitle
} from '../../store/selectors/editor';
import { EditorDatePicker } from '../editor/parts/editor-date-picker';
import { onSend } from 'commons/editor-save-send-fns';

export const PROPOSE_NEW_TIME_MODAL_ID = 'propose-new-time';

type ProposeNewTimeModalProps = {
	editorId: string;
	onClose: () => void;
};

type ReadOnlyCardProps = {
	label: string;
	value: string;
};

const toTimezoneDate = (timestamp: number, timezone?: string): Date =>
	new Date(new Date(timestamp).toLocaleString('en-US', { timeZone: timezone }));

export const formatOriginalDateRange = ({
	start,
	end,
	allDay,
	timezone
}: {
	start: number;
	end: number;
	allDay?: boolean;
	timezone?: string;
}): string => {
	const locale = getDateFnsLocale();
	const startDate = toTimezoneDate(start, timezone);
	const endDate = toTimezoneDate(end, timezone);
	const sameDay = isSameDay(startDate, endDate);

	if (allDay) {
		return sameDay
			? format(startDate, 'P', { locale })
			: `${format(startDate, 'P', { locale })} - ${format(endDate, 'P', { locale })}`;
	}
	if (sameDay) {
		return `${format(startDate, 'P', { locale })}, ${format(startDate, 'p', { locale })} - ${format(endDate, 'p', { locale })}`;
	}
	return `${format(startDate, 'Pp', { locale })} - ${format(endDate, 'Pp', { locale })}`;
};

const ReadOnlyCardContainer = styled(Container)`
	border-radius: 0.25rem;
	min-width: 0;
`;

const ReadOnlyCard = ({ label, value }: ReadOnlyCardProps): ReactElement => (
	<ReadOnlyCardContainer
		background="infoBanner"
		mainAlignment="center"
		crossAlignment="stretch"
		height="fit"
		width="fill"
		gap="0.25rem"
		padding={{ top: 'small', bottom: 'small', left: 'large', right: 'small' }}
		data-testid="propose-new-time-read-only-card"
	>
		<Text size="small" color="gray1.active">
			{label}
		</Text>
		<Tooltip label={value} overflowTooltip>
			<Text overflow="ellipsis" weight="bold">
				{value}
			</Text>
		</Tooltip>
	</ReadOnlyCardContainer>
);

export const ProposeNewTimeModal = ({
	editorId,
	onClose
}: ProposeNewTimeModalProps): ReactElement => {
	const [t] = useTranslation();
	const dispatch = useAppDispatch();
	const createSnackbar = useSnackbar();
	const [isSending, setIsSending] = useState(false);

	const editor = useAppSelector(selectEditor(editorId));
	const title = useAppSelector(selectEditorTitle(editorId));
	const allDay = useAppSelector(selectEditorAllDay(editorId));
	const timezone = useAppSelector(selectEditorTimezone(editorId));
	const originalStart = useAppSelector(selectEditorOriginalStart(editorId));
	const originalEnd = useAppSelector(selectEditorOriginalEnd(editorId));

	const originalDateRange = useMemo(
		() =>
			formatOriginalDateRange({
				start: originalStart ?? 0,
				end: originalEnd ?? 0,
				allDay,
				timezone
			}),
		[allDay, originalEnd, originalStart, timezone]
	);

	const onSendProposal = useCallback(() => {
		if (!editor) {
			return;
		}
		setIsSending(true);
		onSend({ isNew: false, editor, dispatch })
			.then((result) => {
				const response = result?.response;
				createSnackbar({
					key: 'propose-new-time',
					replace: true,
					severity: response ? 'success' : 'warning',
					hideButton: true,
					label: response
						? t('message.new_time_proposal_sent', 'Your proposal has been sent to the organizer')
						: t('label.error_try_again', 'Something went wrong, please try again'),
					autoHideTimeout: 3000
				});
				if (response) {
					onClose();
				}
			})
			.finally(() => {
				setIsSending(false);
			});
	}, [createSnackbar, dispatch, editor, onClose, t]);

	return (
		<Container
			mainAlignment="flex-start"
			crossAlignment="flex-start"
			height="fit"
			gap="1rem"
			data-testid="propose-new-time-modal"
		>
			<Container mainAlignment="flex-start" crossAlignment="flex-start" height="fit">
				<ModalHeader title={t('label.propose_new_time', 'Propose new time')} onClose={onClose} />
			</Container>
			<Container mainAlignment="flex-start" crossAlignment="flex-start" height="fit" gap="1rem">
				<Container
					orientation="horizontal"
					mainAlignment="flex-start"
					crossAlignment="stretch"
					height="fit"
					gap="1rem"
				>
					<ReadOnlyCard label={t('label.event_title', 'Event title')} value={title ?? ''} />
					<ReadOnlyCard
						label={t('label.original_date_and_time', 'Original date and time')}
						value={originalDateRange}
					/>
				</Container>
				<Container mainAlignment="flex-start" crossAlignment="flex-start" height="fit">
					<Text weight="bold">{t('label.new_date_and_time', 'New date and time')}</Text>
					<Container
						orientation="horizontal"
						mainAlignment="flex-start"
						crossAlignment="flex-start"
						height="fit"
						padding={{ vertical: 'small' }}
					>
						<EditorDatePicker editorId={editorId} />
					</Container>
					<Text size="small" color="secondary" overflow="break-word">
						{t(
							'message.propose_new_time_recipient_hint',
							'Only the organizer of this appointment will receive your proposal.'
						)}
					</Text>
				</Container>
			</Container>
			<ModalFooter
				onConfirm={onSendProposal}
				label={t('label.send_proposal', 'Send proposal')}
				secondaryAction={onClose}
				secondaryLabel={t('label.cancel', 'Cancel')}
				secondaryBtnType="outlined"
				secondaryColor="secondary"
				color="primary"
				disabled={!editor}
				loading={isSending}
			/>
		</Container>
	);
};

export const openProposeNewTimeModal = ({
	editorId,
	createModal,
	closeModal
}: {
	editorId: string;
	createModal: CreateModalFn;
	closeModal: CloseModalFn;
}): void => {
	const modalId = `${PROPOSE_NEW_TIME_MODAL_ID}-${editorId}`;
	createModal(
		{
			id: modalId,
			size: 'medium',
			children: (
				<StoreProvider>
					<ProposeNewTimeModal editorId={editorId} onClose={(): void => closeModal(modalId)} />
				</StoreProvider>
			),
			onClose: () => {
				closeModal(modalId);
			}
		},
		true
	);
};
