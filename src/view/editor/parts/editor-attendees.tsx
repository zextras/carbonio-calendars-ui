/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement, useCallback, useEffect, useState } from 'react';

import styled from '@emotion/styled';
import { Button, Container, Row, useSnackbar } from '@zextras/carbonio-design-system';
import { getOrderedAccountIds, ContactInputItem } from '@zextras/carbonio-ui-commons';
import { find } from 'lodash';
import { useTranslation } from 'react-i18next';

import { AttendeesContactInput } from './attendees-contact-input';
import {
	EditorAvailabilityWarningRow,
	getIsBusyAtTimeOfTheEvent
} from './editor-availability-warning-row';
import { EditorOptionalAttendees } from './editor-optional-attendees';
import { useAttendeesAvailability } from '../../../hooks/use-attendees-availability';
import { useAppDispatch, useAppSelector } from '../../../store/redux/hooks';
import {
	selectEditorAllDay,
	selectEditorAttendees,
	selectEditorDisabled,
	selectEditorEnd,
	selectEditorOptionalAttendees,
	selectEditorStart,
	selectEditorUid,
	selectSender
} from '../../../store/selectors/editor';
import { editEditorAttendees } from '../../../store/slices/editor-slice';
import { EditorChipAttendees } from '../../../types/store/invite';

type EditorAttendeesProps = {
	editorId: string;
};

export const AttendeesContainer = styled.div<{ $hasTooltip?: boolean }>`
	width: calc(100% - ${({ $hasTooltip }): string => ($hasTooltip ? `3rem` : '0rem')});
	height: fit-content;
	background: ${({ theme }): string => theme.palette.gray5.regular};
	border-bottom: 0.0625rem solid ${({ theme }): string => theme.palette.gray2.regular};
	[class^='Chip__ChipComp'] {
		[class^='Text__Comp'] {
			color: ${({ theme }): string => theme.palette.text.regular};
		}
	}
`;

export const EditorAttendees = ({ editorId }: EditorAttendeesProps): ReactElement => {
	const [t] = useTranslation();
	const dispatch = useAppDispatch();
	const attendees = useAppSelector(selectEditorAttendees(editorId));
	const optionalAttendees = useAppSelector(selectEditorOptionalAttendees(editorId));
	const uid = useAppSelector(selectEditorUid(editorId));
	const disabled = useAppSelector(selectEditorDisabled(editorId));
	const start = useAppSelector(selectEditorStart(editorId));
	const end = useAppSelector(selectEditorEnd(editorId));
	const allDay = useAppSelector(selectEditorAllDay(editorId));
	const sender = useAppSelector(selectSender(editorId));
	const createSnackbar = useSnackbar();

	const [showOptionals, setShowOptional] = useState(!!optionalAttendees?.length);
	const [orderedAccountIds, setOrderedAccountIds] = useState<Array<string>>([]);
	const toggleOptionals = useCallback(() => setShowOptional((show) => !show), []);

	const attendeesAvailabilityList = useAttendeesAvailability(start, attendees, uid);

	useEffect(() => {
		getOrderedAccountIds(sender ? sender.email : '')
			.then((ids) => {
				setOrderedAccountIds(ids);
			})
			.catch(() => {
				createSnackbar({
					key: `ordered-account-ids`,
					replace: true,
					severity: 'error',
					label: t('label.error_try_again', 'Something went wrong, please try again'),
					autoHideTimeout: 3000,
					hideButton: true
				});
			});
	}, [createSnackbar, sender, t]);

	const onChangeAttendeeContact = useCallback<
		(updatedAttendees: Array<EditorChipAttendees>) => void
	>(
		(updatedAttendees) => {
			dispatch(
				editEditorAttendees({
					id: editorId,
					attendees: updatedAttendees
				})
			);
		},
		[dispatch, editorId]
	);
	const customDisplayAttendeeInput = useCallback(
		(attendeeChip: ContactInputItem): ContactInputItem => {
			const transformedChip = attendeeChip;
			const currentChipAvailability = find(attendeesAvailabilityList, [
				'email',
				attendeeChip.value.email
			]);
			if (currentChipAvailability) {
				const isBusyAtTimeOfEvent = getIsBusyAtTimeOfTheEvent(
					currentChipAvailability,
					start,
					end,
					attendeesAvailabilityList,
					allDay
				);
				transformedChip.actions =
					isBusyAtTimeOfEvent && !find(attendeeChip.actions, ['id', 'unavailable'])
						? [
								...(attendeeChip.actions ?? []),
								{
									id: 'unavailable',
									label: t(
										'attendee_unavailable',
										'Attendee not available at the selected time of the event'
									),
									color: 'error',
									type: 'icon',
									icon: 'AlertTriangle'
								} as const
							]
						: attendeeChip.actions;
			}
			return transformedChip;
		},
		[allDay, attendeesAvailabilityList, end, start, t]
	);

	return (
		<>
			<AttendeesContainer>
				<Container
					orientation="horizontal"
					background={'gray5'}
					style={{ overflow: 'hidden' }}
					padding={{ all: 0 }}
				>
					<Container background={'gray5'} style={{ overflow: 'hidden' }}>
						<AttendeesContactInput
							data-testid={'attendees-chip-input'}
							placeholder={t('label.attendees', 'Attendees')}
							attendees={attendees}
							onChange={onChangeAttendeeContact}
							disabled={disabled?.attendees ?? false}
							orderedAccountIds={orderedAccountIds}
							customDisplayAttendeeChip={customDisplayAttendeeInput}
						/>
					</Container>
					<Container
						width="fit"
						background={'gray5'}
						padding={{ right: 'medium', left: 'extrasmall' }}
						orientation="horizontal"
					>
						<Button
							label={t('label.optionals', 'Optionals')}
							type="ghost"
							color="secondary"
							style={{ padding: 0 }}
							onClick={toggleOptionals}
						/>
					</Container>
				</Container>
			</AttendeesContainer>
			<EditorAvailabilityWarningRow
				label={t(
					'attendees_unavailable',
					'One or more attendees are not available at the selected time of the event'
				)}
				list={attendeesAvailabilityList}
				items={attendees}
				editorId={editorId}
			/>
			{showOptionals && (
				<Row height="fit" width="fill" padding={{ top: 'large' }}>
					<AttendeesContainer>
						<EditorOptionalAttendees editorId={editorId} orderedAccountIds={orderedAccountIds} />
					</AttendeesContainer>
				</Row>
			)}
		</>
	);
};
