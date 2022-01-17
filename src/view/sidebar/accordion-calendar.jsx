/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import styled, { css } from 'styled-components';
import {
	Checkbox,
	Container,
	Icon,
	IconButton,
	Padding,
	Responsive,
	Text,
	useScreenMode,
	Dropdown,
	ModalManagerContext,
	SnackbarManagerContext,
	Tooltip
} from '@zextras/zapp-ui';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { folderAction } from '../../store/actions/calendar-actions';
import { SharesInfoModal } from './shares-info-modal';
import { getFolder } from '../../store/actions/get-folder';
import { ShareCalendarModal } from './share-calendar-modal';
import { EditModal } from './edit-modal/edit-modal';
import { EmptyModal } from './empty-modal';
import { NewModal } from './new-modal';
import { DeleteModal } from './delete-modal';
import ShareCalendarUrlModal from './edit-modal/parts/share-calendar-url-modal';

function getKeyboardPreset(type, callback, ref = undefined) {
	function handleArrowUp(e) {
		const focusedElement = ref.current.querySelector('[tabindex]:focus');
		if (focusedElement) {
			const prevEl = focusedElement.previousElementSibling;
			if (prevEl) {
				prevEl.focus();
			} else {
				ref.current.querySelector('[tabindex]:last-child').focus();
			}
		} else {
			ref.current.querySelector('[tabindex]:first-child').focus();
		}
	}

	function handleArrowDown(e) {
		const focusedElement = ref.current.querySelector('[tabindex]:focus');
		if (focusedElement) {
			const nextEl = focusedElement.nextElementSibling;
			if (nextEl) {
				nextEl.focus();
			} else {
				ref.current.querySelector('[tabindex]:first-child').focus();
			}
		} else {
			ref.current.querySelector('[tabindex]:first-child').focus();
		}
	}

	const eventsArray = [];
	switch (type) {
		case 'listItem': {
			eventsArray.push({ type: 'keypress', callback, keys: ['Enter', 'NumpadEnter'] });
			break;
		}
		case 'button': {
			eventsArray.push({ type: 'keyup', callback, keys: ['Space'] });
			eventsArray.push({ type: 'keypress', callback: (e) => e.preventDefault(), keys: ['Space'] });
			eventsArray.push({ type: 'keypress', callback, keys: ['Enter', 'NumpadEnter'] });
			break;
		}
		case 'list': {
			eventsArray.push({ type: 'keydown', callback: handleArrowUp, keys: ['ArrowUp'] });
			eventsArray.push({ type: 'keydown', callback: handleArrowDown, keys: ['ArrowDown'] });
			break;
		}
		default:
			break;
	}
	return eventsArray;
}

function useKeyboard(ref, events) {
	const keyEvents = useMemo(
		() =>
			events.map(({ keys, callback, haveToPreventDefault = true }) => (e) => {
				if (!keys.length || keys.includes(e.key) || keys.includes(e.code)) {
					if (haveToPreventDefault) {
						e.preventDefault();
					}
					callback(e);
				}
			}),
		[events]
	);

	useEffect(() => {
		const saveRef = ref.current;
		if (saveRef != null) {
			keyEvents.forEach((keyEvent, index) => {
				saveRef.addEventListener(events[index].type, keyEvent);
			});
		}

		return () => {
			if (saveRef != null) {
				keyEvents.forEach((keyEvent, index) => {
					saveRef.removeEventListener(events[index].type, keyEvent);
				});
			}
		};
	}, [ref, events, keyEvents]);
}

function pseudoClasses(theme, color) {
	return css`
		transition: background 0.2s ease-out;
		&:focus {
			outline: none;
			background: ${theme.palette[color].focus};
		}
		&:hover {
			outline: none;
			background: ${theme.palette[color].hover};
		}
		&:active {
			outline: none;
			background: ${theme.palette[color].active};
		}
	`;
}

