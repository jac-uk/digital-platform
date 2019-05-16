<template>
  <main class="container">
    <h1>Verify your email address</h1>
    <p>To complete your registration we need to make sure we have the right email address for you.</p>
    <p>We’ve sent an email to <strong>{{email}}</strong> containing a link to verify your email address and complete your registration before you start your qualifying test.</p>

    <section class="mt-5">
      <h4>If you haven’t received the email yet</h4>
      <p>It could take up to 10 minutes for the email to arrive.</p>
      <p>Check your ‘spam’ or ‘junk mail’ folder in case it didn’t go into your inbox.</p>
      <p>If it still hasn’t arrived after 10 minutes, you can ask us to resend the email:</p>
      <button class="btn btn-primary" type="button" :disabled="sendInProgress" @click.prevent="sendVerificationEmail">
        Resend email
      </button>
      <span class="spinner-border spinner-border-sm text-secondary ml-2" v-if="sendInProgress"></span>
    </section>
  </main>
</template>

<script>
import {functions} from '@/firebase';

  export default {
    data() {
      return {
        email: this.$store.getters.currentUserEmail,
        sendInProgress: false,
      };
    },
    methods: {
      sendVerificationEmail() {
        const send = functions().httpsCallable('sendVerificationEmail');
        this.sendInProgress = true;
        send().finally(() => {
          this.sendInProgress = false;
        });
      },
    },
  }
</script>

<style scoped>
button[disabled] {
  cursor: progress;
}
</style>
