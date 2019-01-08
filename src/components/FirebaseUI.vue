<template>
  <div id="firebaseui-auth-container"></div>
</template>

<script>
  import {auth} from '../firebase';
  import firebaseui from 'firebaseui';

  export default {
    name: "FirebaseUI",
    mounted() {
      const uiConfig = {
        signInOptions: [
          {
            provider: auth.EmailAuthProvider.PROVIDER_ID,
            requireDisplayName: false
          }
        ],
        credentialHelper: firebaseui.auth.CredentialHelper.NONE,
        callbacks: {
          signInSuccessWithAuthResult: () => {
            // Do nothing here because post-login triggers listen for onAuthStateChanged event
            return false;
          }
        }
      };

      this.ui = new firebaseui.auth.AuthUI(auth());
      this.ui.start('#firebaseui-auth-container', uiConfig);
    },
    destroyed() {
      this.ui.delete();
    }
  }
</script>

<style src="firebaseui/dist/firebaseui.css"></style>
