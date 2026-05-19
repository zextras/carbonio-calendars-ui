/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import styled from '@emotion/styled';
import {
	AnyColor,
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
	SingleSelectionOnChange,
	Text,
	Tooltip,
	useSnackbar
} from '@zextras/carbonio-design-system';
import { useUserAccounts, useUserSettings } from '@zextras/carbonio-shell-ui';
import {
	FOLDER_VIEW,
	FOLDERS,
	useFoldersMap,
	Folder,
	Grant,
	hasId
} from '@zextras/carbonio-ui-commons';
import { compact, find, includes, map } from 'lodash';
import { useTranslation } from 'react-i18next';

import { GranteeChip } from './grantee-chip';
import { ShareCalendarUrls } from './share-calendar-urls';
import { useEditModalContext } from 'commons/edit-modal-context';
import { isCaldavChild } from 'commons/utilities';
import { FOLDER_OPERATIONS } from 'constants/api';
import { CALENDARS_STANDARD_COLORS } from 'constants/calendar';
import { PUBLIC_SHARE_ZID, SHARE_USER_TYPE } from 'constants/index';
import { folderAction } from 'store/actions/calendar-actions';
import { sendShareCalendarNotification } from 'store/actions/send-share-calendar-notification';
import { useAppDispatch } from 'store/redux/hooks';
import { FolderAction } from 'types/soap/soap-actions';
import { containPublicShareGrant } from 'utils/calendars-share';

const Square = styled.div<{ $color: AnyColor }>`
	width: 1.125rem;
	height: 1.125rem;
	position: relative;
	top: -0.1875rem;
	border: 0.0625rem solid ${({ theme }): string => theme.palette.gray2.regular};
	background: ${({ $color }): string => $color};
	border-radius: 0.25rem;
`;

