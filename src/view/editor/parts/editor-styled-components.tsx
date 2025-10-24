/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import styled from '@emotion/styled';
import { IconCheckbox } from '@zextras/carbonio-design-system';

export const ResizedIconCheckbox = styled(IconCheckbox)`
  [class^='Padding__Comp'] {
    padding: 0.375rem;

    svg {
      height: 1.25rem;
      width: 1.25rem;
      
      border-radius: 50%;
    }
`;
