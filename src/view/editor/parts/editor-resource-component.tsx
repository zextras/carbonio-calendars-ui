/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { ReactElement, useCallback, useMemo, useRef, useState } from 'react';

import {
	ChipAction,
	ChipInput,
	ChipInputProps,
	ChipItem,
	Container,
	DropdownItem,
	KeyboardPresetObj,
	Theme,
	useKeyboard
} from '@zextras/carbonio-design-system';
import { find } from 'lodash';
import styled from 'styled-components';

import {
	EditorAvailabilityWarningRow,
	getIsBusyAtTimeOfTheEvent
} from './editor-availability-warning-row';
import { generateResourceId, getDuplicateResourceIds, isValidResource } from './utils';
import { useAttendeesAvailability } from '../../../hooks/use-attendees-availability';
import { useAppSelector } from '../../../store/redux/hooks';
import {
	selectEditorAllDay,
	selectEditorEnd,
	selectEditorStart,
	selectEditorUid
} from '../../../store/selectors/editor';
import { Resource } from '../../../types/editor';
import { Contact } from '../../../types/soap/soap-actions';

interface SkeletonTileProps {
	$width?: string;
	$height?: string;
	$radius?: string;
}
type ResourceInputOption = DropdownItem & { value?: Resource };

const SkeletonTile = styled.div<SkeletonTileProps>`
	width: ${({ $width }): string => $width ?? '1rem'};
	max-width: ${({ $width }): string => $width ?? '1rem'};
	min-width: ${({ $width }): string => $width ?? '1rem'};
	height: ${({ $height }): string => $height ?? '1rem'};
	max-height: ${({ $height }): string => $height ?? '1rem'};
	min-height: ${({ $height }): string => $height ?? '1rem'};
	border-radius: ${({ $radius }): string => $radius ?? '0.125rem'};
	background: ${({ theme }): string => theme.palette.gray2.regular};
`;

const Loader = (): ReactElement => (
	<Container
		data-testid={'dropdown-options-loader'}
		orientation="horizontal"
		mainAlignment="flex-start"
		crossAlignment="center"
		minWidth="16rem"
		minHeight="2rem"
	>
		<SkeletonTile $radius="50%" $width="2rem" $height="2rem" />
		<Container orientation="vertical" crossAlignment="flex-start" padding={{ left: 'small' }}>
			<SkeletonTile
				$radius="0.25rem"
				$width={`${Math.random() * 9.375 + 4}rem`}
				$height="0.875rem"
				style={{ marginBottom: '0.25rem' }}
			/>
			<SkeletonTile
				$radius="0.25rem"
				$width={`${Math.random() * 9.375 + 4}rem`}
				$height="0.75rem"
			/>
		</Container>
	</Container>
);

export const normalizeResources = (r: Contact): Resource => ({
	id: r.id,
	label: r.fileAsStr,
	email: r._attrs.email,
	type: r._attrs.zimbraCalResType
});

interface EditorResourceComponentProps {
	editorId: string;
	onChange: (items: Array<Resource>) => void;
	onSearchOptions: (stringToSearch: string) => Promise<Array<ResourceInputOption>>;
	placeholder: string;
	resourcesValue: Array<Resource>;
	warningLabel: string;
	disabled?: boolean;
	singleWarningLabel: string;
	invalidInputErrorLabel: string;
	duplicateChipsErrorLabel: string;
}

type ResourceChipItem = ChipItem<Resource> & {
	avatarIcon?: keyof Theme['icons'];
	avatarBackground?: keyof Theme['palette'];
	avatarColor?: string;
	error?: boolean;
};

