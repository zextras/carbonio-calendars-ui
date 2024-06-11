/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useCallback, useMemo, useState } from 'react';

import {
	Button,
	Checkbox,
	Container,
	Divider,
	Icon,
	Input,
	ModalBody,
	ModalFooter,
	ModalHeader,
	Padding,
	Row,
	Select,
	SelectItem,
	Text,
	Tooltip,
	useSnackbar
} from '@zextras/carbonio-design-system';
import { FOLDERS, useUserAccounts } from '@zextras/carbonio-shell-ui';
import type { TFunction } from 'i18next';
import { compact, find, includes, isEmpty, map } from 'lodash';
import { useTranslation } from 'react-i18next';
import styled, { DefaultTheme } from 'styled-components';

import { GranteeChip } from './grantee-chip';
import { FOLDER_VIEW } from '../../../../carbonio-ui-commons/constants';
import { useFoldersMap } from '../../../../carbonio-ui-commons/store/zustand/folder';
import { Folder, Grant } from '../../../../carbonio-ui-commons/types/folder';
import { hasId } from '../../../../carbonio-ui-commons/worker/handle-message';
import { useEditModalContext } from '../../../../commons/edit-modal-context';
import { SHARE_USER_TYPE } from '../../../../constants';
import { FOLDER_OPERATIONS } from '../../../../constants/api';
import { CALENDARS_STANDARD_COLORS } from '../../../../constants/calendar';
import { setCalendarColor } from '../../../../normalizations/normalizations-utils';
import { folderAction } from '../../../../store/actions/calendar-actions';
import { sendShareCalendarNotification } from '../../../../store/actions/send-share-calendar-notification';
import { useAppDispatch } from '../../../../store/redux/hooks';

const Square = styled.div`
	width: 1.125rem;
	height: 1.125rem;
	position: relative;
	top: -0.1875rem;
	border: 0.0625rem solid
		${({ theme }: { theme: DefaultTheme }): string => theme.palette.gray2.regular};
	background: ${({ color }: { color: string }): string => color};
	border-radius: 0.25rem;
`;

const ColorContainer = styled(Container)`
	border-bottom: 0.0625rem solid
		${({ theme }: { theme: DefaultTheme }): string => theme.palette.gray2.regular};
`;

const StyledContainer = styled(Container)`
	min-width: 0;
	flex-basis: 0;
	flex-grow: 1;
`;

const TextUpperCase = styled(Text)`
	text-transform: capitalize;
`;

type LabelFactoryProps = {
	selected: Array<SelectItem>;
	label: string | undefined;
	open: boolean;
	focus: boolean;
};

const LabelFactory: FC<LabelFactoryProps> = ({ selected, label, open, focus }) => {
	const colorName = useMemo(() => selected?.[0]?.label, [selected]);
	const squareColor = useMemo(
		() =>
			(colorName === 'custom'
				? selected?.[0]?.value
				: CALENDARS_STANDARD_COLORS[parseInt(selected[0].value, 10)]?.color) || '',
		[colorName, selected]
	) as string;

	return (
		<ColorContainer
			orientation="horizontal"
			width="fill"
			crossAlignment="center"
			mainAlignment="space-between"
			borderRadius="half"
			background={'gray5'}
			padding={{
				all: 'small'
			}}
		>
			<Row width="100%" takeAvailableSpace mainAlignment="space-between">
				<Row
					orientation="vertical"
					crossAlignment="flex-start"
					mainAlignment="flex-start"
					padding={{ left: 'small' }}
				>
					<Text size="small" color={open || focus ? 'primary' : 'secondary'}>
						{label}
					</Text>
					<TextUpperCase>{colorName}</TextUpperCase>
				</Row>
				<Padding right="small">
					<Square color={squareColor ?? '0'} />
				</Padding>
			</Row>
			<Icon
				size="large"
				icon={open ? 'ChevronUpOutline' : 'ChevronDownOutline'}
				color={open || focus ? 'primary' : 'secondary'}
				style={{ alignSelf: 'center' }}
			/>
		</ColorContainer>
	);
};

