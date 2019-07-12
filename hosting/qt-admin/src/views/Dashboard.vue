<template>
  <div>
    <nav class="navbar navbar-expand-sm navbar-light bg-light mb-4">
      <div class="container">
        <a href="/" class="navbar-brand router-link-active">
          <img src="@/assets/jac-logo.svg" alt="Judicial Appointments Commission" width="197" height="66">
        </a>

        <div class="navbar-collapse">
          <ul class="navbar-nav ml-auto">
            <li class="nav-item">
              <a class="nav-link" href="#" @click.prevent="signOut">Sign out</a>
            </li>
          </ul>
        </div>
      </div>
    </nav>

    <div class="container-fluid">
      <h1 class="text-center">Hello, admin</h1>

      <p>This is admin dashboard page </p>
    </div>    
  </div>
</template>

<script>
  import { auth } from '@/firebase';

  export default {
    methods: {
      signOut() {
        auth().signOut();
        this.$router.go('/sign-in');
      }
    },
  }
</script>
