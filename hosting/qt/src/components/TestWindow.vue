<template>
  <div>
    <p v-if="beforeTestDay">
      The test window will be open on {{testDate}} {{timeWindow}}.
    </p>

    <p v-if="isTestDay && !testHasOpened">
      The test window will be open today {{timeWindow}}.
    </p>

    <template v-if="testIsOpen">
      <p>
        The test window is now open and closes at {{formatTime(closingTime)}}.
      </p>
      <p>
        Start the test no later than {{formatTime(closingTime.subtract(1, 'hour'))}}
        to give yourself time to complete it before the window closes.
      </p>
    </template>

    <p v-if="isTestDay && testHasClosed">
      This test has closed. The test window was today {{timeWindow}}.
    </p>

    <p v-if="afterTestDay">
      This test has closed. The test window was {{testDate}} {{timeWindow}}.
    </p>
  </div>
</template>

<script>
  import { mapGetters } from 'vuex';
  import dayjs from 'dayjs';

  export default {
    computed: {
      ...mapGetters([
        'test',
        'testHasOpened',
        'testHasClosed',
        'testIsOpen'
      ]),
      openingTime() {
        return dayjs(this.test.openingTime);
      },
      closingTime() {
        return dayjs(this.test.closingTime);
      },
      now() {
        return dayjs();
      },
      beforeTestDay() {
        return this.now.isBefore(this.openingTime, 'day');
      },
      isTestDay() {
        return this.now.isSame(this.openingTime, 'day');
      },
      afterTestDay() {
        return this.now.isAfter(this.openingTime, 'day');
      },
      testDate() {
        return this.formatDate(this.openingTime);
      },
      timeWindow() {
        const openingTime = this.formatTime(this.openingTime);
        const closingTime = this.formatTime(this.closingTime);
        return `between ${openingTime} and ${closingTime}`;
      },
    },
    methods: {
      formatDate(date) {
        return date.format('D MMMM YYYY');
      },
      formatTime(date) {
        return date.format('ha');
      },
    },
  };
</script>
