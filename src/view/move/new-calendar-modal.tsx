/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement, useCallback, useMemo, useState } from 'react';

import {
	Container,
	Input,
	Padding,
	Select,
	Text,
	Checkbox,
	Row,
	Icon,
	SelectItem,
	SelectProps,
	useSnackbar
} from '@zextras/carbonio-design-system';
import { FOLDERS } from '@zextras/carbonio-shell-ui';
import { includes, map } from 'lodash';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { useFoldersMapByRoot, useRoot } from '../../carbonio-ui-commons/store/zustand/folder';
import { hasId } from '../../carbonio-ui-commons/worker/handle-message';
import ModalFooter from '../../commons/modal-footer';
import { ModalHeader } from '../../commons/modal-header';
import { CALENDARS_STANDARD_COLORS } from '../../constants/calendar';
import { createCalendar } from '../../store/actions/create-calendar';
import { EventType } from '../../types/event';

const Square = styled.div`
	width: 1.125rem;
	height: 1.125rem;
	position: relative;
	top: -0.1875rem;
	border: 0.0625rem solid ${({ theme }): string => theme.palette.gray2.regular};
	background: ${({ color }): string | undefined => color};
	border-radius: 0.25rem;
`;

const ColorContainer = styled(Container)`
	border-bottom: 0.0625rem solid ${({ theme }): string => theme.palette.gray2.regular};
`;
const TextUpperCase = styled(Text)`
	text-transform: capitalize;
`;

const LabelFactory: SelectProps['LabelFactory'] = ({
	selected,
	label,
	open,
	focus
}): ReactElement => (
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
				<TextUpperCase>{selected?.[0].label}</TextUpperCase>
			</Row>
			<Padding right="small">
				<Square color={CALENDARS_STANDARD_COLORS[Number(selected[0].value)].color} />
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
const getStatusItems = (): SelectItem[] =>
	CALENDARS_STANDARD_COLORS.map((el, index) => ({
		background: el.background,
		label: el.label ?? '',
		value: index.toString(),
		customComponent: (
			<Container width="100%" mainAlignment="space-between" orientation="horizontal" height="fit">
				<Padding left="small">
					<TextUpperCase>{el.label}</TextUpperCase>
				</Padding>
				<Padding right="small">
					<Square color={el.color} />
				</Padding>
			</Container>
		)
	}));

type ActionArgs = {
	inviteId: string;
	l: string;
	id: string;
	destinationCalendarName: string;
};

type NewModalProps = {
	toggleModal?: () => void;
	onClose: () => void;
	event?: EventType;
	folderId: string;
	action?: (arg: ActionArgs) => void;
};

export const NewModal = ({
	onClose,
	toggleModal,
	event,
	action,
	folderId
}: NewModalProps): ReactElement => {
	const [t] = useTranslation();
	const [inputValue, setInputValue] = useState('');
	const [freeBusy, setFreeBusy] = useState(false);
	const toggleFreeBusy = useCallback(() => setFreeBusy((c) => !c), []);
	const colors = useMemo(() => getStatusItems(), []);
	const [selectedColor, setSelectedColor] = useState(0);
	const createSnackbar = useSnackbar();
	const root = useRoot(folderId);

	const folders = useFoldersMapByRoot(root?.id ?? '1');
	const folderArray = useMemo(() => map(folders, (f) => f.name), [folders]);
	const showDupWarning = useMemo(
		() => includes(folderArray, inputValue),
		[inputValue, folderArray]
	);
	const disabled = useMemo(
		() =>
			inputValue.indexOf('/') > -1 ||
			inputValue.length === 0 ||
			inputValue === 'Calendar' ||
			inputValue === 'calendar' ||
			showDupWarning,
		[inputValue, showDupWarning]
	);

	const onConfirm = (): void => {
		if (inputValue) {
			createCalendar({
				parent: root?.id ?? '1',
				name: inputValue,
				color: selectedColor,
				excludeFreeBusy: freeBusy
			}).then((newCalendarRes) => {
				if (!newCalendarRes.Fault) {
					action &&
						event &&
						action({
							inviteId: event.resource.inviteId,
							l: newCalendarRes.id,
							destinationCalendarName: newCalendarRes.name,
							id: event.resource.id
						});
					createSnackbar({
						key: `new`,
						replace: true,
						type: 'success',
						label: t('message.snackbar.new_calendar_created', 'New calendar created'),
						autoHideTimeout: 3000,
						hideButton: true
					});
					onClose();
				} else {
					createSnackbar({
						key: `move`,
						replace: true,
						type: 'error',
						label: t('label.error_try_again', 'Something went wrong, please try again'),
						autoHideTimeout: 3000,
						hideButton: true
					});
					onClose();
				}
			});
		}
		setInputValue('');
		setSelectedColor(0);
		setFreeBusy(false);
		onClose();
	};

	const onCloseModal = useCallback(() => {
		setInputValue('');
		setSelectedColor(0);
		setFreeBusy(false);
		onClose();
	}, [onClose]);

	const placeholder = useMemo(() => t('label.type_name_here', 'Calendar name'), [t]);

	// eslint-disable-next-line @typescript-eslint/no-empty-function
	return (
		<Container
			padding={{ all: 'small' }}
			mainAlignment="center"
			crossAlignment="flex-start"
			height="fit"
		>
			<ModalHeader
				title={t('folder.modal.new.title2', 'New calendar creation')}
				onClose={onCloseModal}
			/>
			<Input
				label={placeholder}
				backgroundColor="gray5"
				value={inputValue}
				onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
					setInputValue(e.target.value);
				}}
			/>
			{showDupWarning && (
				<Padding all="small">
					<Text size="small" color="error">
						{t('folder.modal.new.duplicate_warning', 'Calendar with the same name already exists')}
					</Text>
				</Padding>
			)}
			<Padding vertical="medium" />
			<Select
				label={'Select color'}
				onChange={(value): void => {
					if (value) {
						setSelectedColor(parseInt(value, 10));
					}
				}}
				items={colors}
				defaultSelection={colors[0]}
				LabelFactory={LabelFactory}
			/>
			<Padding vertical="medium" />
			<Checkbox
				value={freeBusy}
				onClick={toggleFreeBusy}
				label={t(
					'label.exclude_free_busy',
					'Exclude this calendar when reporting the free/busy times'
				)}
			/>
			<ModalFooter
				onConfirm={onConfirm}
				secondaryAction={toggleModal}
				secondaryLabel={t('folder.modal.footer.go_back', 'Go back')}
				label={
					event && hasId(event.resource.calendar, FOLDERS.TRASH)
						? t('folder.modal.restore.footer', 'Create and Restore')
						: t('label.create', 'Create')
				}
				disabled={disabled}
			/>
		</Container>
	);
};
