/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement, useCallback, useEffect, useMemo, useState } from 'react';

import { Button, ChipInput, Container, Row, useSnackbar } from '@zextras/carbonio-design-system';
import { useIntegratedComponent } from '@zextras/carbonio-shell-ui';
import { find, map, reject, some } from 'lodash';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import {
	EditorAvailabilityWarningRow,
	getIsBusyAtTimeOfTheEvent
} from './editor-availability-warning-row';
import { getOrderedAccountIds } from '../../../carbonio-ui-commons/helpers/identities';
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
import {
	editEditorAttendees,
	editEditorOptionalAttendees
} from '../../../store/slices/editor-slice';

type EditorAttendeesProps = {
	editorId: string;
};

export const AttendeesContainer = styled.div`
	width: calc(
		100% - ${({ hasTooltip }: { hasTooltip?: boolean }): string => (hasTooltip ? `3rem` : '0rem')}
	);
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
	const [ContactInput, integrationAvailable] = useIntegratedComponent('contact-input');
	const dispatch = useAppDispatch();
	const attendees = useAppSelector(selectEditorAttendees(editorId));
	const uid = useAppSelector(selectEditorUid(editorId));
	const optionalAttendees = useAppSelector(selectEditorOptionalAttendees(editorId));
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

	const hasError = useMemo(() => some(attendees ?? [], { error: true }), [attendees]);
	const optionalHasError = useMemo(
		() => some(optionalAttendees ?? [], { error: true }),
		[optionalAttendees]
	);

	useEffect(() => {
		getOrderedAccountIds(sender ? sender.address : '')
			.then((ids) => {
				setOrderedAccountIds(ids);
			})
			.catch(() => {
				createSnackbar({
					key: `ordered-account-ids`,
					replace: true,
					type: 'error',
					label: t('label.error_try_again', 'Something went wrong, please try again'),
					autoHideTimeout: 3000,
					hideButton: true
				});
			});
	}, [createSnackbar, sender, t]);

	const onChange = useCallback(
		(value) => {
			dispatch(
				editEditorAttendees({
					id: editorId,
					attendees: value
				})
			);
		},
		[dispatch, editorId]
	);

	const onOptionalsChange = useCallback(
		(value) => {
			dispatch(editEditorOptionalAttendees({ id: editorId, optionalAttendees: value }));
		},
		[dispatch, editorId]
	);

	const defaultValue = useMemo(() => {
		if (attendees?.length > 0) {
			return map(attendees, (chip) => {
				const currentChipAvailability = find(attendeesAvailabilityList, ['email', chip.email]);

				const oldActions =
					(chip.actions && !chip.error) || !chip.email
						? reject(chip.actions, ['icon', 'EditOutline'])
						: chip.actions;

				if (currentChipAvailability) {
					const isBusyAtTimeOfEvent = getIsBusyAtTimeOfTheEvent(
						currentChipAvailability,
						start,
						end,
						attendeesAvailabilityList,
						allDay
					);

					const actions =
						isBusyAtTimeOfEvent && !find(oldActions, ['id', 'unavailable'])
							? [
									...(oldActions ?? []),
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
							: oldActions;
					return {
						...chip,
						error: !chip.email ? false : chip.error,
						actions
					};
				}
				return { ...chip, error: !chip.email ? false : chip.error, actions: oldActions };
			});
		}
		return [];
	}, [allDay, attendees, attendeesAvailabilityList, end, start, t]);

	return (
		<>
			<AttendeesContainer>
				<Container
					orientation="horizontal"
					background={'gray5'}
					style={{ overflow: 'hidden' }}
					padding={{ all: 'none' }}
				>
					<Container background={'gray5'} style={{ overflow: 'hidden' }}>
						{integrationAvailable ? (
							<ContactInput
								// eslint-disable-next-line @typescript-eslint/ban-ts-comment
								// @ts-ignore
								placeholder={t('label.attendee_plural', 'Attendees')}
								onChange={onChange}
								defaultValue={defaultValue}
								disabled={disabled?.attendees}
								dragAndDropEnabled
								orderedAccountIds={orderedAccountIds}
							/>
						) : (
							<ChipInput
								placeholder={t('label.attendee_plural', 'Attendees')}
								background={'gray5'}
								onChange={onChange}
								defaultValue={defaultValue}
								hasError={hasError}
								description={hasError ? '' : undefined}
								disabled={disabled?.attendees}
							/>
						)}
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
						{integrationAvailable ? (
							<ContactInput
								// eslint-disable-next-line @typescript-eslint/ban-ts-comment
								// @ts-ignore
								placeholder={t('label.optionals', 'Optionals')}
								onChange={onOptionalsChange}
								defaultValue={optionalAttendees}
								disabled={disabled?.optionalAttendees}
								dragAndDropEnabled
								orderedAccountIds={orderedAccountIds}
							/>
						) : (
							<ChipInput
								placeholder={t('label.optionals', 'Optionals')}
								background={'gray5'}
								onChange={onOptionalsChange}
								defaultValue={optionalAttendees}
								hasError={optionalHasError}
								description={optionalHasError ? '' : undefined}
								disabled={disabled?.optionalAttendees}
							/>
						)}
					</AttendeesContainer>
				</Row>
			)}
		</>
	);
};
