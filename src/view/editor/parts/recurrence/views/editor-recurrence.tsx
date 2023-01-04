/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Icon, LabelFactoryProps, Row, Select, Text } from '@zextras/carbonio-design-system';
import { find } from 'lodash';
import React, { ReactElement, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { ColorContainer, TextUpperCase } from '../../../../../commons/styled-components';
import { useRecurrence } from '../../../../../hooks/use-recurrence';
import {
	selectEditorDisabled,
	selectEditorRecurrence
} from '../../../../../store/selectors/editor';
import { EditorProps } from '../../../../../types/editor';

const LabelFactory = ({ selected, label, open, focus }: LabelFactoryProps): ReactElement => (
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
				<Row>
					<TextUpperCase>{selected[0].label}</TextUpperCase>
				</Row>
			</Row>
		</Row>
		<Icon
			size="large"
			icon={open ? 'ChevronUpOutline' : 'ChevronDownOutline'}
			color={open || focus ? 'primary' : 'secondary'}
			style={{ alignSelf: 'center' }}
		/>
	</ColorContainer>
);

const EditorRecurrence = ({ editorId, callbacks }: EditorProps): ReactElement | null => {
	const recur = useSelector(selectEditorRecurrence(editorId));
	const disabled = useSelector(selectEditorDisabled(editorId));
	const [t] = useTranslation();

	const { onChange, recurrenceItems } = useRecurrence(editorId, callbacks);

	const initialValue = useMemo(() => {
		const recurrenceValue = recur ? 'CUSTOM' : 'NONE';
		return find(recurrenceItems, { value: recurrenceValue }) ?? recurrenceItems[0];
	}, [recur, recurrenceItems]);

	return initialValue ? (
		<Select
			label={t('label.repeat', 'Repeat')}
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			onChange={onChange}
			items={recurrenceItems}
			selection={initialValue}
			disablePortal
			disabled={disabled?.recurrence}
			LabelFactory={LabelFactory}
		/>
	) : null;
};

export default EditorRecurrence;