const ColorContainer = styled(Container)`
	border-bottom: 0.0625rem solid ${({ theme }): string => theme.palette.gray2.regular};
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
					<Square $color={squareColor ?? '0'} />
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

const useGetStatusItems = (): Array<SelectItem> => {
	const [t] = useTranslation();
	return CALENDARS_STANDARD_COLORS.map((el, index) => {
		const colorLabel = t(`colors.${el.label}`);
		return {
			label: colorLabel,
			value: index.toString(),
			customComponent: (
				<Container width="100%" mainAlignment="space-between" orientation="horizontal" height="fit">
					<Padding left="small">
						<TextUpperCase>{colorLabel}</TextUpperCase>
					</Padding>
					<Square $color={el.color} />
				</Container>
			)
		};
	});
};

export type MainEditModalProps = {
	folder: Folder;
	totalAppointments: number;
	grant: Grant[];
};

export const MainEditModal: FC<MainEditModalProps> = ({ folder, totalAppointments, grant }) => {
	const allCalendars = useFoldersMap();

	const [t] = useTranslation();
	const accounts = useUserAccounts();
	const userSettings = useUserSettings();
	const createSnackbar = useSnackbar();
	const dispatch = useAppDispatch();
	const { setModal, onClose, setActiveGrant } = useEditModalContext();

	const colors = useGetStatusItems();

	const defaultFreeBusy = /b/.test(folder.f ?? '');
	const defaultFolderName = folder.name || '';

	const defaultColor = useMemo(
		() =>
			find(colors, (color) => color.value === folder.color?.toString()) ?? { label: '', value: '' },
		[colors, folder.color]
	);

	const defaultSharedWithPublic = useMemo(() => containPublicShareGrant(grant), [grant]);
	const isPublicShareEnabled = userSettings?.attrs?.zimbraPublicSharingEnabled === 'TRUE';
	const internalGrants = useMemo(
		() => grant.filter((g) => g.gt !== SHARE_USER_TYPE.PUBLIC),
		[grant]
	);

	const hasUserToggledPublicRef = useRef(false);
	const [folderName, setFolderName] = useState(defaultFolderName);
	const [freeBusy, setFreeBusy] = useState(defaultFreeBusy);
	const [isSharedWithPublic, setIsSharedWithPublic] = useState(defaultSharedWithPublic);

	useEffect(() => {
		if (!hasUserToggledPublicRef.current) {
			setIsSharedWithPublic(defaultSharedWithPublic);
		}
	}, [defaultSharedWithPublic]);

	const toggleFreeBusy = useCallback(() => setFreeBusy((c) => !c), []);

	const isNotACalendarFolderAndIsNotASystemFolder = useCallback(
		(f: Folder) => f.view !== FOLDER_VIEW.appointment && parseInt(f.id, 10) > 16,
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

	const onSelectedColorChange = useCallback<SingleSelectionOnChange>(
		(newColor) => {
			if (newColor) {
				const newResult = find(colors, (color) => color.value === newColor);
				if (newResult) {
					setSelectedColor(newResult);
				}
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
		let actionPublicShare: FolderAction | undefined;
		if (isSharedWithPublic !== defaultSharedWithPublic) {
			actionPublicShare = defaultSharedWithPublic
				? { id: folder.id, zid: PUBLIC_SHARE_ZID, op: FOLDER_OPERATIONS.REVOKE_GRANT }
				: {
						id: folder.id,
						op: FOLDER_OPERATIONS.GRANT,
						grant: [{ gt: SHARE_USER_TYPE.PUBLIC, perm: 'r', pw: '' }]
					};
		}
		const actionsArray = compact([actionRename, actionColor, actionFreeBusy, actionPublicShare]);
		if (actionsArray.length) {
			const actions = actionsArray.length > 1 ? actionsArray : actionsArray[0];
			folderAction(actions).then((res: { Fault?: string }) => {
				if (!res.Fault) {
					createSnackbar({
						key: `folder-action-success`,
						replace: true,
						severity: 'success',
						hideButton: true,
						label: t('label.changes_saved', 'Changes saved'),
						autoHideTimeout: 3000
					});
				} else {
					createSnackbar({
						key: `folder-action-success`,
						replace: true,
						severity: 'error',
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
		isSharedWithPublic,
		defaultSharedWithPublic,
		onClose,
		createSnackbar,
		t
	]);

	const onShare = useCallback(() => {
		if (setModal) setModal('share');
	}, [setModal]);

	const onRevoke = useCallback(
		(item: Grant) => {
			if (setActiveGrant) setActiveGrant(item);
			setModal('revoke');
		},
		[setActiveGrant, setModal]
	);

	const onResend = useCallback(
		(item: Grant) => {
			dispatch(
				sendShareCalendarNotification({
					contacts: [{ email: item.d as string }],
					folder: folder.id,
					accounts
				})
			).then((res) => {
				if (res.type.includes('fulfilled')) {
					createSnackbar({
						key: `folder-action-success`,
						replace: true,
						severity: 'info',
						hideButton: true,
						label: t('share_invite_resent', 'Share invite resent'),
						autoHideTimeout: 3000
					});
				} else {
					createSnackbar({
						key: `folder-action-success`,
						replace: true,
						severity: 'error',
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
		(item: Grant) => {
			if (setActiveGrant) setActiveGrant(item);
			setModal('edit');
		},
		[setModal, setActiveGrant]
	);

	const title = useMemo(() => t('action.edit_and_share_calendar', 'Edit and share calendar'), [t]);

	const placeholder = useMemo(() => `${t('label.type_name_here', 'Calendar name')}*`, [t]);

	const isCaldavChildReadOnly = useMemo(() => {
		const caldavChild = isCaldavChild(folder);
		const isReadOnly = folder.perm && !/w/.test(folder.perm);
		return caldavChild && isReadOnly;
	}, [folder]);

	const calendarNameInputRef = useRef<HTMLInputElement>(null);
	const isCalendarNameEditable = !isCaldavChildReadOnly && !hasId(folder, FOLDERS.CALENDAR);
	useEffect(() => {
		if (isCalendarNameEditable) {
			calendarNameInputRef.current?.focus();
		}
	}, [isCalendarNameEditable]);

	let calendarNameInput: React.JSX.Element;
	if (isCaldavChildReadOnly) {
		calendarNameInput = (
			<Tooltip
				label={t('cannot_edit_caldav_readonly', 'You cannot edit the name of a read-only calendar')}
				placement="top"
				maxWidth="fit-content"
			>
				<Input
					label={placeholder}
					background="gray5"
					defaultValue={folderName}
					onChange={(e): void => {
						setFolderName(e.target.value);
					}}
					disabled
				/>
			</Tooltip>
		);
	} else if (hasId(folder, FOLDERS.CALENDAR)) {
		calendarNameInput = (
			<Tooltip
				label={t('cannot_edit_name', 'You cannot edit the name of a system calendar')}
				placement="top"
				maxWidth="fit-content"
			>
				<Input
					label={placeholder}
					background="gray5"
					defaultValue={folderName}
					onChange={(e): void => {
						setFolderName(e.target.value);
					}}
					disabled
				/>
			</Tooltip>
		);
	} else {
		calendarNameInput = (
			<Input
				label={placeholder}
				background="gray5"
				hasError={showDupWarning}
				description={
					showDupWarning
						? t('folder.modal.new.duplicate_warning', 'Calendar with the same name already exists')
						: undefined
				}
				defaultValue={folderName}
				onChange={(e): void => {
					setFolderName(e.target.value);
				}}
				inputRef={calendarNameInputRef}
			/>
		);
	}

	return (
		<Container data-testid="MainEditModal" style={{ overflowY: 'auto' }}>
			<ModalHeader onClose={onClose} title={title} showCloseIcon />
			<Divider />
			<ModalBody>
				<Container
					mainAlignment="flex-start"
					crossAlignment="flex-start"
					orientation="vertical"
					gap="1rem"
				>
					{/* Calendar name */}
					{calendarNameInput}

					{/* Type and number of appointments */}
					<Container
						mainAlignment="flex-start"
						crossAlignment="flex-start"
						orientation="horizontal"
						height="fit"
						gap="1.5rem"
					>
						<Row orientation="vertical" width="50%" crossAlignment="flex-start" gap="0.25rem">
							<Text size="small" color="secondary">
								{t('type', 'Type')}
							</Text>
							<Text>{t('label.calendar', 'Calendar')}</Text>
						</Row>
						<Row orientation="vertical" width="50%" crossAlignment="flex-start" gap="0.25rem">
							<Text size="small" color="secondary">
								{t('appointments', 'Appointments')}
							</Text>
							<Text>{totalAppointments}</Text>
						</Row>
					</Container>

					{/* Calendar color */}
					<Container
						mainAlignment="flex-start"
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

					<Checkbox
						value={freeBusy}
						defaultChecked={defaultFreeBusy}
						onClick={toggleFreeBusy}
						label={t(
							'label.exclude_free_busy',
							'Exclude this calendar when reporting the free/busy times'
						)}
					/>

					{/* Internal sharing */}
					{!(folder.isLink && folder.owner) && (
						<Container
							mainAlignment="flex-start"
							crossAlignment="flex-start"
							orientation="vertical"
							gap="1rem"
						>
							<Divider />

							<Container
								data-testid="internalSharingHeader"
								orientation="horizontal"
								mainAlignment="space-between"
								crossAlignment="center"
								height="fit"
							>
								<Text weight="bold">{t('share.label.internal_sharing', 'Internal sharing')}</Text>
								<Button
									type="ghost"
									label={t('label.add_share', 'Add share')}
									icon="Plus"
									onClick={onShare}
									size="small"
								/>
							</Container>

							{internalGrants.length > 0 && (
								<Container
									style={{ overflowY: 'auto' }}
									mainAlignment="flex-start"
									height={internalGrants.length === 1 ? '1.375rem' : '3.25rem'}
									maxHeight={'3.25rem'}
									padding={{ right: 'small' }}
									gap="0.5rem"
								>
									{map(internalGrants, (item, index) => (
										<Container orientation="horizontal" mainAlignment="flex-end" key={index}>
											<StyledContainer crossAlignment="flex-start">
												<GranteeChip grant={item} />
											</StyledContainer>
											<Container orientation="horizontal" mainAlignment="flex-end" width={'fit'}>
												<Tooltip label={t('tooltip.edit', 'Edit share properties')} placement="top">
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
											</Container>
										</Container>
									))}
								</Container>
							)}
						</Container>
					)}

					{/* Public sharing */}
					{isPublicShareEnabled && !(folder.isLink && folder.owner) && (
						<Container
							mainAlignment="flex-start"
							crossAlignment="flex-start"
							orientation="vertical"
							gap="1rem"
						>
							<Divider />

							<Text weight="bold">{t('share.label.public_sharing', 'Public sharing')}</Text>

							<Checkbox
								value={isSharedWithPublic}
								defaultChecked={isSharedWithPublic}
								onClick={(): void => {
									hasUserToggledPublicRef.current = true;
									setIsSharedWithPublic((prev) => !prev);
								}}
								label={t(
									'share.options.share_calendar_with.public',
									'Share with public (view only, no password required)'
								)}
							/>

							{isSharedWithPublic && <ShareCalendarUrls calendarName={folder.name} />}
						</Container>
					)}
				</Container>
			</ModalBody>
			<Divider />
			<ModalFooter
				onConfirm={onConfirm}
				confirmLabel={t('label.ok', 'OK')}
				confirmDisabled={disabled}
			/>
		</Container>
	);
};
