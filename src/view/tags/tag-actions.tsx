/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement, SyntheticEvent, useCallback, useMemo, useState } from 'react';

import {
	Button,
	Checkbox,
	CreateModalFn,
	CreateSnackbarFn,
	Icon,
	Padding,
	Row,
	Text,
	useModal,
	useSnackbar
} from '@zextras/carbonio-design-system';
import { ZIMBRA_STANDARD_COLORS, useTags, Tag, t } from '@zextras/carbonio-shell-ui';
import { differenceBy, includes, noop, reduce } from 'lodash';

import CreateUpdateTagModal from './create-update-tag-modal';
import DeleteTagModal from '../../carbonio-ui-commons/components/tags/delete-tag-modal';
import { ItemType } from '../../carbonio-ui-commons/types/tags';
import { itemActionRequest } from '../../soap/item-action-request';
import { StoreProvider } from '../../store/redux';
import { ActionsProps } from '../../types/actions';
import { EventActionsEnum, EventActionsId } from '../../types/enums/event-actions-enum';
import { EventType } from '../../types/event';
import { TagType } from '../../types/tags';

export type ReturnType = {
	id: EventActionsId;
	icon: string;
	label: string;
	onClick?: (arg: React.SyntheticEvent<EventTarget> | KeyboardEvent) => void;
	items?: Array<{
		customComponent: ReactElement;
		id: string;
		icon: string;
		label: string;
	}>;
};

export type ArgumentType = {
	createModal?: CreateModalFn;
	createSnackbar?: CreateSnackbarFn;
	items?: ReturnType;
	tag?: ItemType;
};

const labelTag: string = t('label.tags', 'Tags');

export const createTag = ({ createModal }: ArgumentType): ReturnType => ({
	id: EventActionsEnum.NEW_TAG,
	icon: 'TagOutline',
	label: t('label.create_tag', 'Create Tag'),
	onClick: (e): void => {
		if (e) {
			e.stopPropagation();
		}

		const closeModal = createModal?.(
			{
				children: (
					<StoreProvider>
						<CreateUpdateTagModal onClose={(): void => closeModal?.()} />
					</StoreProvider>
				)
			},
			true
		);
	}
});

export const createAndApplyTag = ({
	context,
	event
}: {
	context: ActionsProps['context'];
	event: EventType;
}): ReturnType => ({
	id: EventActionsEnum.NEW_TAG,
	icon: 'TagOutline',
	label: t('label.create_tag', 'Create Tag'),
	onClick: (e: SyntheticEvent<EventTarget> | KeyboardEvent): void => {
		if (e) {
			e.stopPropagation();
		}
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		const closeModal = context.createModal(
			{
				children: (
					<StoreProvider>
						<CreateUpdateTagModal onClose={(): void => closeModal()} event={event} />
					</StoreProvider>
				)
			},
			true
		);
	}
});
export const editTag = ({ createModal, tag }: ArgumentType): ReturnType => ({
	id: EventActionsEnum.EDIT_TAGS,
	icon: 'Edit2Outline',
	label: t('label.edit_tag', 'Edit Tag'),
	onClick: (e): void => {
		if (e) {
			e.stopPropagation();
		}
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		const closeModal = createModal(
			{
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				children: (
					<StoreProvider>
						<CreateUpdateTagModal onClose={(): void => closeModal()} tag={tag} editMode />
					</StoreProvider>
				)
			},
			true
		);
	}
});

export const deleteTag = ({ createModal, tag }: ArgumentType): ReturnType => ({
	id: EventActionsEnum.DELETE_TAG,
	icon: 'Untag',
	label: t('label.delete_tag', 'Delete Tag'),
	onClick: (e): void => {
		if (e) {
			e.stopPropagation();
		}
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		const closeModal = createModal(
			{
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				children: (
					<StoreProvider>
						<DeleteTagModal onClose={(): void => closeModal()} tag={tag} />
					</StoreProvider>
				)
			},
			true
		);
	}
});

