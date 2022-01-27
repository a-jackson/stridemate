<template>
  <nav class="navbar is-info" role="navigation" aria-label="main navigation">
    <div class="container">
      <div class="navbar-brand">
        <a
          role="button"
          class="navbar-burger"
          aria-label="menu"
          aria-expanded="false"
          data-target="navMenu"
          @click="toggleMenu()"
        >
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
        </a>
      </div>

      <div class="navbar-menu" :class="{ 'is-active': isMenuActive }">
        <div class="navbar-start">
          <router-link
            v-for="route in routes"
            :to="route.path"
            :key="route.path"
            @click="navClicked()"
            class="navbar-item"
          >
            <font-awesome-icon
              :icon="route.meta.icon"
              class="mr-1"
            ></font-awesome-icon>
            <span>{{ route.name }}</span></router-link
          >
        </div>
        <div class="navbar-end">
          <div class="navbar-item">
            <span class="mr-2">User:</span>
            <user-selector></user-selector>
          </div>
        </div>
      </div>
    </div>
  </nav>
  <router-view class="section"></router-view>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import UserSelector from './components/user-selector.vue';
import { router } from './router';

@Options({
  components: {
    UserSelector,
  },
})
export default class App extends Vue {
  public routes = router.getRoutes().filter((x: any) => !x.meta.hidden);
  public isMenuActive = false;

  public toggleMenu() {
    this.isMenuActive = !this.isMenuActive;
  }

  public navClicked() {
    if (this.isMenuActive) {
      this.toggleMenu();
    }
  }
}
</script>
