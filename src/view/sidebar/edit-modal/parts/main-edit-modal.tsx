/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
	ButtonOld as Button,
	Checkbox,
	Container,
	Divider,
	Icon,
	Input,
	Padding,
	Row,
	Select,
	SelectItem,
	SnackbarManagerContext,
	Text,
	Tooltip
} from '@zextras/carbonio-design-system';
import { FOLDERS, Folder, Grant, useFolders, useUserAccounts } from '@zextras/carbonio-shell-ui';
import { TFunction } from 'i18next';
import { find, includes, isEmpty, isNull, map, omitBy } from 'lodash';
import React, { FC, useCallback, useContext, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled, { DefaultTheme } from 'styled-components';
import ModalFooter from '../../../../carbonio-ui-commons/components/modals/modal-footer';
import ModalHeader from '../../../../carbonio-ui-commons/components/modals/modal-header';
import { FOLDER_VIEW } from '../../../../carbonio-ui-commons/constants';
import { EditModalContext } from '../../../../commons/edit-modal-context';
import { ZIMBRA_STANDARD_COLORS } from '../../../../commons/zimbra-standard-colors';
import { setCalendarColor } from '../../../../normalizations/normalizations-utils';
import { folderAction } from '../../../../store/actions/calendar-actions';
import { sendShareCalendarNotification } from '../../../../store/actions/send-share-calendar-notification';
import { GranteeInfo } from './grantee-info';
import { useAppDispatch } from '../../../../hooks/redux';

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
				: ZIMBRA_STANDARD_COLORS[parseInt(selected?.[0]?.value, 10)]?.color) || '',
		[colorName, selected]
	) as string;

	return (
		<ColorContainer
			orientation="horizontal"
			width="fill"
			crossAlignment="center"
			mainAlignment="space-between"
			borderRadius="half"
			background="gray5"
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
	ZIMBRA_STANDARD_COLORS.map((el, index) => ({
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
	grant: Grant;
};

type EditModalContexType = {
	setModal: (modal: string) => void;
	onClose: () => void;
	setActiveGrant: (grant: Grant) => void;
};

export const MainEditModal: FC<MainEditModalProps> = ({ folder, totalAppointments, grant }) => {
	const allCalendars = useFolders();

	const iconColor = useMemo(
		() =>
			folder.color ? ZIMBRA_STANDARD_COLORS[parseInt(folder.color, 10)] : setCalendarColor(folder),
		[folder]
	);

	const [inputValue, setInputValue] = useState(folder.name || '');
	const [freeBusy, setFreeBusy] = useState(false);
	const toggleFreeBusy = useCallback(() => setFreeBusy((c) => !c), []);
	const [t] = useTranslation();
	const dispatch = useAppDispatch();
	const checked = useMemo(() => folder.checked, [folder]);

	const { setModal, onClose, setActiveGrant } = useContext<EditModalContexType>(EditModalContext);
	const accounts = useUserAccounts();
	const createSnackbar = useContext(SnackbarManagerContext);
	const [hovered, setHovered] = useState({});

	const colors = useMemo(() => getStatusItems(t), [t]);
	const onMouseEnter = useCallback((item) => {
		setHovered(item);
	}, []);
	const onMouseLeave = useCallback(() => {
		setHovered({});
	}, []);

	const folderArray = useMemo(
		() =>
			map(allCalendars, (f) =>
				f.name === folder.name || (f.view !== FOLDER_VIEW.appointment && parseInt(f.id, 10) > 16)
					? null
					: f.name
			),
		[allCalendars, folder]
	);

	const showDupWarning = useMemo(
		() => includes(folderArray, inputValue),
		[inputValue, folderArray]
	);

	const disabled = useMemo(
		() =>
			folder?.id === FOLDERS.CALENDAR
				? false
				: inputValue.indexOf('/') > -1 ||
				  inputValue.length === 0 ||
				  inputValue === 'Calendar' ||
				  inputValue === 'calendar' ||
				  showDupWarning,
		[inputValue, folder, showDupWarning]
	);
	const defaultColor = useMemo(
		() => find(colors, { label: iconColor.label }) ?? { label: '', value: '' },
		[colors, iconColor]
	);

	const [selectedColor, setSelectedColor] = useState<SelectItem[] | number | string | null>(
		defaultColor?.value
	);
	const defaultChecked = false;
	const onConfirm = useCallback(() => {
		if (inputValue) {
			dispatch(
				folderAction({
					id: folder.id,
					op: 'update',
					changes: omitBy(
						{
							parent: folder.parent?.id ?? FOLDERS.USER_ROOT,
							name: inputValue,
							color: selectedColor,
							excludeFreeBusy: freeBusy,
							checked,
							grant
						},
						isNull
					)
				})
			)
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				.then((res) => {
					if (res.type.includes('fulfilled')) {
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
			setInputValue('');
			setSelectedColor(0);
			setFreeBusy(false);
		}
	}, [
		checked,
		createSnackbar,
		dispatch,
		folder.id,
		folder.parent,
		freeBusy,
		grant,
		inputValue,
		onClose,
		selectedColor,
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
			)
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				.then((res) => {
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
	const title = useMemo(() => t('label.edit_access', 'Edit access'), [t]);

	const placeholder = useMemo(() => t('label.type_name_here', 'Calendar name'), [t]);

	return (
		<Container padding="0.5rem 0.5rem 1.5rem">
			<ModalHeader onClose={onClose} title={title} />
			<Container
				padding={{ top: 'small', bottom: 'small' }}
				mainAlignment="center"
				crossAlignment="flex-start"
				height="fit"
			>
				{folder?.id === FOLDERS.CALENDAR ? (
					<Tooltip
						label={t('cannot_edit_name', 'You cannot edit the name of a system calendar')}
						placement="top"
						maxWidth="fit"
					>
						<Input
							label={placeholder}
							backgroundColor="gray5"
							defaultValue={inputValue}
							onChange={(e): void => {
								setInputValue(e.target.value);
							}}
							disabled
						/>
					</Tooltip>
				) : (
					<Input
						label={placeholder}
						backgroundColor="gray5"
						defaultValue={inputValue}
						onChange={(e): void => {
							setInputValue(e.target.value);
						}}
					/>
				)}
			</Container>
			{showDupWarning && (
				<Padding all="small">
					<Text size="small" color="error">
						{t('folder.modal.new.duplicate_warning', 'Calendar with the same name already exists')}
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
						Type
					</Text>
					<Text>{t('label.calendar', 'Calendar')}</Text>
				</Row>
				<Row orientation="vertical" width="50%" crossAlignment="flex-start">
					<Text size="small" color="secondary">
						Appointments
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
					onChange={setSelectedColor}
					items={colors}
					selection={defaultColor}
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
					defaultChecked={defaultChecked}
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
						height="fit"
					>
						<Divider />
					</Container>
					<Container
						padding={{ top: 'small', bottom: 'small' }}
						mainAlignment="flex-start"
						crossAlignment="flex-start"
						orientation="horizontal"
						height="fit"
					>
						<Text weight="bold">{t('label.sharing_of_this_folder', 'Sharing of this folder')}</Text>
					</Container>
					{map(grant, (item, index) => (
						<Container
							orientation="horizontal"
							mainAlignment="flex-end"
							padding={{ bottom: 'small' }}
							key={index}
						>
							<GranteeInfo grant={item} hovered={hovered} />
							<Container
								orientation="horizontal"
								mainAlignment="flex-end"
								onMouseEnter={onMouseEnter}
								onMouseLeave={onMouseLeave}
								maxWidth="fit"
							>
								<Tooltip label={t('tooltip.edit', 'Edit share properties')} placement="top">
									<Button
										type="outlined"
										label={t('label.edit', 'Edit')}
										onClick={(): void => {
											onEdit(item);
										}}
										isSmall
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
										isSmall
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
										onClick={onResend}
										isSmall
									/>
								</Tooltip>
							</Container>
						</Container>
					))}
				</>
			)}
			<ModalFooter
				onConfirm={onConfirm}
				label={t('label.ok', 'OK')}
				secondaryAction={onShare}
				secondaryLabel={t('label.add_share', 'Add share')}
				secondaryBtnType="outlined"
				secondaryColor="primary"
				disabled={disabled}
			/>
		</Container>
	);
};
