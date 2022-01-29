<template>
  <div class="container details" v-if="activity">
    <div>{{ previous }}</div>
    <div>{{ next }}</div>
    <div class="details__summary">
      <span class="icon">
        <font-awesome-icon :icon="icon"></font-awesome-icon>
      </span>
      {{ startTime }} - {{ endTime }}
    </div>
    <activity-map class="details__map" :id="id"></activity-map>
  </div>
  <div class="loading" v-else></div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import { Activity } from '../../models/activity';
import ActivityMap from '../components/activity-map.vue';
import { httpClient } from '../services/http';

@Options({
  components: {
    ActivityMap,
  },
})
export default class Details extends Vue {
  @Prop() public id!: string;
  public activity?: Activity;
  public previousActivity?: Activity;
  public nextActivity?: Activity;

  private dateTimeFormat = new Intl.DateTimeFormat('en-GB', {
    year: '2-digit',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

  public get icon() {
    switch (this.activity?.name) {
      case 'Walking':
        return 'walking';
      case 'Running':
        return 'running';
      case 'Driving':
        return 'car';
    }
  }

  public async created() {
    const activityResponse = httpClient.get<Activity>(
      `/api/activities/${this.id}`,
    );
    const previousActivityResponse = httpClient.get<Activity>(
      `/api/activities/${this.id}/previous`,
    );
    const nextActivityResponse = httpClient.get<Activity>(
      `/api/activities/${this.id}/next`,
    );
    this.activity = (await activityResponse).data;
    this.previousActivity = (await previousActivityResponse).data;
    this.nextActivity = (await nextActivityResponse).data;
    this.$forceUpdate();
  }

  public get startTime() {
    if (this.activity) {
      return this.formatTime(this.activity.startTime);
    }
  }

  public get endTime() {
    if (this.activity) {
      return this.formatTime(this.activity.endTime);
    }
  }

  public get previous() {
    if (this.previousActivity) {
      return `${this.formatTime(
        this.previousActivity.startTime,
      )}-${this.formatTime(this.previousActivity.endTime)}`;
    }
  }

  public get next() {
    if (this.nextActivity) {
      return `${this.formatTime(this.nextActivity.startTime)}-${this.formatTime(
        this.nextActivity.endTime,
      )}`;
    }
  }

  public formatTime(time: Date | number) {
    return this.dateTimeFormat.format(new Date(time));
  }
}
</script>

<style lang="scss">
.details {
  height: 100%;
  display: grid;
  grid-template-rows: 2rem 4rem 1fr;
  grid-template-columns: 1fr 1fr;

  &__summary {
    grid-column: 1 / 3;
  }

  &__map {
    grid-column: 1 / 3;
  }
}
</style>
