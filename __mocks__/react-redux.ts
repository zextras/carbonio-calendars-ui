/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Provider } from 'react-redux';
import { noop } from 'lodash';

const useDispatch = jest.fn(() => noop);
const useSelector = jest.fn(() => noop);

export { Provider, useDispatch, useSelector };