function useCombinedRefs(...refs) {
	const targetRef = useRef();
	useEffect(() => {
		refs.forEach((ref) => {
			if (!ref) return;

			if (typeof ref === 'function') {
				ref(targetRef.current);
			} else {
				// eslint-disable-next-line no-param-reassign
				// ref.current = targetRef.current;
			}
		});
	}, [refs]);
	return targetRef;
}

const AccordionContainerEl = styled(Container)`
	padding: ${(props) => `
		${props.level === 0 ? props.theme.sizes.padding.large : props.theme.sizes.padding.medium}
		${props.theme.sizes.padding.large}
		${props.level === 0 ? props.theme.sizes.padding.large : props.theme.sizes.padding.medium}
		calc(${props.theme.sizes.padding.large} + ${
		props.level > 1 ? props.theme.sizes.padding.medium : '0px'
	})
	`};
	${({ theme }) => pseudoClasses(theme, 'gray5')};
`;

let openDropdownId;

export const retrievePropertyFolder = (
	id,
	dispatch,
	folders,
	t,
	createModal,
	createSnackbar,
	allCalendars,
	totalAppointments
) => {
	const actions = [
		{
			id: 'new',
			icon: 'CalendarOutline',
			label: t('label.new_calendar', 'New calendar'),
			click: (e) => {
				if (e) {
					e.stopPropagation();
				}
				const closeModal = createModal(
					{
						children: <NewModal folders={folders} onClose={() => closeModal()} />
					},
					true
				);
			}
		},
		{
			id: 'moveToRoot',
			icon: 'MoveOutline',
			label: t('action.move_to_root', 'Move to root'),
			click: (e) => {
				if (e) {
					e.stopPropagation();
				}
				dispatch(folderAction({ id, op: 'move', changes: { parent: '1' } })).then((res) => {
					if (res.type.includes('fulfilled')) {
						createSnackbar({
							key: `calendar-moved-root`,
							replace: true,
							type: folders?.[id]?.parent === '3' ? 'success' : 'info',
							hideButton: true,
							label:
								folders?.[id]?.parent === '3'
									? t('label.error_try_again', 'Something went wrong, please try again')
									: t(
											'message.snackbar.calendar_moved_to_root_folder',
											'Calendar moved to Root folder'
									  ),
							autoHideTimeout: 3000
						});
					} else {
						createSnackbar({
							key: `calendar-moved-root-error`,
							replace: true,
							type: 'error',
							hideButton: true,
							label: t('label.error_try_again', 'Something went wrong, please try again'),
							autoHideTimeout: 3000
						});
					}
				});
			}
		},
		{
			id: 'emptyTrash',
			icon: 'SlashOutline',
			label: t('action.empty_trash', 'Empty Trash'),
			click: (e) => {
				if (e) {
					e.stopPropagation();
				}
				const closeModal = createModal(
					{
						children: <EmptyModal onClose={() => closeModal()} />
					},
					true
				);
			},
			disabled: id !== '3'
		},
		{
			id: 'edit',
			icon: 'Edit2Outline',
			label: t('action.edit_calendar_properties', 'Edit calendar properties'),
			click: (e) => {
				if (e) {
					e.stopPropagation();
				}
				const closeModal = createModal(
					{
						children: (
							<EditModal
								folder={id}
								folders={folders}
								grant={folders[id].acl?.grant}
								allCalendars={folders}
								totalAppointments={totalAppointments}
								onClose={() => closeModal()}
								t={t}
							/>
						),
						maxHeight: '70vh',
						size: 'medium'
					},
					true
				);
			}
		},
		{
			id: 'delete',
			icon: 'Trash2Outline',
			label: t('action.delete_calendar', 'Delete calendar'),
			click: (e) => {
				if (e) {
					e.stopPropagation();
				}
				const closeModal = createModal(
					{
						children: (
							<DeleteModal folder={id} allCalendars={folders} onClose={() => closeModal()} />
						)
					},
					true
				);
			}
		},
		{
			id: 'removeFromList',
			icon: 'CloseOutline',
			label: t('remove_from_this_list', 'Remove from this list'),
			click: (e) => {
				if (e) {
					e.stopPropagation();
					dispatch(folderAction({ id, op: 'delete' }));
				}
			}
		},
		{
			id: 'sharesInfo',
			icon: 'InfoOutline',
			label: t('shares_info', 'Shares Info'),
			click: (e) => {
				if (e) {
					e.stopPropagation();
				}
				dispatch(getFolder(id)).then((res) => {
					if (res.type.includes('fulfilled')) {
						const closeModal = createModal(
							{
								children: (
									<>
										<SharesInfoModal onClose={() => closeModal()} folder={res.payload.link} />
									</>
								)
							},
							true
						);
					}
				});
			}
		},
		{
			id: 'share',
			icon: 'SharedCalendarOutline',
			label: t('action.share_calendar', 'Share Calendar'),
			click: (e) => {
				const closeModal = createModal(
					{
						children: (
							<>
								<ShareCalendarModal
									folder={id}
									folders={folders}
									allCalendars={folders}
									totalAppointments={totalAppointments}
									closeFn={() => closeModal()}
									t={t}
								/>
							</>
						),
						maxHeight: '70vh'
					},
					true
				);
			}
		},
		{
			id: 'share_url',
			icon: 'Copy',
			label: t('action.calendar_access_share', 'Calendar’s access share'),
			disabled: !folders?.[id]?.acl?.grant,
			click: (e) => {
				const closeModal = createModal(
					{
						children: (
							<>
								<ShareCalendarUrlModal
									t={t}
									folder={id}
									onClose={() => closeModal()}
									folders={folders}
								/>
							</>
						),
						maxHeight: '70vh',
						size: 'medium'
					},
					true
				);
			}
		}
	];

	switch (id) {
		case '10':
			return actions
				.filter(
					(action) =>
						action.id !== 'emptyTrash' &&
						action.id !== 'removeFromList' &&
						action.id !== 'sharesInfo'
				)
				.map((action) =>
					action.id !== 'new' && action.id !== 'edit' && action.id !== 'share'
						? { ...action, disabled: true }
						: action
				);
		case 'all':
			return actions
				.filter(
					(action) =>
						action.id !== 'emptyTrash' &&
						action.id !== 'removeFromList' &&
						action.id !== 'sharesInfo'
				)
				.map((action) =>
					action.id !== 'new' || action.id === 'delete' ? { ...action, disabled: true } : action
				);
		// trash
		case '3':
			return actions
				.filter((action) => action.id !== 'removeFromList' && action.id !== 'sharesInfo')
				.map((action) => (action.id === 'emptyTrash' ? action : { ...action, disabled: true }));
		// customizable folders
		default:
			return folders?.[id]?.owner
				? actions
						.filter(
							(action) =>
								action.id === 'sharesInfo' || action.id === 'removeFromList' || action.id === 'edit'
						)
						.map((action) => {
							if (action.id === 'moveToRoot' || action.id === 'new') {
								return { ...action, disabled: true };
							}
							return action;
						})
				: actions
						.filter(
							(action) =>
								action.id !== 'emptyTrash' &&
								action.id !== 'removeFromList' &&
								action.id !== 'sharesInfo'
						)
						.map((action) => {
							if (folders?.[id]?.parent === '1' && action.id === 'moveToRoot') {
								return { ...action, disabled: true };
							}
							if (folders?.[id]?.parent === '3' && action.id === 'moveToRoot') {
								return { ...action, label: t('label.restore_calendar', 'Restore calendar') };
							}
							return action;
						});
	}
};

