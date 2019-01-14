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

    it('has a "new row" button', () => {
      expect(wrapper.find({ref: 'addRow'}).exists()).toBe(true);
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

    it('has a "new row" button', () => {
      expect(wrapper.find({ref: 'addRow'}).exists()).toBe(true);
    });

    describe('a table row', () => {
      // Test against the first table row of our test subject
      const row = wrapper.find('tbody > tr');

      const expectFields = [
        'Forename',
        'Surname',
        'Relationship'
      ];

      it.each(expectFields)('contains a %s field', (field) => {
        expect(row.find(`input[placeholder='${field}']`).exists()).toBe(true);
      });
    });

    describe('the "delete row" button, when clicked', () => {
      const deleteWrapper = createTestSubject(dataset);
      const row = deleteWrapper.find('tbody > tr');
      const rowData = dataset[0];
      const button = row.find("button[title='Delete row']");
      button.trigger('click');

      it('removes the row from the table', () => {
        expect(deleteWrapper.findAll('tbody > tr').contains(row)).toBe(false);
      });

      it('removes the relationship from the `rows` data model', () => {
        expect(deleteWrapper.vm.rows).toEqual(
          expect.not.arrayContaining([rowData])
        );
      });
    });
  });

  describe('the "new row" button, when clicked', () => {
    const dataset = [
      {forename: 'John', surname: 'Doe', relationship: 'Father'}
    ];
    const wrapper = createTestSubject(dataset);
    const button = wrapper.find({ref: 'addRow'});
    button.trigger('click');

    it('adds a new row to the table', () => {
      expect(wrapper.findAll('tbody > tr').length).toBe(2);
    });

    it('adds an empty relationship to the `rows` data model', () => {
      expect(wrapper.vm.rows).toContainEqual(
        {forename: '', surname: '', relationship: ''}
      );
    });
  });

  describe('`v-model` interface compatibility', () => {
    // The component must interface with `v-model` as per the Vue docs:
    // https://vuejs.org/v2/guide/components.html#Using-v-model-on-Components

    const dataset1 = [
      {forename: 'John', surname: 'Doe',   relationship: 'Father'},
      {forename: 'Lara', surname: 'Cross', relationship: 'Mother'},
      {forename: 'Jane', surname: 'Smith', relationship: 'Sister'},
    ];
    const dataset2 = [
      {forename: 'Lara', surname: 'Cross', relationship: 'Mother'},
      {forename: 'Jane', surname: 'Smith', relationship: 'Sister'},
    ];

    it('updates internal `rows` data model when external `value` prop is changed', () => {
      const wrapper = createTestSubject([]);
      expect(wrapper.vm.rows).toEqual([]);

      wrapper.setProps({value: dataset1});
      expect(wrapper.vm.rows).toEqual(dataset1);

      wrapper.setProps({value: dataset2});
      expect(wrapper.vm.rows).toEqual(dataset2);
    });

    it('emits `input` events when internal `rows` data model changes', () => {
      const wrapper = createTestSubject([]);

      wrapper.setData({rows: dataset1});
      expect(wrapper.emitted().input).toHaveLength(1);

      wrapper.setData({rows: dataset2});
      expect(wrapper.emitted().input).toHaveLength(2);

      const emitted = wrapper.emitted().input;
      expect(emitted[0][0]).toEqual(dataset1);
      expect(emitted[1][0]).toEqual(dataset2);
    });
  });
});
