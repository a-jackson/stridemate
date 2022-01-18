<template>
  <div class="container">
    <div v-for="activity in activities" :key="activity.activityId">
      <activity :activity="activity"></activity>
    </div>
    <div class="block is-flex is-justify-content-center">
      <button
        class="button is-link mr-5"
        :disabled="offset === 0"
        @click="prevClick()"
      >
        Prev
      </button>
      <button
        class="button is-primary ml-5"
        :disabled="activities.length < limit"
        @click="nextClick()"
      >
        Next
      </button>
    </div>
  </div>
</template>
<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import { httpClient } from '../services/http';
import { Activity as IActivity } from '../../models/activity';
import Activity from '../components/activity.vue';
import { ActivityFilter } from '../../models/activity-filter';
import { Store } from '../services/store';
import { watch } from '@vue/runtime-core';

@Options({
  components: {
    Activity,
  },
})
export default class Activities extends Vue {
  public activities: IActivity[] = [];
  public limit = 15;
  public offset = 0;

  public async created() {
    watch(
      () => Store.state,
      async () => {
        await this.loadActivities();
      },
      { deep: true },
    );

    this.loadActivities();
  }

  public async prevClick() {
    this.offset -= this.limit;
    await this.loadActivities();
  }

  public async nextClick() {
    this.offset += this.limit;
    await this.loadActivities();
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }

  private async loadActivities() {
    if (Store.userId) {
      const params: ActivityFilter = {
        userId: Store.userId,
        offset: this.offset,
        limit: this.limit,
      };

      const response = await httpClient.get<IActivity[]>('/api/activities', {
        params,
      });

      this.activities = response.data;
    }
  }
}
</script>