const CustomAccordion = React.forwardRef(function Accordion({ item }, ref) {
	const {
		id,
		name,
		hasChildren,
		expandOnIconClick,
		color,
		checked = undefined,
		check,
		level,
		open,
		folders,
		click = undefined,
		icon,
		allCalendars,
		totalAppointments,
		...rest
	} = item;
	const [isOpen, setIsOpen] = useState(open);
	const innerRef = useRef(undefined);
	const accordionRef = useCombinedRefs(ref, innerRef);
	const isMobile = useScreenMode() === 'mobile';
	const [contextMenuPosition, setContextMenuPosition] = useState({
		x: 0,
		y: 0,
		display: 'hidden'
	});
	const createModal = useContext(ModalManagerContext);
	const createSnackbar = useContext(SnackbarManagerContext);

	/* const toggleSnackbar = useCallback((show, msg, type) => {
		setSnackType(type || (show ? 'success' : 'error'));
		setSnackMsg(msg);
		setShowSnack(true);
	}, []); */

	const dispatch = useDispatch();
	const [t] = useTranslation();
	const handleClick = useCallback(
		(e) => {
			setIsOpen(true);
			if (isMobile && click) click(id);
		},
		[isMobile, click, id]
	);
	const expandOnIconClickCbk = useCallback(
		(e) => {
			e.stopPropagation();
			expandOnIconClick(e);
			setIsOpen((v) => !v);
		},
		[expandOnIconClick]
	);

	const keyEvents = useMemo(() => getKeyboardPreset('button', handleClick), [handleClick]);
	useKeyboard(accordionRef, keyEvents);

	const updateChecked = useCallback(
		(ev) => {
			ev.stopPropagation();
			check(!checked);
		},
		[check, checked]
	);

	const [openDropdown, setOpenDropdown] = useState(false);
	useEffect(() => {
		const close = () => {
			if (openDropdownId !== id) {
				setOpenDropdown(false);
			}
		};
		window.addEventListener('contextmenu', close);
		return () => {
			window.removeEventListener('contextmenu', close);
		};
	}, [id]);
	return (
		<>
			<Container
				orientation="vertical"
				width="fill"
				height="fit"
				background="gray5"
				onContextMenu={(e) => {
					e.preventDefault();
					dispatch(getFolder(id)).then(() => {
						setContextMenuPosition({ x: e.pageX, y: e.pageY });
						setOpenDropdown(true);
					});
					openDropdownId = id;
				}}
				// eslint-disable-next-line react/jsx-props-no-spreading
				{...rest}
			>
				<Tooltip label={name} placement="right" maxWidth="100%">
					<AccordionContainerEl
						ref={accordionRef}
						level={level}
						onClick={updateChecked}
						orientation="horizontal"
						width="fill"
						height="fit"
						mainAlignment="space-between"
						tabIndex={0}
					>
						<Container
							orientation="horizontal"
							mainAlignment="flex-start"
							padding={{ right: 'small' }}
							style={{ minWidth: 0, flexBasis: 0, flexGrow: 1 }}
						>
							<Responsive mode="desktop">
								<Padding right="medium">
									<Checkbox value={checked} onClick={updateChecked} iconColor="primary" />
								</Padding>
							</Responsive>

							<Padding right="small">
								<Icon icon={icon} customColor={color?.color} size="large" />
							</Padding>
							<Text size="large" weight="bold" style={{ minWidth: 0, flexBasis: 0, flexGrow: 1 }}>
								{name}
							</Text>
						</Container>
						{hasChildren ? (
							<IconButton
								customSize={{ iconSize: 'small', paddingSize: 'small' }}
								onClick={expandOnIconClickCbk}
								icon={isOpen ? 'ArrowIosUpward' : 'ArrowIosDownward'}
								style={{ cursor: 'pointer' }}
							/>
						) : null}
					</AccordionContainerEl>
				</Tooltip>
			</Container>

			<Dropdown
				style={{
					top: contextMenuPosition.y,
					left: contextMenuPosition.x,
					position: 'fixed',
					display: 'block'
				}}
				items={retrievePropertyFolder(
					id,
					dispatch,
					folders,
					t,
					createModal,
					createSnackbar,
					allCalendars,
					totalAppointments
				)}
				forceOpen={openDropdown}
				onClose={() => {
					setOpenDropdown(false);
				}}
				width="fit"
				placement="bottom"
				disabled
			>
				<div />
			</Dropdown>
		</>
	);
});

export default CustomAccordion;
