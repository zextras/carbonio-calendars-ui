/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useMemo } from 'react';

import { Chip } from '@zextras/carbonio-design-system';
import { find } from 'lodash';
import { useTranslation } from 'react-i18next';

import { Grant } from '../../../../carbonio-ui-commons/types/folder';
import { useEditModalContext } from '../../../../commons/edit-modal-context';
import { SHARE_USER_TYPE } from '../../../../constants';

export const GranteeChip = ({ grant }: { grant: Grant }): JSX.Element => {
	const [t] = useTranslation();
	const { roleOptions } = useEditModalContext();

	const role = useMemo(() => find(roleOptions, ['value', grant?.perm ?? '']), [roleOptions, grant]);

	const label = useMemo(() => {
		const publicLabel = grant.gt === SHARE_USER_TYPE.PUBLIC ? t('public', 'public') : '';
		return `${grant.d ?? grant.zid ?? publicLabel} - ${role?.label}`;
	}, [grant.d, grant.gt, grant.zid, role, t]);

	return <Chip label={label} maxWidth={'fill'} />;
};
