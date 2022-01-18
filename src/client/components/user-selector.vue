<template>
  <div class="select">
    <select @change="userSelected()" v-model="selectedUser">
      <option v-for="user in users" :key="user.userId" :value="user.userId">
        {{ user.name }}
      </option>
    </select>
  </div>
</template>

<script lang="ts">
import { Vue } from 'vue-class-component';
import { User } from '../../models/user';
import { httpClient } from '../services/http';
import { Store } from '../services/store';
export default class UserSelector extends Vue {
  public users: User[] = [];
  public selectedUser: number = Store.userId;

  public async created() {
    const response = await httpClient.get<User[]>('/api/users');

    this.users = response.data;
  }

  public userSelected() {
    Store.userId = this.selectedUser;
  }
}
</script>
