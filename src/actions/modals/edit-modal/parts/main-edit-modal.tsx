/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import styled from '@emotion/styled';
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
	Popover,
	Row,
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
import { compact, includes, map } from 'lodash';
import { HexColorPicker } from 'react-colorful';
import { useTranslation } from 'react-i18next';

import { GranteeChip } from './grantee-chip';
import { ShareCalendarUrls } from './share-calendar-urls';
import { useEditModalContext } from 'commons/edit-modal-context';
import { isCaldavChild } from 'commons/utilities';
import { FOLDER_OPERATIONS } from 'constants/api';
import { CALENDARS_STANDARD_COLORS } from 'constants/calendar';
import { PUBLIC_SHARE_ZID, SHARE_USER_TYPE } from 'constants/index';
import { usePreventBackdropClose } from 'hooks/use-prevent-backdrop-close';
import { folderAction } from 'store/actions/calendar-actions';
import { sendShareCalendarNotification } from 'store/actions/send-share-calendar-notification';
import { useAppDispatch } from 'store/redux/hooks';
import { FolderAction } from 'types/soap/soap-actions';
import { containPublicShareGrant } from 'utils/calendars-share';

const StyledContainer = styled(Container)`
	min-width: 0;
	flex-basis: 0;
	flex-grow: 1;
`;

const selectedRing = (color: string, theme: { palette: { gray6: { regular: string } } }): string =>
	`0 0 0 0.125rem ${theme.palette.gray6.regular}, 0 0 0 0.25rem ${color}`;

const HOVER_SHADOW = '0 0.125rem 0.375rem rgba(0, 0, 0, 0.25)';

const ColorDot = styled.button<{ $color: string; $selected: boolean }>`
	width: 1.5rem;
	height: 1.5rem;
	border-radius: 50%;
	border: none;
	background: ${({ $color }): string => $color};
	cursor: pointer;
	padding: 0;
	box-shadow: ${({ $selected, $color, theme }): string =>
		$selected ? selectedRing($color, theme) : 'none'};

	&:hover {
		box-shadow: ${({ $selected, $color, theme }): string =>
			$selected ? `${selectedRing($color, theme)}, ${HOVER_SHADOW}` : HOVER_SHADOW};
	}

	&:disabled {
		cursor: default;
		opacity: 0.5;

		&:hover {
			box-shadow: ${({ $selected, $color, theme }): string =>
				$selected ? selectedRing($color, theme) : 'none'};
		}
	}
`;

const CustomColorTriggerButton = styled.button`
	width: 1.5rem;
	height: 1.5rem;
	border-radius: 50%;
	border: none;
	background: transparent;
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
	padding: 0;
`;

const HEX_COLOR_REGEX = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

