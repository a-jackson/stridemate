<template>
  <div class="is-flex is-align-items-center">
    <span class="icon" :title="activity.name">
      <font-awesome-icon :icon="icon"></font-awesome-icon>
    </span>

    <div class="ml-2">
      <span>{{ activity.distanceKm.toFixed(2) }} km</span>
    </div>
    <div class="ml-2">
      <span>{{ activity.avgSpeedKm.toFixed(2) }} kph</span>
    </div>
    <div class="ml-2">
      <span>{{ duration.toFixed(0) }} min</span>
    </div>
    <div class="ml-2">
      <span>{{ date }}</span>
    </div>
    <div class="ml-2">
      <button class="button is-primary is-inverted" title="View Map">
        <router-link
          :to="{ name: 'Details', params: { id: activity.activityId } }"
        >
          <span class="icon is-small">
            <font-awesome-icon icon="map-marked-alt"></font-awesome-icon>
          </span>
        </router-link>
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import { Activity as IActivity } from '../../models/activity';

@Options({})
export default class Activity extends Vue {
  @Prop() public activity!: IActivity;

  private dateTimeFormat = new Intl.DateTimeFormat('en-GB', {
    // dateStyle: 'short',
    // timeStyle: 'short',
    year: '2-digit',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

  public get icon() {
    switch (this.activity.name) {
      case 'Walking':
        return 'walking';
      case 'Running':
        return 'running';
      case 'Driving':
        return 'car';
    }
  }

  public get duration() {
    const time =
      new Date(this.activity.endTime).getTime() -
      new Date(this.activity.startTime).getTime();

    return time / 1000 / 60;
  }

  public get date() {
    return this.dateTimeFormat.format(new Date(this.activity.startTime));
  }
}
</script>
