/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';
import { FC } from 'react';

export type EditGroupModalProps = {
	groupId: string;
	onClose: () => void;
};

export const EditGroupModal: FC<EditGroupModalProps> = ({
	groupId,
	onClose
}: EditGroupModalProps): React.JSX.Element => <></>;
