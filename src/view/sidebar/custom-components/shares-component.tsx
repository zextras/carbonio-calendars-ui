/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Button, Container, ModalManagerContext } from '@zextras/carbonio-design-system';
import { t } from '@zextras/carbonio-shell-ui';
import React, { ReactElement, useCallback, useContext, useMemo } from 'react';
import { filter, isEqual, uniqWith } from 'lodash';
import { getShareInfo } from '../../../store/actions/get-share-info';
import { StoreProvider } from '../../../store/redux';
import { useAppDispatch } from '../../../store/redux/hooks';
import { SharesModal } from '../shares-modal';
import { ResFolder } from '../../../carbonio-ui-commons/utils';

export const SharesComponent = (): ReactElement => {
	const createModal = useContext(ModalManagerContext);
	const dispatch = useAppDispatch();
	const label = useMemo(() => t('find_shares', 'Find shares'), []);

	const onClick = useCallback(
		() =>
			dispatch(getShareInfo())
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				.unwrap()
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				.then((res) => {
					const resCalendars: Array<ResFolder> = uniqWith(
						filter(res.calendars, ['view', 'appointment']),
						isEqual
					);
					if (res.isFulfilled) {
						const closeModal = createModal(
							{
								children: (
									<StoreProvider>
										<SharesModal calendars={resCalendars} onClose={(): void => closeModal()} />
									</StoreProvider>
								)
							},
							true
						);
					}
				}),
		[createModal, dispatch]
	);
	return (
		<Container padding={{ horizontal: 'medium', vertical: 'small' }}>
			<Button type="outlined" label={label} width="fill" color="primary" onClick={onClick} />
		</Container>
	);
};
