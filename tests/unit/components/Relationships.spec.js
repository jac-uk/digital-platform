import { shallowMount } from '@vue/test-utils';
import Relationships from '@/components/Relationships';

describe('Relationships component', () => {
  const createTestSubject = (value) => {
    return shallowMount(Relationships, {
      propsData: {value}
    });
  };

  describe('given an empty data set', () => {
    const wrapper = createTestSubject([]);

    it('renders a table', () => {
      expect(wrapper.find('table').exists()).toBe(true);
    });

    it('shows a "no relationships" message', () => {
      expect(wrapper.text()).toContain('No relationships added yet.');
    });
  });

  describe('given a data set', () => {
    const dataset = [
      {forename: 'John', surname: 'Doe',   relationship: 'Father'},
      {forename: 'Lara', surname: 'Cross', relationship: 'Mother'},
      {forename: 'Jane', surname: 'Smith', relationship: 'Sister'},
    ];
    const wrapper = createTestSubject(dataset);

    it('renders a table', () => {
      expect(wrapper.find('table').exists()).toBe(true);
    });

    it('renders one row for each relationship', () => {
      expect(wrapper.findAll('tbody > tr').length).toBe(3);
    });

    describe('a table row', () => {
      // Test against the first table row
      const row = wrapper.find('tbody > tr');

      it.each(['Forename', 'Surname', 'Relationship'])('contains a %s field', (field) => {
        expect(row.find(`input[placeholder='${field}']`).exists()).toBe(true);
      });
    });

    describe('the "delete row" button, when clicked', () => {
      const deleteWrapper = createTestSubject(dataset);
      const row = deleteWrapper.find('tbody > tr');
      const button = row.find("button[title='Delete row']");
      button.trigger('click');

      it('removes the row from the table', () => {
        expect(deleteWrapper.findAll('tbody > tr').contains(row)).toBe(false);
      });

      it('emits a "input" event containing the updated data set', () => {
        expect(deleteWrapper.emitted().input[0][0]).toEqual([
          {forename: 'Lara', surname: 'Cross', relationship: 'Mother'},
          {forename: 'Jane', surname: 'Smith', relationship: 'Sister'},
        ]);
      });
    });
  });

  describe('the "new row" button, when clicked', () => {
    const dataset = [
      {forename: 'John', surname: 'Doe',   relationship: 'Father'}
    ];
    const wrapper = createTestSubject(dataset);
    const button = wrapper.find({ref: 'addRow'});
    button.trigger('click');

    it('adds a new row to the table', () => {
      expect(wrapper.findAll('tbody > tr').length).toBe(2);
    });

    it('emits a "input" event containing the data set, with a new row appended', () => {
      expect(wrapper.emitted().input[0][0]).toEqual([
        {forename: 'John', surname: 'Doe',   relationship: 'Father'},
        {forename: '',     surname: '',      relationship: ''},
      ]);
    });
  });
});
