import {shallowMount} from "@vue/test-utils";
import ApplicationForm from '@/components/ApplicationForm';
import Relationships from '@/components/Relationships';

import {firestore} from '@/firebase';
jest.mock('@/firebase', () => {
  const firebase = require('firebase-mock');
  const firestore = firebase.MockFirebaseSdk().firestore();
  firestore.autoFlush();
  return {firestore};
});

describe('ApplicationForm component', () => {
  const createTestSubject = () => {
    return shallowMount(ApplicationForm, {
      propsData: {
        userId: '4jsbvO27RJYqSRsgZM9sPhDFLDU2'
      }
    });
  };

  const formData = {
    forename: 'Homer',
    surname: 'Simpson',
    relationships: [
      {forename: 'Marge', surname: 'Simpson', relationship: 'Wife'},
      {forename: 'Bart', surname: 'Simpson', relationship: 'Son'},
      {forename: 'Lisa', surname: 'Simpson', relationship: 'Daughter'},
    ],
  };

  const emptyFormData = {
    forename: '',
    surname: '',
    relationships: []
  };

  describe('form fields', () => {
    const wrapper = createTestSubject();

    const relationshipsData = [
      {forename: 'Lara', surname: 'Cross', relationship: 'Mother'},
      {forename: 'Sean', surname: 'Robson', relationship: 'Brother'},
    ];

    wrapper.setData({
      form: {
        forename: 'John',
        surname: 'Doe',
        relationships: relationshipsData,
      }
    });

    const fields = [
      ['forename', 'John', 'Jane'],
      ['surname', 'Doe', 'Smith']
    ];

    describe.each(fields)('%s field', (fieldName, expectedValue, setValue) => {
      const field = wrapper.find(`input[id='${fieldName}']`);

      it('has a field label', () => {
        expect(wrapper.find(`label[for='${fieldName}']`).exists()).toBe(true);
      });
      it('has an input field', () => {
        expect(field.exists()).toBe(true);
      });
      it(`form input value equals \`form.${fieldName}\` data model`, () => {
        expect(field.element.value).toEqual(expectedValue);
      });
      it(`form input updates \`form.${fieldName}\` data model`, () => {
        field.setValue(setValue);
        expect(wrapper.vm.form[fieldName]).toEqual(setValue);
      });
    });

    describe('relationships sub-component', () => {
      const relationshipsDataChanged = [
        {forename: 'Bart', surname: 'Simpson', relationship: 'Brother'},
      ];

      const component = wrapper.find(Relationships);

      it('renders relationships component', () => {
        expect(component.exists()).toBe(true);
      });
      it('sets `value` prop to `form.relationships` data model', () => {
        expect(component.props('value')).toBe(wrapper.vm.form.relationships);
      });
      it('updates `form.relationships` data model when `input` event is emitted', () => {
        component.vm.$emit('input', relationshipsDataChanged);
        expect(wrapper.vm.form.relationships).toBe(relationshipsDataChanged);
      });
    });
  });

  describe('form.onSubmit', () => {
    let wrapper;
    beforeEach(() => {
      wrapper = createTestSubject();
      wrapper.setData({
        form: {
          forename: 'Homer',
          surname: 'Simpson',
          relationships: [
            {forename: 'Marge', surname: 'Simpson', relationship: 'Wife'},
            {forename: 'Bart', surname: 'Simpson', relationship: 'Son'},
            {forename: 'Lisa', surname: 'Simpson', relationship: 'Daughter'},
          ],
        }
      });
    });

    it('prevents the browser default HTML form submission', () => {
      wrapper.vm.saveToFirestore = jest.fn(event => {
        expect(event.defaultPrevented).toBe(true);
      });
      wrapper.find('form').trigger('submit');
    });

    it('executes the `saveToFirestore` method', () => {
      const mockMethod = jest.fn();
      wrapper.vm.saveToFirestore = mockMethod;
      wrapper.find('form').trigger('submit');
      expect(mockMethod).toHaveBeenCalledTimes(1);
    });
  });

  describe('methods', () => {
    let wrapper;

    beforeEach(() => {
      wrapper = createTestSubject();
    });

    describe('#userDoc', () => {
      it("returns a Firestore document reference for /applications/{userId}", () => {
        const expectUserId = '4jsbvO27RJYqSRsgZM9sPhDFLDU2';
        const userDoc = wrapper.vm.userDoc();
        expect(userDoc.path).toEqual(`applications/${expectUserId}`);
        expect(userDoc.id).toEqual(expectUserId);
      });
    });

    describe('#saveToFirestore', () => {
      beforeEach(() => {
        // Populate `form` data model
        wrapper.setData({
          form: formData
        });

        // Stub console.log and console.error to avoid leaking into tests
        // Keep a reference to the original functions to restore them later
        console.logBackup = console.log;
        console.errorBackup = console.error;
        console.log = jest.fn();
        console.error = jest.fn();
      });

      afterEach(() => {
        // Reset the Firestore 'applications' collection
        firestore.collection('applications').data = null;
        firestore.collection('applications').doc('4jsbvO27RJYqSRsgZM9sPhDFLDU2').data = null;

        // Restore console.log and console.error
        console.log = console.logBackup;
        console.error = console.errorBackup;
        delete console.logBackup;
        delete console.errorBackup;
      });

      it('saves form data to Firestore', async () => {
        await wrapper.vm.saveToFirestore();
        const userDoc = wrapper.vm.userDoc();
        return userDoc.get().then(doc => {
          expect(doc.data()).toEqual(formData);
        });
      });

      // @TODO: Make this test more meaningful – it doesn't really test much right now
      it('logs failed saves to `console.error`', async () => {
        const userDoc = wrapper.vm.userDoc();
        const throwError = new Error('Missing or insufficient permissions.');
        userDoc.errs['set'] = throwError;
        await wrapper.vm.saveToFirestore();
        expect(console.error).toHaveBeenCalledWith('Unable to save application form', throwError);
        return userDoc.get().then(doc => {
          expect(doc.exists).toEqual(false);
        });
      });
    });

    describe('#loadFromFirestore', () => {
      afterEach(() => {
        // Reset the Firestore 'applications' collection
        firestore.collection('applications').data = null;
        firestore.collection('applications').doc('4jsbvO27RJYqSRsgZM9sPhDFLDU2').data = null;
      });

      it("populates the `form` data model with the user's existing Firestore record", async () => {
        await wrapper.vm.userDoc().set(formData);
        expect(wrapper.vm.form).toEqual(emptyFormData);
        await wrapper.vm.loadFromFirestore();
        expect(wrapper.vm.form).toEqual(formData);
      });

      it("does nothing if a Firestore record doesn't exist", async () => {
        expect(wrapper.vm.form).toEqual(emptyFormData);
        await wrapper.vm.loadFromFirestore();
        expect(wrapper.vm.form).toEqual(emptyFormData);
      });
    });
  });

  it('loads from Firestore when the component is created', () => {
    // Stub loadFromFirestore method, and keep a reference for later
    const backup = ApplicationForm.methods.loadFromFirestore;
    const mock = jest.fn();
    ApplicationForm.methods.loadFromFirestore = mock;

    createTestSubject();
    expect(mock).toHaveBeenCalledTimes(1);

    // Restore the original method
    ApplicationForm.methods.loadFromFirestore = backup;
  });
});
