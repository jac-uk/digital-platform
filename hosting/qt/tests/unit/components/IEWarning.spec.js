import {shallowMount} from '@vue/test-utils';
import IEWarning from '@/components/IEWarning';

describe('components/IEWarning', () => {
  let subject;

  describe('in Internet Explorer', () => {
    beforeEach(() => {
      // Emulate IE11 by setting `document.documentMode` to 11
      // This is `undefined` in non-IE browsers
      document.documentMode = 11;
      subject = shallowMount(IEWarning);
    });

    afterEach(() => {
      delete document.documentMode;
    });

    it('displays a warning message', () => {
      expect(subject.text()).toContain('Warning');
    });

    it('tells users the test will not work correctly', () => {
      expect(subject.text()).toContain('The test will not work correctly on this browser');
    });

    it("styles the warning as a Bootstrap 'danger' alert", () => {
      expect(subject.is('.alert')).toBe(true);
      expect(subject.is('.alert-danger')).toBe(true);
    });
  });

  describe('in any browser other than Internet Explorer', () => {
    beforeEach(() => {
      subject = shallowMount(IEWarning);
    });

    it('displays nothing', () => {
      expect(subject.html()).toBeUndefined();
      expect(subject.text()).toBeEmpty();
    });
  });
});
