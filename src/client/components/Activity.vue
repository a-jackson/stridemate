<template>
  <div class="activity">
    <h2 class="activity__title title is-5 icon-text">
      <font-awesome-icon class="icon" :icon="icon"></font-awesome-icon>
      <span>{{ activity.name }}</span>
    </h2>
    <div class="activity__date">
      <span>{{ new Date(activity.startTime).toLocaleString() }}</span>
    </div>
    <div class="activity__distance">
      <span>{{ activity.distanceKm.toFixed(2) }} km</span>
    </div>
    <div class="activity__speed">
      <span>{{ activity.avgSpeedKm.toFixed(2) }} kph</span>
    </div>
    <div class="activity__duration">
      <span>{{ duration.toFixed(0) }} min</span>
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
}
</script>

<style lang="scss">
.activity {
  display: grid;
  grid-template-areas:
    'title title . date'
    'distance . . .'
    'speed . . .'
    'duration . . .';
  grid-template-columns: auto auto 1fr auto;

  &__title {
    grid-area: title;
  }

  &__date {
    grid-area: date;
  }

  &__distance {
    grid-area: distance;
  }

  &__speed {
    grid-area: speed;
  }

  &__duration {
    grid-area: duration;
  }
}
</style>
