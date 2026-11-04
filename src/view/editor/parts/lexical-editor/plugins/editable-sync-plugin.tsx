/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useEffect } from 'react';

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';

type EditableSyncPluginProps = {
	disabled?: boolean;
};

/**
 * Drives Lexical's own `setEditable` from the Redux `disabled.composer`
 * flag (e.g. viewing an invite the user can't edit), since Lexical has no
 * prop for this on `LexicalComposer` itself.
 */
export const EditableSyncPlugin = ({ disabled }: EditableSyncPluginProps): null => {
	const [editor] = useLexicalComposerContext();

	useEffect(() => {
		editor.setEditable(!disabled);
	}, [editor, disabled]);

	return null;
};
