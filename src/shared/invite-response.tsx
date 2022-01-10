/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
/* eslint-disable import/extensions */
import React, { FC, ReactElement, useCallback, useState, useContext } from 'react';
import {
	Container,
	Padding,
	Button,
	Divider,
	Row,
	Checkbox,
	Icon,
	Text,
	SnackbarManagerContext
} from '@zextras/zapp-ui';
import styled from 'styled-components';
import moment from 'moment';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { sendInviteResponse } from '../store/actions/send-invite-response';

const InviteContainer = styled(Container)`
	border: 1px solid ${({ theme }: any): string => theme.palette.gray2.regular};
	border-radius: 14px;
	margin: ${({ theme }: any): string => theme.sizes.padding.extrasmall};
`;
type InviteResponse = {
	inviteId: string;
	invite: any;
	participationStatus: string;
	compNum: string;
};
type SnackbarType = {
	key: string;
	replace: boolean;
	type: string;
	label: string;
	autoHideTimeout: number;
};

const InviteResponse: FC<InviteResponse> = ({
	inviteId,
	participationStatus,
	invite,
	compNum
}): ReactElement => {
	const [notifyOrganizer, setNotifyOrganizer] = useState(true);
	const createSnackbar = useContext(SnackbarManagerContext);
	const [t] = useTranslation();
	const dispatch = useDispatch();
	const decline = useCallback(
		(ev) => {
			dispatch(
				sendInviteResponse({
					inviteId,
					updateOrganizer: notifyOrganizer,
					action: 'DECLINE',
					compNum,
					fromMail: true
				})
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
			).then((res: any): void => {
				if (res.type.includes('fulfilled')) {
					// eslint-disable-next-line @typescript-eslint/ban-ts-comment
					// @ts-ignore
					createSnackbar({
						key: `invite_declined`,
						replace: true,
						type: 'info',
						label: t('message.snackbar.invite.decline', 'You’ve replied as Declined'),
						autoHideTimeout: 3000
					});
				} else {
					// eslint-disable-next-line @typescript-eslint/ban-ts-comment
					// @ts-ignore
					createSnackbar({
						key: `move`,
						replace: true,
						type: 'error',
						label: t('label.error_try_again', 'Something went wrong, please try again'),
						autoHideTimeout: 3000
					});
				}
			});
		},

		[dispatch, inviteId, compNum, notifyOrganizer, t, createSnackbar]
	);
	const tentative = useCallback(
		(ev) => {
			dispatch(
				sendInviteResponse({
					inviteId,
					updateOrganizer: notifyOrganizer,
					action: 'TENTATIVE',
					compNum,
					fromMail: true
					// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				}) // @ts-ignore
			).then((res: any): void => {
				if (res.type.includes('fulfilled')) {
					// eslint-disable-next-line @typescript-eslint/ban-ts-comment
					// @ts-ignore
					createSnackbar({
						key: `invite_tentative`,
						replace: true,
						type: 'info',
						label: t('message.snackbar.invite.tentative', 'You’ve replied as Tentative'),
						autoHideTimeout: 3000
					});
				} else {
					// eslint-disable-next-line @typescript-eslint/ban-ts-comment
					// @ts-ignore
					createSnackbar({
						key: `move`,
						replace: true,
						type: 'error',
						label: t('label.error_try_again', 'Something went wrong, please try again'),
						autoHideTimeout: 3000
					});
				}
			});
		},
		[dispatch, inviteId, compNum, notifyOrganizer, t, createSnackbar]
	);
	const accept = useCallback(
		(ev) => {
			dispatch(
				sendInviteResponse({
					inviteId,
					updateOrganizer: notifyOrganizer,
					action: 'ACCEPT',
					compNum,
					fromMail: true
					// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				}) // @ts-ignore
			).then((res: any): void => {
				if (res.type.includes('fulfilled')) {
					// eslint-disable-next-line @typescript-eslint/ban-ts-comment
					// @ts-ignore
					createSnackbar({
						key: `invite_accepted`,
						replace: true,
						type: 'info',
						label: t('message.snackbar.invite.accepted', 'You’ve replied as Accepted'),
						autoHideTimeout: 3000
					});
				} else {
					// eslint-disable-next-line @typescript-eslint/ban-ts-comment
					// @ts-ignore
					createSnackbar({
						key: `move`,
						replace: true,
						type: 'error',
						label: t('label.error_try_again', 'Something went wrong, please try again'),
						autoHideTimeout: 3000
					});
				}
			});
		},
		[dispatch, inviteId, compNum, notifyOrganizer, t, createSnackbar]
	);

	return (
		<InviteContainer padding={{ all: 'small' }}>
			<Container padding={{ top: 'medium', horizontal: 'small', bottom: 'extrasmall' }} width="80%">
				<Row>
					<Icon icon="CalendarOutline" size="large" />
					<Padding all="extrasmall" />
					<Text weight="bold" size="large">
						{invite[0]?.comp[0]?.or.d || invite[0]?.comp[0]?.or.a}{' '}
						{t('message.invited_you', 'invited you to an event')}
					</Text>
				</Row>
				<Row width="fill" padding={{ top: 'medium' }}>
					<Row padding={{ all: 'small' }}>
						<Icon icon="CalendarOutline" style={{ minWidth: '16px' }} />
					</Row>

					<Row takeAvailableSpace mainAlignment="flex-start">
						<Text size="large" weight="bold">
							{invite[0]?.comp[0].name}
						</Text>
					</Row>
				</Row>
				<Row
					width="fill"
					mainAlignment="flex-start"
					padding={{ horizontal: 'small', bottom: 'small' }}
				>
					<Row padding={{ right: 'small' }}>
						<Icon icon="ClockOutline" />
					</Row>
					<Row takeAvailableSpace mainAlignment="flex-start" display="flex">
						<Text overflow="break-word">
							{moment(invite[0]?.comp[0].s[0].u).format(
								`dddd, DD MMM, YYYY [${moment(invite[0]?.comp[0].s[0].u).format(
									`HH:MM`
								)}]-[${moment(invite[0]?.comp[0].e[0].u).format(`HH:MM`)}]`
							)}
						</Text>
					</Row>
				</Row>

				{invite[0]?.comp[0].loc && (
					<Row
						width="fill"
						mainAlignment="flex-start"
						padding={{ horizontal: 'small', bottom: 'small' }}
					>
						<Row padding={{ right: 'small' }}>
							<Icon icon="PinOutline" />
						</Row>
						<Row takeAvailableSpace mainAlignment="flex-start">
							<Text overflow="break-word">{invite[0]?.comp[0].loc}</Text>
						</Row>
					</Row>
				)}
				<Row
					width="fill"
					mainAlignment="flex-start"
					padding={{ horizontal: 'small', bottom: 'small' }}
				>
					<Row padding={{ right: 'small' }}>
						<Icon icon="PeopleOutline" />
					</Row>
					<Row takeAvailableSpace mainAlignment="flex-start">
						<Text overflow="break-word">
							{invite[0]?.comp[0].at.map((user: any, index: number) =>
								index === invite[0].comp[0].at.length - 1
									? `${user.a || user.d}`
									: `${user.a || user.d},`
							)}
						</Text>
					</Row>
				</Row>

				<Row
					width="fill"
					mainAlignment="flex-start"
					padding={{ horizontal: 'small', bottom: 'small' }}
				>
					<Row padding={{ right: 'small' }}>
						<Icon icon="MessageSquareOutline" />
					</Row>
					<Row takeAvailableSpace mainAlignment="flex-start">
						<Text overflow="break-word">{invite[0].comp[0].fr}</Text>
					</Row>
				</Row>

				<Divider />
				<Row
					width="fill"
					mainAlignment="flex-start"
					padding={{ horizontal: 'small', vertical: 'small' }}
				>
					<Checkbox
						value={notifyOrganizer}
						onClick={(): void => setNotifyOrganizer(!notifyOrganizer)}
						label="Notify Organizer"
					/>{' '}
				</Row>

				<Divider />
			</Container>
			<Container
				orientation="horizontal"
				crossAlignment="flex-start"
				mainAlignment="center"
				weight="fill"
				height="fit"
				padding={{ all: 'large' }}
			>
				<Button
					type="outlined"
					label="YES"
					icon="Checkmark"
					color="success"
					onClick={accept}
					disabled={participationStatus === 'AC'}
				/>
				<Padding horizontal="small" />
				<Button
					type="outlined"
					label="MAYBE"
					icon="QuestionMark"
					color="warning"
					onClick={tentative}
					disabled={participationStatus === 'TE'}
				/>
				<Padding horizontal="small" />
				<Button
					type="outlined"
					label="NO"
					icon="Close"
					color="error"
					onClick={decline}
					disabled={participationStatus === 'DE'}
				/>
			</Container>
		</InviteContainer>
	);
};

export default InviteResponse;
