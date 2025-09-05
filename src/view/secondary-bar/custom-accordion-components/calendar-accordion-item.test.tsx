/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
describe('CalendarAccordionItem', () => {
	// it('should render the tag accordion item with the correct label and icon', () => {
	//     const tag = generateTag();
	//     const tags = {
	//         [tag.id]: tag
	//     };
	//     useTagStore.setState({ tags });
	//     const item: AccordionItemType = {
	//         id: tag.id,
	//         label: tag.name
	//     };
	//     setupTest(<TagAccordionItem item={item} />);
	//     expect(screen.getByText(tag.name)).toBeVisible();
	//     expect(screen.getByTestId(TEST_SELECTORS.ICONS.tag)).toBeVisible();
	//     expect(screen.getByTestId(TEST_SELECTORS.ICONS.tag)).toHaveStyleRule(
	//         'color',
	//         ZIMBRA_STANDARD_COLORS[tag.color ?? 0].hex
	//     );
	// });
	// it('should trigger the search when the tag is clicked', async () => {
	//     const runSearchSpy = jest.fn();
	//     jest.mocked(useRunSearchIntegration).mockReturnValue(runSearchSpy);
	//     const tag = generateTag();
	//     const tags = {
	//         [tag.id]: tag
	//     };
	//     useTagStore.setState({ tags });
	//     const item: AccordionItemType = {
	//         id: tag.id,
	//         label: tag.name
	//     };
	//     const { user } = setupTest(<TagAccordionItem item={item} />);
	//     await user.click(screen.getByText(tag.name));
	//     expect(runSearchSpy).toHaveBeenCalledWith(
	//         expect.arrayContaining([
	//             {
	//                 avatarBackground: ZIMBRA_STANDARD_COLORS[tag.color || 0].hex,
	//                 avatarIcon: 'Tag',
	//                 background: 'gray2',
	//                 hasAvatar: true,
	//                 label: `tag:${tag.name}`,
	//                 value: `tag:"${tag.name}"`
	//             }
	//         ]),
	//         'calendars'
	//     );
	// });
});
