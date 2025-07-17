import {getShareCalendarWithOptions} from "./utils";
import defaultSettings from '@test-utils/settings/default-settings';

describe('Utils', () => {
  describe('getShareCalendarWithOptions', () => {
    test('returns public sharing option if publicSharingEnabled TRUE', () =>{
      let shareCalendarWithOptions = getShareCalendarWithOptions({
        ...defaultSettings,
        attrs: {
          zimbraPublicSharingEnabled: 'TRUE',
        }
      });
      expect(shareCalendarWithOptions[1].value).toEqual('pub');
    });

    test('does not return public sharing option if publicSharingEnabled FALSE', () =>{
      let shareCalendarWithOptions = getShareCalendarWithOptions({
        ...defaultSettings,
        attrs: {
          zimbraPublicSharingEnabled: 'FALSE',
        }
      });
      expect(shareCalendarWithOptions).toHaveLength(1);
      expect(shareCalendarWithOptions[0].value).toEqual('usr');
    })
  })
})