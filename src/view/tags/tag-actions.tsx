/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
	ButtonOld as Button,
	Checkbox,
	Icon,
	ModalManagerContext,
	Padding,
	Row,
	SnackbarManagerContext,
	Text
} from '@zextras/carbonio-design-system';
import React, {
	ReactElement,
	SyntheticEvent,
	useCallback,
	useContext,
	useMemo,
	useState
} from 'react';

import { Tag, Tags, ZIMBRA_STANDARD_COLORS, t, useTags } from '@zextras/carbonio-shell-ui';
import { find, includes, reduce } from 'lodash';
import { Dispatch } from 'redux';
import DeleteTagModal from '../../carbonio-ui-commons/components/tags/delete-tag-modal';
import { TagsActionsType } from '../../carbonio-ui-commons/constants';
import { ItemType } from '../../carbonio-ui-commons/types/tags';
import { itemActionRequest } from '../../soap/item-action-request';
import { StoreProvider } from '../../store/redux';
import { EventType } from '../../types/event';
import { TagType } from '../../types/tags';
import CreateUpdateTagModal from '../../carbonio-ui-commons/components/tags/create-update-tag-modal';

export type ReturnType = {
	id: string;
	icon: string;
	label: string;
	click?: (arg: React.SyntheticEvent<EventTarget> | KeyboardEvent) => void;
	items?: Array<{
		customComponent: ReactElement;
		id: string;
		icon: string;
		label: string;
	}>;
};

export type TagsFromStoreType = Record<string, Tag>;

export type ArgumentType = {
	createModal?: unknown;
	createSnackbar?: unknown;
	items?: ReturnType;
	tag?: ItemType;
};

export type ContextType = {
	createAndApplyTag: (arg: any) => any;
	createModal: any;
	createSnackbar: unknown;
	dispatch: Dispatch;
	replaceHistory: (arg: any) => void;
	tags: Tags;
};
export const createTag = ({ createModal }: ArgumentType): ReturnType => ({
	id: TagsActionsType.NEW,
	icon: 'TagOutline',
	label: t('label.create_tag', 'Create Tag'),
	click: (e): void => {
		if (e) {
			e.stopPropagation();
		}
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		const closeModal = createModal(
			{
				children: (
					<StoreProvider>
						<CreateUpdateTagModal onClose={(): void => closeModal()} />
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
	context: ContextType;
	event: EventType;
}): ReturnType => ({
	id: TagsActionsType.NEW,
	icon: 'TagOutline',
	label: t('label.create_tag', 'Create Tag'),
	click: (e: SyntheticEvent<EventTarget> | KeyboardEvent): void => {
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
	id: TagsActionsType.EDIT,
	icon: 'Edit2Outline',
	label: t('label.edit_tag', 'Edit Tag'),
	click: (e): void => {
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
	id: TagsActionsType.DELETE,
	icon: 'Untag',
	label: t('label.delete_tag', 'Delete Tag'),
	click: (e): void => {
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
	const createSnackbar = useContext(SnackbarManagerContext);

	const [checked, setChecked] = useState(includes(event.resource.tags, tag.id));
	const [isHovering, setIsHovering] = useState(false);
	const toggleCheck = useCallback(
		(value) => {
			setChecked((c) => !c);

			itemActionRequest({
				op: value ? '!tag' : 'tag',
				inviteId: event.resource.id,
				tagName: tag.name
			})
				.then(() => {
					// eslint-disable-next-line @typescript-eslint/ban-ts-comment
					// @ts-ignore
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
					// eslint-disable-next-line @typescript-eslint/ban-ts-comment
					// @ts-ignore
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
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
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
	context: ContextType;
}):
	| {
			id: TagsActionsType.Apply;
			items: Array<{
				id: string;
				label?: string;
				icon?: string;
				keepOpen: boolean;
				customComponent: React.ReactElement;
			}>;
			customComponent: JSX.Element;
	  }
	| { icon: string; disabled: boolean; id: TagsActionsType.Apply; label: string; items: any[] } => {
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
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
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
				size="fill"
				isSmall
				onClick={(): void => context.createAndApplyTag({ context, event }).click()}
			/>
		)
	});
	return event.haveWriteAccess
		? {
				id: TagsActionsType.Apply,
				items: tagItem,
				customComponent: (
					<Row takeAvailableSpace mainAlignment="flex-start">
						<Padding right="small">
							<Icon icon="TagsMoreOutline" />
						</Padding>
						<Row takeAvailableSpace mainAlignment="space-between">
							<Padding right="small">
								<Text>{t('label.tags', 'Tags')}</Text>
							</Padding>
						</Row>
					</Row>
				)
		  }
		: {
				id: TagsActionsType.Apply,
				items: [],
				label: t('label.tags', 'Tags'),
				icon: 'TagsMoreOutline',
				disabled: true
		  };
};

export const useGetTagsActions = ({ tag }: ArgumentType): Array<ReturnType> => {
	const createModal = useContext(ModalManagerContext);
	const createSnackbar = useContext(SnackbarManagerContext);
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
				(acc: Array<TagType>, v: any) => {
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
		() =>
			reduce(
				tags,
				(acc: boolean, v: Tag) => {
					let tmp = false;
					if (find(tagsArrayFromStore, { id: v?.id })) tmp = true;
					return tmp;
				},
				false
			),
		[tags, tagsArrayFromStore]
	);
};