// Saving always writes `rgb` (see onConfirm below), even for a standard color, so on load an
// exact rgb match against a standard hex means "this is actually a standard color", not custom —
// same resolution used by edit-external-calendar-modal.tsx for the same reason.
const findExactStandardColorIndex = (rgb: string | undefined): number | undefined => {
	if (!rgb) {
		return undefined;
	}
	const index = CALENDARS_STANDARD_COLORS.findIndex(
		(standardColor) => standardColor.color.toLowerCase() === rgb.toLowerCase()
	);
	return index === -1 ? undefined : index;
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
	const { setModal, onClose, setActiveGrant, isColorPickerOpen, setIsColorPickerOpen } =
		useEditModalContext();

	const defaultFreeBusy = /b/.test(folder.f ?? '');
	const defaultFolderName = folder.name || '';

	const matchingStandardIndexFromRgb = findExactStandardColorIndex(folder.rgb);
	const defaultColorIndex = matchingStandardIndexFromRgb ?? folder.color ?? 0;

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

	const defaultCustomHex = useMemo(
		() =>
			folder.rgb ??
			CALENDARS_STANDARD_COLORS[defaultColorIndex]?.color ??
			CALENDARS_STANDARD_COLORS[0].color,
		[folder.rgb, defaultColorIndex]
	);
	const defaultIsCustomColorSelected =
		Boolean(folder.rgb) && matchingStandardIndexFromRgb === undefined;

	const [selectedColorIndex, setSelectedColorIndex] = useState(defaultColorIndex);
	const [isCustomColorSelected, setIsCustomColorSelected] = useState(defaultIsCustomColorSelected);
	const [hasCustomColor, setHasCustomColor] = useState(defaultIsCustomColorSelected);
	const [customHex, setCustomHex] = useState(defaultCustomHex);

	const colorSwatchRef = useRef<HTMLButtonElement>(null);
	const popoverContentRef = useRef<HTMLDivElement>(null);
	const [draftHex, setDraftHex] = useState(customHex);
	const [hexInputValue, setHexInputValue] = useState(customHex);

	usePreventBackdropClose(isColorPickerOpen, popoverContentRef);

	useEffect(() => {
		if (isColorPickerOpen) {
			setDraftHex(customHex);
			setHexInputValue(customHex);
		}
	}, [isColorPickerOpen, customHex]);

	const onSelectStandardColor = useCallback((index: number) => {
		setSelectedColorIndex(index);
		setIsCustomColorSelected(false);
	}, []);

	const onDraftColorChange = useCallback((hex: string) => {
		setDraftHex(hex);
		setHexInputValue(hex);
	}, []);

	const onHexInputChange = useCallback((value: string) => {
		setHexInputValue(value);
		if (HEX_COLOR_REGEX.test(value)) {
			setDraftHex(value);
		}
	}, []);

	const onSaveCustomColor = useCallback(() => {
		const exactStandardIndex = findExactStandardColorIndex(draftHex);
		if (exactStandardIndex !== undefined) {
			setSelectedColorIndex(exactStandardIndex);
			setIsCustomColorSelected(false);
		} else {
			setCustomHex(draftHex);
			setIsCustomColorSelected(true);
			setHasCustomColor(true);
		}
		setIsColorPickerOpen(false);
	}, [draftHex, setIsColorPickerOpen]);

	const onSelectExistingCustomColor = useCallback(() => {
		setIsCustomColorSelected(true);
	}, []);

	const onCancelCustomColor = useCallback(() => {
		setIsColorPickerOpen(false);
	}, [setIsColorPickerOpen]);

	const onConfirm = useCallback(() => {
		const actionRename =
			folderName?.length && folderName !== defaultFolderName
				? { op: FOLDER_OPERATIONS.RENAME, name: folderName, id: folder.id }
				: undefined;
		const originalColorKey = defaultIsCustomColorSelected
			? `custom:${defaultCustomHex}`
			: `standard:${defaultColorIndex}`;
		const currentColorKey = isCustomColorSelected
			? `custom:${customHex}`
			: `standard:${selectedColorIndex}`;
		let actionColor: FolderAction | undefined;
		if (originalColorKey !== currentColorKey) {
			// Always send `rgb` (never the numeric `color`), matching the other calendar
			// color modals: a partial update that only sets `color` doesn't clear a
			// previously-set `rgb`, so the calendar would stay stuck on the old custom color.
			const resultingHex = isCustomColorSelected
				? customHex
				: (CALENDARS_STANDARD_COLORS[selectedColorIndex]?.color ??
					CALENDARS_STANDARD_COLORS[0].color);
			actionColor = { op: FOLDER_OPERATIONS.COLOR, rgb: resultingHex, id: folder.id };
		}
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
		selectedColorIndex,
		defaultColorIndex,
		isCustomColorSelected,
		defaultIsCustomColorSelected,
		customHex,
		defaultCustomHex,
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

	const onCloseModal = useCallback(() => {
		if (!isColorPickerOpen) onClose();
	}, [isColorPickerOpen, onClose]);

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
			<ModalHeader onClose={onCloseModal} title={title} showCloseIcon />
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
						orientation="vertical"
						height="fit"
						gap="0.5rem"
					>
						<Container
							mainAlignment="flex-start"
							crossAlignment="center"
							orientation="horizontal"
							height="fit"
							gap="1rem"
							wrap="wrap"
							padding={{ horizontal: '0.25rem' }}
						>
							{CALENDARS_STANDARD_COLORS.map((standardColor, index) => (
								<Tooltip key={standardColor.label} label={t(`colors.${standardColor.label}`)}>
									<ColorDot
										type="button"
										aria-label={t(`colors.${standardColor.label}`)}
										aria-pressed={!isCustomColorSelected && selectedColorIndex === index}
										$color={standardColor.color}
										$selected={!isCustomColorSelected && selectedColorIndex === index}
										onClick={(): void => onSelectStandardColor(index)}
										disabled={isColorPickerOpen}
									/>
								</Tooltip>
							))}
							{hasCustomColor && (
								<Tooltip label={t('label.custom_color', 'Custom color')}>
									<ColorDot
										type="button"
										aria-label={t('label.custom_color', 'Custom color')}
										aria-pressed={isCustomColorSelected}
										$color={customHex}
										$selected={isCustomColorSelected}
										onClick={onSelectExistingCustomColor}
										disabled={isColorPickerOpen}
									/>
								</Tooltip>
							)}
							<CustomColorTriggerButton
								ref={colorSwatchRef}
								type="button"
								onClick={(): void => setIsColorPickerOpen(!isColorPickerOpen)}
							>
								<Icon icon="PlusCircleOutline" size="large" color="primary" />
							</CustomColorTriggerButton>
							<Popover
								disablePortal
								anchorEl={colorSwatchRef}
								open={isColorPickerOpen}
								onClose={onCancelCustomColor}
								placement="bottom-start"
								style={{ zIndex: 1001 }}
							>
								<Container
									ref={popoverContentRef}
									padding="0.75rem"
									gap="0.75rem"
									width="fit"
									height="fit"
								>
									<HexColorPicker color={draftHex} onChange={onDraftColorChange} />
									<Input
										label={t('label.hex_color', 'Hex color')}
										value={hexInputValue}
										onChange={(e): void => onHexInputChange(e.target.value)}
									/>
									<Container
										orientation="horizontal"
										mainAlignment="flex-end"
										crossAlignment="flex-end"
										height="fit"
										width="fill"
										gap="0.5rem"
									>
										<Button
											type="outlined"
											color="secondary"
											label={t('label.cancel', 'Cancel')}
											onClick={onCancelCustomColor}
										/>
										<Button
											color="primary"
											label={t('label.save', 'Save')}
											onClick={onSaveCustomColor}
										/>
									</Container>
								</Container>
							</Popover>
						</Container>
						<Text size="small" color="secondary">
							{t(
								'label.choose_color_caption',
								'Choose a color to make this calendar easier to recognize'
							)}
						</Text>
					</Container>

					<Checkbox
						value={freeBusy}
						defaultChecked={defaultFreeBusy}
						onClick={toggleFreeBusy}
						disabled={isColorPickerOpen}
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
									disabled={isColorPickerOpen}
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
														disabled={isColorPickerOpen}
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
														disabled={isColorPickerOpen}
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
														disabled={isColorPickerOpen}
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
								disabled={isColorPickerOpen}
								label={t(
									'share.options.share_calendar_with.public',
									'Share with public (view only, no password required)'
								)}
							/>

							{isSharedWithPublic && (
								<ShareCalendarUrls calendarName={folder.name} disabled={isColorPickerOpen} />
							)}
						</Container>
					)}
				</Container>
			</ModalBody>
			<Divider />
			<ModalFooter
				onConfirm={onConfirm}
				confirmLabel={t('label.ok', 'OK')}
				confirmDisabled={disabled || isColorPickerOpen}
			/>
		</Container>
	);
};
