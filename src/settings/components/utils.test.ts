import {getShareCalendarWithOptions} from "./utils";
import defaultSettings from '@test-utils/settings/default-settings';

describe('Utils', () => {
  describe('getShareCalendarWithOptions', () => {

    test('returns public and internal sharing options if publicSharingEnabled TRUE', () =>{
      let shareCalendarWithOptions = getShareCalendarWithOptions({
        ...defaultSettings,
        attrs: {
          zimbraPublicSharingEnabled: 'TRUE',
        }
      });
      expect(shareCalendarWithOptions).toHaveLength(2);
      expect(shareCalendarWithOptions[0].value).toEqual('usr');
      expect(shareCalendarWithOptions[1].value).toEqual('pub');
    });

    test('returns only internal sharing option if publicSharingEnabled FALSE', () =>{
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