<template>
  <div class="public-layout">
    <nav>
      <div class="container">
        <router-link to="/" class="logo">
          <h2>Churches Directory</h2>
        </router-link>
        <div class="nav-links">
          <router-link to="/">Home</router-link>
          <router-link to="/admin/login" class="btn btn-primary btn-sm">Admin Login</router-link>
        </div>
      </div>
    </nav>

    <main>
      <router-view />
    </main>

    <footer>
      <div class="container text-center">
        <p>&copy; 2024 Churches Directory. All rights reserved.</p>
      </div>
    </footer>
  </div>
</template>

<script>
export default {
  name: 'PublicLayout'
}
</script>

<style scoped>
.public-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

nav .container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  text-decoration: none;
  color: var(--gray-900);
}

.logo h2 {
  margin: 0;
}

.nav-links {
  display: flex;
  gap: 1.5rem;
  align-items: center;
}

main {
  flex: 1;
  padding: 2rem 0;
}

footer {
  background: var(--gray-100);
  padding: 2rem 0;
  margin-top: 4rem;
}

@media (max-width: 768px) {
  nav .container {
    flex-direction: column;
    gap: 1rem;
  }

  .nav-links {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>
