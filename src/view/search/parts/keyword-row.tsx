/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback } from 'react';

import { Container, ChipInput, ChipItem, ChipInputProps } from '@zextras/carbonio-design-system';
import { t } from '@zextras/carbonio-shell-ui';

type ComponentProps = {
	otherKeywords: Array<any>;
	setOtherKeywords: (arg: any) => void;
};
const KeywordRow = ({ otherKeywords, setOtherKeywords }: ComponentProps): React.JSX.Element => {
	const keywordChipOnAdd = useCallback<NonNullable<ChipInputProps['onAdd']>>((label) => {
		if (typeof label === 'string') {
			return {
				label,
				hasAvatar: false,
				isGeneric: true
			};
		}
		throw new Error('invalid keywords received');
	}, []);

	const keywordOnChange = useCallback(
		(value: ChipItem[]): void => {
			setOtherKeywords(value);
		},
		[setOtherKeywords]
	);

	return (
		<React.Fragment>
			<Container padding={{ bottom: 'small', top: 'medium' }} orientation="horizontal">
				<Container padding={{ right: 'extrasmall' }} maxWidth="100%">
					<ChipInput
						placeholder={t('label.keywords', 'Keywords')}
						background={'gray5'}
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
