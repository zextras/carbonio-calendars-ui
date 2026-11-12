/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement, useCallback, useEffect, useMemo, useState } from 'react';

import { Button, Container, Input, Row, Tooltip } from '@zextras/carbonio-design-system';
import { Action, useActions } from '@zextras/carbonio-shell-ui';
import { isNil, debounce } from 'lodash';
import { useTranslation } from 'react-i18next';

import { useAppDispatch, useAppSelector } from '../../../store/redux/hooks';
import {
	selectEditorAllDay,
	selectEditorDisabled,
	selectEditorEnd,
	selectEditorLocation,
	selectEditorStart,
	selectEditorTimezone,
	selectEditorTitle
} from '../../../store/selectors/editor';
import { editEditorLocation } from '../../../store/slices/editor-slice';

interface EditorLocationExtensionOptions {
	eventTitle?: string;
	eventStartAt?: Date;
	eventEndAt?: Date;
	eventLocation: string;
	eventAllDay?: boolean;
	eventTimezone?: string;
	onConfirm: (newLocation: string) => void;
}

interface EditorLocationExtension extends Action {
	execute: (options: EditorLocationExtensionOptions) => void;
}

export const EditorLocation = ({ editorId }: { editorId: string }): ReactElement | null => {
	const [t] = useTranslation();
	const eventTitle = useAppSelector(selectEditorTitle(editorId));
	const start = useAppSelector(selectEditorStart(editorId));
	const end = useAppSelector(selectEditorEnd(editorId));
	const allDay = useAppSelector(selectEditorAllDay(editorId));
	const timezone = useAppSelector(selectEditorTimezone(editorId));
	const location = useAppSelector(selectEditorLocation(editorId));
	const [value, setValue] = useState(location ?? '');
	const disabled = useAppSelector(selectEditorDisabled(editorId));
	const dispatch = useAppDispatch();
	const locationExtensions = useActions<undefined, EditorLocationExtension>(
		undefined,
		'calendars-location-provider'
	);
	const extension = useMemo(
		() => (locationExtensions.length > 0 ? locationExtensions[0] : null),
		[locationExtensions]
	);

	useEffect(() => {
		if (location) {
			setValue(location);
		}
	}, [location]);

	const debounceInput = useMemo(
		() =>
			debounce(
				(loc) => {
					dispatch(editEditorLocation({ id: editorId, location: loc }));
				},
				500,
				{
					trailing: true,
					leading: false
				}
			),
		[dispatch, editorId]
	);

	const onChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			setValue(e.target.value);
			debounceInput(e.target.value);
		},
		[debounceInput]
	);

	const onLocationProviderRequest = useCallback(() => {
		if (!extension) {
			return;
		}

		extension.execute({
			eventTitle,
			eventStartAt: isNil(start) ? undefined : new Date(start),
			eventEndAt: isNil(end) ? undefined : new Date(end),
			// the input value: the store gets it only after the 500 ms debounce
			eventLocation: value,
			eventAllDay: allDay,
			eventTimezone: timezone,
			onConfirm: (newLocation: unknown) => {
				// the provider is another module: ignore what is not a location
				if (typeof newLocation !== 'string') {
					return;
				}
				setValue(newLocation);
				debounceInput(newLocation);
			}
		});
	}, [allDay, debounceInput, end, eventTitle, extension, start, timezone, value]);

	return !isNil(location) ? (
		<Container
			orientation={'horizontal'}
			gap={'0.5rem'}
			width={'fill'}
			mainAlignment={'flex-start'}
		>
			<Input
				label={t('label.location', 'Location')}
				value={value}
				onChange={onChange}
				disabled={disabled?.location}
				backgroundColor="gray5"
				data-testid="editor-location"
			/>

			{extension && (
				<Row>
					<Tooltip label={t('label.location_provider', 'Location Provider')}>
						<Button
							type="ghost"
							size={'extralarge'}
							icon="PinOutline"
							onClick={onLocationProviderRequest}
						/>
					</Tooltip>
				</Row>
			)}
		</Container>
	) : null;
};