export const TagsDropdownItem = ({ tag, event }: { tag: Tag; event: EventType }): ReactElement => {
	const createSnackbar = useSnackbar();

	const [checked, setChecked] = useState(includes(event.resource.tags, tag.id));
	const [isHovering, setIsHovering] = useState(false);
	const toggleCheck = useCallback(
		(value) => {
			setChecked((c) => !c);

			itemActionRequest({
				op: value ? '!tag' : 'tag',
				id: event.resource.id,
				tagName: tag.name
			})
				.then(() => {
					createSnackbar({
						key: `tag`,
						replace: true,
						hideButton: true,
						type: 'info',
						label: value
							? t('snackbar.tag_removed', { tag: tag.name, defaultValue: '"{{tag}}" tag removed' })
							: t('snackbar.tag_applied', {
									tag: tag.name,
									defaultValue: '"{{tag}}" tag applied'
								}),
						autoHideTimeout: 3000
					});
				})
				.catch(() => {
					createSnackbar({
						key: `tag`,
						replace: true,
						type: 'error',
						label: t('label.error_try_again', 'Something went wrong, please try again'),
						autoHideTimeout: 3000,
						hideButton: true
					});
				});
		},
		[event?.resource?.id, createSnackbar, tag.name]
	);
	const tagColor = useMemo(() => ZIMBRA_STANDARD_COLORS[tag.color || 0].hex, [tag.color]);
	const tagIcon = useMemo(() => (checked ? 'Tag' : 'TagOutline'), [checked]);
	const tagIconOnHovered = useMemo(() => (checked ? 'Untag' : 'Tag'), [checked]);

	return (
		<Row
			takeAvailableSpace
			mainAlignment="flex-start"
			onClick={(): void => toggleCheck(checked)}
			onMouseEnter={(): void => setIsHovering(true)}
			onMouseLeave={(): void => setIsHovering(false)}
		>
			<Padding right="small">
				<Checkbox value={checked} />
			</Padding>
			<Row takeAvailableSpace mainAlignment="space-between">
				<Row takeAvailableSpace mainAlignment="flex-start">
					<Text>{tag.name}</Text>
				</Row>
				<Row mainAlignment="flex-end">
					<Icon icon={isHovering ? tagIconOnHovered : tagIcon} color={tagColor} />
				</Row>
			</Row>
		</Row>
	);
};

export const applyTag = ({
	context,
	event
}: {
	event: EventType;
	context: ActionsProps['context'];
}): {
	id: EventActionsId;
	items: TagType[];
	onClick: () => void;
	customComponent?: ReactElement;
	tooltipLabel: string;
	label: string;
	icon: string;
	disabled: boolean;
} => {
	const tagItem = reduce(
		context.tags,
		(
			acc: Array<{
				id: string;
				label?: string;
				icon?: string;
				keepOpen: boolean;
				customComponent: ReactElement;
			}>,
			v
		) => {
			const item = {
				id: v.id,
				label: v.name,
				icon: 'TagOutline',
				keepOpen: true,
				customComponent: <TagsDropdownItem tag={v} event={event} />
			};
			acc.push(item);
			return acc;
		},
		[]
	);

	tagItem.push({
		id: 'new_tag',
		keepOpen: true,
		customComponent: (
			<Button
				label={t('label.new_tag', 'New Tag')}
				type="outlined"
				width="fill"
				size="small"
				onClick={(): void => context.createAndApplyTag({ context, event }).onClick()}
			/>
		)
	});
	return event.haveWriteAccess
		? {
				id: EventActionsEnum.APPLY_TAG,
				items: tagItem,
				onClick: noop,
				icon: 'TagsMoreOutline',
				label: labelTag,
				disabled: false,
				tooltipLabel: t('label.no_rights', 'You do not have permission to perform this action'),
				customComponent: (
					<Row takeAvailableSpace mainAlignment="flex-start">
						<Padding right="small">
							<Icon icon="TagsMoreOutline" />
						</Padding>
						<Row takeAvailableSpace mainAlignment="space-between">
							<Padding right="small">
								<Text>{labelTag}</Text>
							</Padding>
						</Row>
					</Row>
				)
			}
		: {
				id: EventActionsEnum.APPLY_TAG,
				items: [],
				onClick: noop,
				tooltipLabel: t('label.no_rights', 'You do not have permission to perform this action'),
				label: labelTag,
				icon: 'TagsMoreOutline',
				disabled: true
			};
};

export const useGetTagsActions = ({ tag }: ArgumentType): Array<ReturnType> => {
	const createModal = useModal();
	const createSnackbar = useSnackbar();
	return useMemo(
		() => [
			createTag({ createModal }),
			editTag({ createModal, tag }),
			deleteTag({ tag, createSnackbar, createModal })
		],
		[createModal, createSnackbar, tag]
	);
};

export const useTagsArrayFromStore = (): Array<TagType> => {
	const tagsFromStore = useTags();
	return useMemo(
		() =>
			reduce(
				tagsFromStore,
				(acc: Array<TagType>, v: TagType) => {
					acc.push(v);
					return acc;
				},
				[]
			),
		[tagsFromStore]
	);
};

export const useTagExist = (tags: Array<Tag>): boolean => {
	const tagsArrayFromStore = useTagsArrayFromStore();
	return useMemo(
		() => tags?.length > 0 && differenceBy(tags, tagsArrayFromStore, 'id')?.length === 0,
		[tags, tagsArrayFromStore]
	);
};
