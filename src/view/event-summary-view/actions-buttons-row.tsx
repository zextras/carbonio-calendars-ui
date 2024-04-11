/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement } from 'react';

import { Button, Dropdown, Padding, Row } from '@zextras/carbonio-design-system';
import { noop } from 'lodash';
import { useTranslation } from 'react-i18next';

import { useEventActions } from '../../hooks/use-event-actions';
import { SeriesActionsItems } from '../../types/actions';
import { EventType } from '../../types/event';

export const ActionsButtonsRow = ({
	onClose,
	event
}: {
	onClose: () => void;
	event: EventType;
}): ReactElement | null => {
	const [t] = useTranslation();
	const actions = useEventActions({
		onClose,
		event
	});
	if (!actions) {
		return null;
	}
	return (
		<Row width="fill" mainAlignment="flex-end" padding={{ all: 'small' }}>
			<Padding right="small" style={{ display: 'flex' }}>
				{event.resource.isRecurrent && (actions as SeriesActionsItems)?.[1]?.items?.length > 0 && (
					<Dropdown
						data-testid={`series-options`}
						items={(actions as SeriesActionsItems)?.[1]?.items}
						placement="bottom-end"
					>
						<Button
							type="outlined"
							label={t('label.series', 'Series')}
							icon="ChevronDown"
							onClick={noop}
						/>
					</Dropdown>
				)}
				{((actions as SeriesActionsItems)?.[0]?.items?.length > 0 || actions?.length > 0) && (
					<Padding left="small">
						<Dropdown
							data-testid={`instance-options`}
							items={(actions as SeriesActionsItems)?.[0]?.items ?? actions}
							placement="bottom-end"
						>
							<Button
								type="outlined"
								label={t('label.instance', 'Instance')}
								icon="ChevronDown"
								onClick={noop}
							/>
						</Dropdown>
					</Padding>
				)}
			</Padding>
		</Row>
	);
};