export const EditorResourceComponent = ({
	editorId,
	onChange,
	placeholder,
	resourcesValue,
	onSearchOptions,
	warningLabel,
	disabled,
	singleWarningLabel,
	invalidInputErrorLabel,
	duplicateChipsErrorLabel
}: EditorResourceComponentProps): JSX.Element | null => {
	const start = useAppSelector(selectEditorStart(editorId));
	const end = useAppSelector(selectEditorEnd(editorId));
	const allDay = useAppSelector(selectEditorAllDay(editorId));
	const uid = useAppSelector(selectEditorUid(editorId));
	const [options, setOptions] = useState<Array<ResourceInputOption>>([]);
	const inputRef = useRef<HTMLInputElement>(null);
	const [editingResource, setEditingResource] = useState<Resource | null>(null);
	const attendeesAvailabilityList = useAttendeesAvailability(start, resourcesValue, uid);

	const resourcesAreValid = useMemo(
		() => resourcesValue.every((resource) => isValidResource(resource)),
		[resourcesValue]
	);

	const duplicateResourceIds = useMemo(
		() => getDuplicateResourceIds(resourcesValue),
		[resourcesValue]
	);

	const [hasError, setHasError] = useState(!resourcesAreValid);
	const [hasDuplicateValidChips, setHasDuplicateValidChips] = useState(
		duplicateResourceIds.size > 0
	);

	const handleAdd = useCallback((valueToAdd: unknown): ResourceChipItem => {
		setEditingResource(null);

		const isResourceOption = (obj: unknown): obj is Resource =>
			typeof obj === 'object' &&
			obj !== null &&
			'id' in obj &&
			'label' in obj &&
			'email' in obj &&
			'type' in obj;

		const isStringInput = (input: unknown): input is string =>
			typeof input === 'string' && input.trim() !== '';

		let label: string;
		let resource: Resource;
		if (isResourceOption(valueToAdd)) {
			resource = valueToAdd;
			label = resource.label;
		} else if (isStringInput(valueToAdd)) {
			label = valueToAdd.trim();
			resource = { email: '', label };
		} else {
			label = 'Invalid input';
			resource = { email: '', label };
		}
		const resourceId = resource.id ?? generateResourceId(resource);
		resource = { ...resource, id: resourceId };
		const isValid = isValidResource(resource);

		return {
			label,
			id: resourceId,
			value: resource,
			...(isValid ? {} : { background: 'error', error: true })
		};
	}, []);

	const loadingOption = useMemo(
		() => [
			{
				id: 'loading',
				label: 'loading',
				customComponent: <Loader />,
				disabled: true
			}
		],
		[]
	);

	const handleInputType = useCallback<NonNullable<ChipInputProps<Resource>['onInputType']>>(
		(e) => {
			if (e.textContent && e.textContent !== '') {
				setOptions(loadingOption);
				onSearchOptions(e.textContent)
					.then((receivedOptions) => {
						setOptions(receivedOptions);
					})
					.catch((reason) => {
						setOptions([]);
						console.warn(reason.error ?? reason);
					});
			} else {
				setOptions([]);
			}
		},
		[loadingOption, onSearchOptions]
	);

	const handleChange = useCallback(
		(newChips: ChipItem<Resource>[]): void => {
			if (!onChange) return;

			setHasError(newChips.some((item) => !isValidResource(item.value)));
			onChange(newChips.map((chip) => chip.value as Resource));
		},
		[onChange]
	);

	const handleEditResource = useCallback((resource: Resource) => {
		setEditingResource(resource);

		if (inputRef.current) {
			inputRef.current.value = resource.label;
			inputRef.current.style.width = inputRef.current.value
				? `${inputRef.current.scrollWidth}px`
				: '';
			inputRef.current.focus();
		}
	}, []);

	const buildResourceChipItem = useCallback(
		(resource: Resource): ResourceChipItem => {
			const isValid = isValidResource(resource);
			const key = resource.id ?? resource.email;
			const isDuplicate = isValid && duplicateResourceIds.has(key);
			setHasDuplicateValidChips(isDuplicate);

			const actions: ChipAction[] = [
				{
					id: 'edit',
					icon: 'EditOutline',
					type: 'button',
					label: 'Edit',
					onClick: (event): void => {
						event.stopPropagation();
						handleEditResource(resource);
					}
				}
			];

			if (isDuplicate) {
				actions.unshift({
					id: 'duplicate',
					label: 'Duplicate resource',
					color: 'warning',
					type: 'icon',
					icon: 'AlertTriangle'
				});
			}

			return {
				...resource,
				id: resource.id ?? generateResourceId(resource),
				value: resource,
				background: isValid ? 'gray3' : 'error',
				color: isValid ? 'text' : 'gray6',
				avatarColor: isValid ? 'gray0' : 'gray6',
				avatarBackground: isValid ? 'transparent' : 'error',
				actions,
				error: !isValid
			};
		},
		[duplicateResourceIds, handleEditResource]
	);

	const resourceAvailability: ResourceChipItem[] = useMemo(() => {
		if (!resourcesValue?.length) return [];

		return resourcesValue
			.filter((r) => !editingResource || r.id !== editingResource.id)
			.map((resource) => {
				const chip = buildResourceChipItem(resource);

				const roomInList = find(attendeesAvailabilityList, ['email', resource.email]);
				const isBusy =
					roomInList &&
					getIsBusyAtTimeOfTheEvent(roomInList, start, end, attendeesAvailabilityList, allDay);

				if (isBusy) {
					return {
						...chip,
						actions: [
							{
								id: 'unavailable',
								label: singleWarningLabel,
								color: 'error',
								type: 'icon',
								icon: 'AlertTriangle'
							}
						]
					};
				}

				return chip;
			});
	}, [
		allDay,
		attendeesAvailabilityList,
		buildResourceChipItem,
		editingResource,
		end,
		resourcesValue,
		singleWarningLabel,
		start
	]);

	const onPressingEnterSelectFirstOption = useMemo<KeyboardPresetObj[]>(
		() => [
			{
				type: 'keydown',
				callback: (): void => {
					if (options?.[0]?.value && handleChange && options?.[0]?.id !== 'loading') {
						const { value } = options[0];
						handleChange([...resourceAvailability, buildResourceChipItem(value)]);
						if (inputRef.current) {
							inputRef.current.value = '';
							setOptions([]);
						}
					}
				},
				keys: [{ key: 'Enter', ctrlKey: true }],
				haveToPreventDefault: true
			}
		],
		[buildResourceChipItem, handleChange, options, resourceAvailability]
	);

	useKeyboard(inputRef, onPressingEnterSelectFirstOption);

	const chipInputDescription = useMemo(() => {
		if (hasError) {
			return invalidInputErrorLabel;
		}
		if (hasDuplicateValidChips) {
			return duplicateChipsErrorLabel;
		}
		return undefined;
	}, [hasError, hasDuplicateValidChips, invalidInputErrorLabel, duplicateChipsErrorLabel]);

	return (
		<Container width="100%" height="100%">
			<ChipInput
				inputRef={inputRef}
				disabled={disabled}
				confirmChipOnBlur
				createChipOnPaste={false}
				disableOptions
				placeholder={placeholder}
				value={resourceAvailability}
				options={options}
				onChange={handleChange}
				onAdd={handleAdd}
				separators={[
					{ code: 'Enter', ctrlKey: false },
					{ code: 'NumpadEnter', ctrlKey: false }
				]}
				onInputType={handleInputType}
				hasError={hasError}
				description={chipInputDescription}
			/>
			<EditorAvailabilityWarningRow
				label={warningLabel}
				list={attendeesAvailabilityList}
				items={resourceAvailability}
				editorId={editorId}
			/>
		</Container>
	);
};
