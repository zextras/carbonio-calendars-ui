/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC } from 'react';

import styled from '@emotion/styled';
import { Button, Container, Tooltip } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';

const BorderContainer = styled(Container)`
	border-bottom: 0.0625rem solid ${({ theme }): string => theme?.palette?.gray2?.regular};
	border-right: 0.0625rem solid ${({ theme }): string => theme?.palette?.gray2?.regular};
`;

type AdvancedFilterButtonProps = {
	searchDisabled: boolean;
	setShowAdvanceFilters: (arg: boolean) => void;
};

export const AdvancedFilterButton: FC<AdvancedFilterButtonProps> = ({
	setShowAdvanceFilters,
	searchDisabled
}) => {
	const [t] = useTranslation();

	return (
		<BorderContainer
			padding={{ all: 'small' }}
			height="fit"
			mainAlignment="flex-start"
			crossAlignment="flex-start"
			borderRadius="none"
		>
			<Tooltip
				label={t('label.results_for_error', 'Unable to parse the search query, clear it and retry')}
				placement="top"
				maxWidth="100%"
				disabled={!searchDisabled}
			>
				<Button
					onClick={(): void => setShowAdvanceFilters(true)}
					type="default"
					width="fill"
					label={t('label.single_advanced_filter', 'Advanced Filters')}
					disabled={searchDisabled}
					icon="Options2Outline"
				/>
			</Tooltip>
		</BorderContainer>
	);
};
