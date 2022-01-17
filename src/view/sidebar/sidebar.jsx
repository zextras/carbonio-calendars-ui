/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
/* eslint no-param-reassign: ["error", {"props": true, "ignorePropertyModificationsFor": ["c"] }] */
import React, { useCallback, useContext, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { remove, forEach, map, filter, every, uniqWith, isEqual } from 'lodash';
import { useTranslation } from 'react-i18next';
import { Accordion, Button, Container, ModalManagerContext } from '@zextras/carbonio-design-system';
import CustomAccordion from './accordion-calendar';
import CollapsedSidebarItems from './collapsed-sidebar-items';
import {
	selectAllCalendars,
	selectCalendars,
	selectEnd,
	selectStart
} from '../../store/selectors/calendars';
import { folderAction } from '../../store/actions/calendar-actions';
import { setSearchRange } from '../../store/actions/set-search-range';
import { selectAllAppointments } from '../../store/selectors/appointments';
import { getShareInfo } from '../../store/actions/get-share-info';
import { SharesModal } from './shares-modal';

const nest = (items, id) =>
	map(
		filter(items, (item) => item.parent === id),
		(item) => ({
			...item,
			absParent: item.absParent ?? item.parent,
			items: nest(items, item.id)
		})
	);

const foreachForTree = (item, fn) => {
	fn(item);
	forEach(item.items, (it) => foreachForTree(it, fn));
};

const SharesItem = ({ item }) => (
	<Container
		width="fill"
		mainAlignment="center"
		orientation="horizontal"
		style={{ padding: '14px 16px' }}
	>
		<Button
			type="outlined"
			label={item.label}
			color="primary"
			size="fill"
			onClick={() =>
				item?.context?.dispatch(getShareInfo()).then((res) => {
					if (res.type.includes('fulfilled')) {
						const calendars = uniqWith(
							filter(res?.payload?.share ?? [], ['view', 'appointment']),
							isEqual
						);
						const closeModal = item.context.createModal(
							{
								children: <SharesModal calendars={calendars} onClose={() => closeModal()} />
							},
							true
						);
					}
				})
			}
		/>
	</Container>
);

export default function SetMainMenuItems({ expanded }) {
	const [t] = useTranslation();
	const allCalendars = useSelector(selectAllCalendars);
	const calendars = useSelector(selectCalendars);
	const dispatch = useDispatch();
	const start = useSelector(selectStart);
	const end = useSelector(selectEnd);
	const appointments = useSelector(selectAllAppointments);
	const createModal = useContext(ModalManagerContext);

	const findTotalEvents = useCallback(
		(folder) => {
			const events = filter(appointments, (appt) => appt.id === folder);
			return events.length;
		},
		[appointments]
	);

	const checkUncheckCalendarCbk = useCallback(
		(data) =>
			dispatch(folderAction(data)).then((res) => {
				if (res?.payload?.action?.op === 'check') {
					dispatch(
						setSearchRange({
							rangeStart: start,
							rangeEnd: end
						})
					);
				}
			}),
		[dispatch, end, start]
	);

	const setSelected = useCallback(
		(c, value) => {
			if (c.isChecked !== value) {
				checkUncheckCalendarCbk({
					id: c.id,
					changes: { checked: value },
					op: value ? 'check' : '!check'
				});
				c.isChecked = value;
			}
		},
		[checkUncheckCalendarCbk]
	);

	const setSelectedRecursive = useCallback(
		(c, value) => foreachForTree(c, (tree) => setSelected(tree, value)),
		[setSelected]
	);

	const findAndSetSelected = useCallback(
		(clickedId, currentElement) => {
			if (currentElement.id === clickedId) setSelectedRecursive(currentElement, true);
			else {
				setSelected(currentElement, false);
				forEach(currentElement.items, (el) => findAndSetSelected(clickedId, el));
			}
		},
		[setSelected, setSelectedRecursive]
	);

	const accordionItems = useMemo(() => {
		const nestedCalendars = nest(allCalendars, '1');
		const trashItem = remove(nestedCalendars, (c) => c.id === '3'); // move Trash folder to the end
		const allItems = nestedCalendars.concat(trashItem);
		const click = (id) => forEach(allItems, (c) => findAndSetSelected(id, c));
		forEach(allItems, (tree) =>
			foreachForTree(tree, (c) => {
				c.key = c.id;
				c.check = (value) => setSelectedRecursive(c, value);
				c.CustomComponent = CustomAccordion;
				c.onClick = click;
				c.folders = calendars;
				c.selected = true;
				c.allCalendars = allCalendars;
				c.totalAppointments = findTotalEvents(c.id);
			})
		);

		if (allCalendars.length > 2) {
			const checkAll = (value, uncheckThrash = false, uncheckShared = false) =>
				forEach(nestedCalendars, (c) => {
					if (c.id !== '3' && !c.isShared) setSelectedRecursive(c, value);
					else if (uncheckThrash || uncheckShared) setSelectedRecursive(c, false);
				});

			allItems.unshift({
				CustomComponent: CustomAccordion,
				icon: 'Calendar2',
				id: 'all',
				key: '0',
				name: t('label.all_calendars', 'All calendars'),
				checked: every(
					filter(nestedCalendars, (c) => c.id !== '3' && !c.isShared),
					(c) => c.checked
				),
				check: checkAll,
				onClick: () => checkAll(true, true, true)
			});
		}
		const sharedItems = remove(allItems, 'owner');
		return allItems.concat({
			id: 'shares',
			label: t('shared_folders', 'Shared Calendars'),
			icon: 'Share',
			open: false,
			items: sharedItems.concat({
				label: t('find_shares', 'Find shares'),
				context: { dispatch, t, createModal },
				CustomComponent: SharesItem
			})
		});
	}, [
		allCalendars,
		t,
		dispatch,
		createModal,
		findAndSetSelected,
		calendars,
		findTotalEvents,
		setSelectedRecursive
	]);
	return (
		<>
			{expanded ? (
				<Accordion items={accordionItems} />
			) : (
				accordionItems.map((item, index) =>
					item.id !== 'shares' ? <CollapsedSidebarItems key={index} item={item} /> : null
				)
			)}
		</>
	);
}
