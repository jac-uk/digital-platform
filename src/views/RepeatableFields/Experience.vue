<template>
  <div>
    <div class="form-group">
      <label :for="inputIds.title">Title</label>
      <input type="text" class="form-control" :id="inputIds.title" v-model="row.title">
    </div>

    <div class="form-group">
      <label>From</label>
      <div class="fieldset-text">
        For example, 02 2017
      </div>
      <DateInput v-model="row.date_from" type="month" />
    </div>

    <div class="custom-control custom-checkbox mb-3">
      <input type="checkbox" class="custom-control-input" :id="inputIds.currentlyInJob" v-model="row.currently_in_job">
      <label class="custom-control-label" :for="inputIds.currentlyInJob">I currently work in this job</label>
    </div>

    <div class="form-group" v-if="!row.currently_in_job">
      <label>To</label>
      <div class="fieldset-text">
        For example, 02 2017
      </div>
      <DateInput v-model="row.date_to" type="month" />
    </div>

    <div class="form-group">
      <label>Is this job a judicial appointment?</label>
      <BooleanInput v-model="row.is_judicial_appointment" />
    </div>

    <div class="form-group">
      <label>Is the appointment salaried or fee-paid?</label>
      <SelectList :options="selectListOptions.appointmentTypes" v-model="row.appointment_type" :id="inputIds.appointmentType" />
    </div>

    <div class="form-group">
      <label :for="inputIds.jurisdiction">What's your jurisdiction?</label>
      <input type="text" class="form-control" :id="inputIds.jurisdiction" v-model="row.jurisdiction">
    </div>

    <div class="form-group">
      <label>Which circuit do you work on?</label>
      <SelectList :options="selectListOptions.circuits" v-model="row.circuit" :id="inputIds.circuit" />
    </div>

    <div class="form-group">
      <label :for="inputIds.region">Which region do you work in?</label>
      <input type="text" class="form-control" :id="inputIds.region" v-model="row.region">
    </div>

    <div class="form-group">
      <label :for="inputIds.daysSat">How many days have you sat in this appointment?</label>
      <input type="number" class="form-control" :id="inputIds.daysSat" v-model="row.days_sat" style="max-width: 6rem;">
    </div>

    <slot name="removeButton"></slot>
  </div>
</template>

<script>
  import DateInput from '@/components/DateInput';
  import BooleanInput from '@/components/BooleanInput';
  import SelectList from '@/components/SelectList';

  export default {
    name: 'Experience',
    components: {
      SelectList,
      BooleanInput,
      DateInput,
    },
    props: [
      'row',
      'index',
    ],
    data() {
      return {
        inputIds: {
          title: `experience_${this.index}_title`,
          currentlyInJob: `experience_${this.index}_currently_in_job`,
          appointmentType: `experience_${this.index}_appointment_type`,
          jurisdiction: `experience_${this.index}_jurisdiction`,
          circuit: `experience_${this.index}_circuit`,
          region: `experience_${this.index}_region`,
          daysSat: `experience_${this.index}_days_sat`,
        },
        selectListOptions: {
          appointmentTypes: [
            'Salaried',
            'Fee-paid',
          ],
          circuits: [
            'London and south east',
            'Western',
            'Midlands',
            'Northern',
            'North eastern',
            'Wales',
          ],
        },
      };
    },
  }
</script>
