<template>
  <div class="admin-layout">
    <nav v-if="isLoggedIn">
      <div class="container">
        <div class="logo">
          <h2>Church Admin</h2>
        </div>
        <div class="nav-links">
          <router-link to="/admin/dashboard">Dashboard</router-link>
          <router-link to="/admin/church-info">Church Info</router-link>
          <router-link to="/admin/news">News</router-link>
          <router-link to="/admin/events">Events</router-link>
          <router-link to="/admin/gallery">Gallery</router-link>
          <button @click="logout" class="btn btn-danger btn-sm">Logout</button>
        </div>
      </div>
    </nav>

    <main class="container">
      <router-view />
    </main>
  </div>
</template>

<script>
export default {
  name: 'AdminLayout',
  computed: {
    isLoggedIn() {
      return !!localStorage.getItem('church_admin_token')
    }
  },
  methods: {
    logout() {
      localStorage.removeItem('church_admin_token')
      localStorage.removeItem('church_admin_user')
      this.$router.push('/admin/login')
    }
  }
}
</script>

<style scoped>
.admin-layout {
  min-height: 100vh;
  background-color: var(--gray-50);
}

nav {
  background: var(--gray-900);
  color: white;
  padding: 1rem 0;
}

nav .container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo h2 {
  margin: 0;
  color: white;
}

.nav-links {
  display: flex;
  gap: 1.5rem;
  align-items: center;
}

.nav-links a {
  color: var(--gray-300);
  text-decoration: none;
  transition: color 0.2s;
}

.nav-links a:hover,
.nav-links a.router-link-active {
  color: white;
}

main {
  padding: 2rem 0;
}

@media (max-width: 768px) {
  nav .container {
    flex-direction: column;
    gap: 1rem;
  }

  .nav-links {
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.5rem;
  }
}
</style>
