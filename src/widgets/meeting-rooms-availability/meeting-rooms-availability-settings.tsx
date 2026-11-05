/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useCallback, useMemo, useState } from 'react';

import {
	ChipInput,
	type ChipInputProps,
	type ChipItem,
	Container,
	Text
} from '@zextras/carbonio-design-system';
import { filter, map } from 'lodash';
import { useTranslation } from 'react-i18next';

import type { MeetingRoom, MeetingRoomsAvailabilityConfig } from './utils';
import { searchResources } from '../../soap/search-resources';
import type { WidgetSettingsProps } from '../../types/dashboard-widget';

type RoomOption = { id: string; label: string; icon: string; value: MeetingRoom };

export const MeetingRoomsAvailabilitySettings = ({
	config,
	onChange
}: WidgetSettingsProps<MeetingRoomsAvailabilityConfig>): React.JSX.Element => {
	const [t] = useTranslation();
	const [options, setOptions] = useState<Array<RoomOption>>([]);

	const chips = useMemo<Array<ChipItem<MeetingRoom>>>(
		() =>
			map(config.rooms, (room) => ({
				id: room.email,
				label: room.label,
				value: room,
				avatarIcon: 'BuildingOutline',
				avatarBackground: 'transparent',
				avatarColor: 'gray0'
			})),
		[config.rooms]
	);

	const onInputType = useCallback<NonNullable<ChipInputProps<MeetingRoom>['onInputType']>>((e) => {
		const text = e.textContent?.trim();
		if (!text) {
			setOptions([]);
			return;
		}
		searchResources(text)
			.then((response) => {
				if (!response || response.error) {
					setOptions([]);
					return;
				}
				const rooms = filter(response.cn, (cn) => cn._attrs.zimbraCalResType === 'Location');
				setOptions(
					map(rooms, (cn) => ({
						id: cn._attrs.email,
						label: cn.fileAsStr,
						icon: 'BuildingOutline',
						value: { email: cn._attrs.email, label: cn.fileAsStr }
					}))
				);
			})
			.catch(() => setOptions([]));
	}, []);

	const onChipsChange = useCallback(
		(newChips: Array<ChipItem<MeetingRoom>>) => {
			// free text that does not match a room is not a valid room: it is dropped
			const rooms = filter(
				map(newChips, (chip) => chip.value),
				(room): room is MeetingRoom => !!room?.email
			);
			onChange({ rooms });
		},
		[onChange]
	);

	// only the rooms picked from the search results can be added
	const onAdd = useCallback<NonNullable<ChipInputProps<MeetingRoom>['onAdd']>>(
		(value) => {
			const room = value as Partial<MeetingRoom> | string;
			if (typeof room === 'string') {
				const match = options.find((o) => o.label.toLowerCase() === room.trim().toLowerCase());
				return match
					? { id: match.id, label: match.label, value: match.value }
					: { label: room, value: undefined, error: true };
			}
			return { id: room.email, label: room.label ?? '', value: room as MeetingRoom };
		},
		[options]
	);

	return (
		<Container
			crossAlignment="flex-start"
			gap="0.5rem"
			height="fit"
			padding={{ vertical: 'small' }}
		>
			<Text color="secondary" size="small">
				{t(
					'widget.meeting_rooms_availability.settings.description',
					'Choose the meeting rooms to show'
				)}
			</Text>
			<ChipInput
				placeholder={t('label.meeting_rooms', 'Meeting rooms')}
				value={chips}
				options={options}
				onChange={onChipsChange}
				onAdd={onAdd}
				onInputType={onInputType}
				requireUniqueChips
				confirmChipOnBlur={false}
				createChipOnPaste={false}
				disableOptions={false}
			/>
		</Container>
	);
};
