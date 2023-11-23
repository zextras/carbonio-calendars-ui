/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, ReactElement, useCallback } from 'react';

import { Container, ChipInput, ChipItem } from '@zextras/carbonio-design-system';
import { t } from '@zextras/carbonio-shell-ui';

type ComponentProps = {
	compProps: {
		otherKeywords: Array<any>;
		setOtherKeywords: (arg: any) => void;
	};
};
const KeywordRow: FC<ComponentProps> = ({ compProps }): ReactElement => {
	const { otherKeywords, setOtherKeywords } = compProps;
	const onChange = useCallback((state, stateHandler) => {
		stateHandler(state);
	}, []);
	const keywordChipOnAdd = useCallback(
		(label) => ({
			label,
			hasAvatar: false,
			isGeneric: true
		}),
		[]
	);

	const keywordOnChange = useCallback(
		(value: ChipItem[]): void => onChange(value, setOtherKeywords),
		[onChange, setOtherKeywords]
	);

	return (
		<React.Fragment>
			<Container padding={{ bottom: 'small', top: 'medium' }} orientation="horizontal">
				<Container padding={{ right: 'extrasmall' }} maxWidth="100%">
					<ChipInput
						placeholder={t('label.keywords', 'Keywords')}
						background="gray5"
						value={otherKeywords}
						separators={[
							{ key: 'Enter', ctrlKey: false },
							{ key: ',', ctrlKey: false }
						]}
						onChange={keywordOnChange}
						onAdd={keywordChipOnAdd}
					/>
				</Container>
			</Container>
		</React.Fragment>
	);
};

export default KeywordRow;
