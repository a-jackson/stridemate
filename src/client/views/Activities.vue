<template>
  <div class="container">
    <div class="box" v-for="activity in activities" :key="activity.activityId">
      <activity :activity="activity"></activity>
    </div>
  </div>
</template>
<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import axios from 'axios';
import { Activity as IActivity } from '../../models/activity';
import Activity from '../components/Activity.vue';

@Options({
  components: {
    Activity,
  },
})
export default class Activities extends Vue {
  private activities: IActivity[] = [];

  public async created() {
    const client = axios.create();

    const response = await client.get<IActivity[]>('/api/activities');
    this.activities = response.data;
  }
}
</script>