const getStatusItems = (t: TFunction): Array<SelectItem> =>
	CALENDARS_STANDARD_COLORS.map((el, index) => ({
		label: t(el.label ?? ''),
		value: index.toString(),
		customComponent: (
			<Container width="100%" mainAlignment="space-between" orientation="horizontal" height="fit">
				<Padding left="small">
					<TextUpperCase>{t(el.label ?? '')}</TextUpperCase>
				</Padding>
				<Square color={el.color} />
			</Container>
		)
	}));

type MainEditModalProps = {
	folder: Folder;
	totalAppointments: number;
	grant: Grant[];
};

export const MainEditModal: FC<MainEditModalProps> = ({ folder, totalAppointments, grant }) => {
	const allCalendars = useFoldersMap();

	const [t] = useTranslation();
	const accounts = useUserAccounts();
	const createSnackbar = useSnackbar();
	const dispatch = useAppDispatch();
	const { setModal, onClose, setActiveGrant } = useEditModalContext();

	const colors = useMemo(() => getStatusItems(t), [t]);

	const defaultFreeBusy = /b/.test(folder.f ?? '');
	const defaultFolderName = folder.name || '';
	const defaultColor = useMemo(
		() =>
			find(colors, { label: setCalendarColor({ color: folder.color, rgb: folder.rgb }).label }) ?? {
				label: '',
				value: ''
			},
		[colors, folder?.color, folder?.rgb]
	);

	const [folderName, setFolderName] = useState(defaultFolderName);
	const [freeBusy, setFreeBusy] = useState(defaultFreeBusy);

	const toggleFreeBusy = useCallback(() => setFreeBusy((c) => !c), []);

	const isNotACalendarFolderAndIsNotASystemFolder = useCallback(
		(f) => f.view !== FOLDER_VIEW.appointment && parseInt(f.id, 10) > 16,
		[]
	);

	const folderArray = useMemo(
		() =>
			map(allCalendars, (f) =>
				f.name === defaultFolderName || isNotACalendarFolderAndIsNotASystemFolder(f) ? null : f.name
			),
		[allCalendars, defaultFolderName, isNotACalendarFolderAndIsNotASystemFolder]
	);

	const showDupWarning = useMemo(
		() => includes(folderArray, folderName),
		[folderName, folderArray]
	);

	const disabled = useMemo(
		() =>
			hasId(folder, FOLDERS.CALENDAR)
				? false
				: folderName.indexOf('/') > -1 ||
					folderName.length === 0 ||
					folderName.toLowerCase() === 'calendar' ||
					showDupWarning,
		[folderName, folder, showDupWarning]
	);

	const [selectedColor, setSelectedColor] = useState<SelectItem>(defaultColor);

	const onSelectedColorChange = useCallback(
		(newColor) => {
			const newResult = find(colors, {
				label: setCalendarColor({ color: newColor }).label
			});
			if (newResult) {
				setSelectedColor(newResult);
			}
		},
		[colors]
	);

	const onConfirm = useCallback(() => {
		const actionRename =
			folderName?.length && folderName !== defaultFolderName
				? { op: FOLDER_OPERATIONS.RENAME, name: folderName, id: folder.id }
				: undefined;
		const actionColor =
			selectedColor && selectedColor?.value !== defaultColor?.value
				? { op: FOLDER_OPERATIONS.COLOR, color: selectedColor.value, id: folder.id }
				: undefined;
		const actionFreeBusy =
			freeBusy !== defaultFreeBusy
				? {
						op: FOLDER_OPERATIONS.FREE_BUSY,
						excludeFreeBusy: !defaultFreeBusy,
						id: folder.id
					}
				: undefined;
		const actionsArray = compact([actionRename, actionColor, actionFreeBusy]);
		if (actionsArray.length) {
			const actions = actionsArray.length > 1 ? actionsArray : actionsArray[0];
			folderAction(actions).then((res: { Fault?: string }) => {
				if (!res.Fault) {
					createSnackbar({
						key: `folder-action-success`,
						replace: true,
						type: 'success',
						hideButton: true,
						label: t('label.changes_saved', 'Changes saved'),
						autoHideTimeout: 3000
					});
				} else {
					createSnackbar({
						key: `folder-action-success`,
						replace: true,
						type: 'error',
						hideButton: true,
						label: t('label.error_try_again', 'Something went wrong, please try again'),
						autoHideTimeout: 3000
					});
				}
				onClose();
			});
		} else {
			onClose();
		}
	}, [
		folderName,
		defaultFolderName,
		folder.id,
		selectedColor,
		defaultColor?.value,
		freeBusy,
		defaultFreeBusy,
		onClose,
		createSnackbar,
		t
	]);

	const onShare = useCallback(() => {
		if (setModal) setModal('share');
	}, [setModal]);

	const onRevoke = useCallback(
		(item) => {
			if (setActiveGrant) setActiveGrant(item);
			setModal('revoke');
		},
		[setActiveGrant, setModal]
	);

	const onResend = useCallback(
		(item) => {
			dispatch(
				sendShareCalendarNotification({
					contacts: [{ email: item.d }],
					folder: folder.id,
					accounts
				})
			).then((res) => {
				if (res.type.includes('fulfilled')) {
					createSnackbar({
						key: `folder-action-success`,
						replace: true,
						type: 'info',
						hideButton: true,
						label: t('share_invite_resent', 'Share invite resent'),
						autoHideTimeout: 3000
					});
				} else {
					createSnackbar({
						key: `folder-action-success`,
						replace: true,
						type: 'error',
						hideButton: true,
						label: t('label.error_try_again', 'Something went wrong, please try again'),
						autoHideTimeout: 3000
					});
				}
			});
		},
		[accounts, createSnackbar, dispatch, folder, t]
	);

	const onEdit = useCallback(
		(item) => {
			if (setActiveGrant) setActiveGrant(item);
			setModal('edit');
		},
		[setModal, setActiveGrant]
	);

	const title = useMemo(
		() => t('action.edit_calendar_properties', 'Edit calendar properties'),
		[t]
	);

	const placeholder = useMemo(() => t('label.type_name_here', 'Calendar name'), [t]);

	return (
		<Container
			data-testid="MainEditModal"
			padding="0.5rem 0.5rem 1.5rem"
			style={{ overflowY: 'auto' }}
		>
			<ModalHeader onClose={onClose} title={title} showCloseIcon />
			<Divider />
			<ModalBody style={{ padding: '0.5rem' }}>
				<Container mainAlignment="center" crossAlignment="flex-start" height="fit">
					{hasId(folder, FOLDERS.CALENDAR) ? (
						<Tooltip
							label={t('cannot_edit_name', 'You cannot edit the name of a system calendar')}
							placement="top"
							maxWidth="fit"
						>
							<Input
								label={placeholder}
								backgroundColor="gray5"
								defaultValue={folderName}
								onChange={(e): void => {
									setFolderName(e.target.value);
								}}
								disabled
							/>
						</Tooltip>
					) : (
						<Input
							label={placeholder}
							backgroundColor="gray5"
							defaultValue={folderName}
							onChange={(e): void => {
								setFolderName(e.target.value);
							}}
						/>
					)}
				</Container>
				{showDupWarning && (
					<Padding all="small">
						<Text size="small" color="error">
							{t(
								'folder.modal.new.duplicate_warning',
								'Calendar with the same name already exists'
							)}
						</Text>
					</Padding>
				)}
				<Container
					padding={{ top: 'small', bottom: 'small' }}
					mainAlignment="center"
					crossAlignment="flex-start"
					orientation="horizontal"
					height="fit"
				>
					<Row orientation="vertical" width="50%" crossAlignment="flex-start">
						<Text size="small" color="secondary">
							{t('type', 'Type')}
						</Text>
						<Text>{t('label.calendar', 'Calendar')}</Text>
					</Row>
					<Row orientation="vertical" width="50%" crossAlignment="flex-start">
						<Text size="small" color="secondary">
							{t('appointments', 'Appointments')}
						</Text>
						<Text>{totalAppointments}</Text>
					</Row>
				</Container>
				<Container
					padding={{ top: 'small', bottom: 'small' }}
					mainAlignment="center"
					crossAlignment="flex-start"
					orientation="horizontal"
					height="fit"
				>
					<Select
						label={t('label.calendar_color', 'Calendar color')}
						onChange={onSelectedColorChange}
						items={colors}
						defaultSelection={selectedColor}
						LabelFactory={LabelFactory}
					/>
				</Container>
				<Container
					padding={{ top: 'small', bottom: 'small' }}
					mainAlignment="flex-start"
					crossAlignment="flex-start"
					orientation="horizontal"
					height="fit"
				>
					<Checkbox
						value={freeBusy}
						defaultChecked={defaultFreeBusy}
						onClick={toggleFreeBusy}
						label={t(
							'label.exclude_free_busy',
							'Exclude this calendar when reporting the free/busy times'
						)}
					/>
				</Container>
				{!isEmpty(folder?.acl) && !(folder.isLink && folder.owner) && (
					<>
						<Container
							padding={{ top: 'small', bottom: 'small' }}
							mainAlignment="center"
							crossAlignment="flex-start"
							orientation="horizontal"
						>
							<Divider />
						</Container>
						<Container
							padding={{ top: 'small', bottom: 'small' }}
							mainAlignment="flex-start"
							crossAlignment="flex-start"
							orientation="horizontal"
						>
							<Text weight="bold">
								{t('label.sharing_of_this_folder', 'Sharing of this folder')}
							</Text>
						</Container>
						<>
							{grant && grant.length > 0 && (
								<Container
									style={{ overflowY: 'auto' }}
									mainAlignment="flex-start"
									minHeight={grant.length === 1 ? '2rem' : '4rem'}
									maxHeight={'4rem'}
									padding={{ right: 'small' }}
								>
									{map(grant, (item, index) => (
										<Container
											orientation="horizontal"
											mainAlignment="flex-end"
											padding={{ bottom: 'small' }}
											key={index}
										>
											<StyledContainer crossAlignment="flex-start">
												<GranteeChip grant={item} />
											</StyledContainer>
											<Container orientation="horizontal" mainAlignment="flex-end" width={'fit'}>
												{item.gt !== SHARE_USER_TYPE.PUBLIC && (
													<>
														<Tooltip
															label={t('tooltip.edit', 'Edit share properties')}
															placement="top"
														>
															<Button
																type="outlined"
																label={t('label.edit', 'Edit')}
																onClick={(): void => {
																	onEdit(item);
																}}
																size="small"
															/>
														</Tooltip>
														<Padding horizontal="extrasmall" />
													</>
												)}
												<Tooltip label={t('revoke_access', 'Revoke access')} placement="top">
													<Button
														type="outlined"
														label={t('label.revoke', 'Revoke')}
														color="error"
														onClick={(): void => {
															onRevoke(item);
														}}
														size="small"
													/>
												</Tooltip>
												{item.gt !== SHARE_USER_TYPE.PUBLIC && (
													<>
														<Padding horizontal="extrasmall" />
														<Tooltip
															label={t('tooltip.resend', 'Send mail notification about this share')}
															placement="top"
															maxWidth="18.75rem"
														>
															<Button
																type="outlined"
																label={t('label.resend', 'Resend')}
																onClick={(): void => {
																	onResend(item);
																}}
																size="small"
															/>
														</Tooltip>
													</>
												)}
											</Container>
										</Container>
									))}
								</Container>
							)}
						</>
					</>
				)}
			</ModalBody>
			<Divider />
			<ModalFooter
				onConfirm={onConfirm}
				confirmLabel={t('label.ok', 'OK')}
				confirmDisabled={disabled}
				onSecondaryAction={onShare}
				secondaryActionLabel={t('label.add_share', 'Add share')}
			/>
		</Container>
	);
};
