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
      <span>{{ new Date(activity.startTime).toLocaleString() }}</span>
    </div>
    <div class="ml-2">
      <button class="button is-primary is-inverted">
        <span class="icon is-small" title="View Map">
          <font-awesome-icon icon="map-marked-alt"></font-awesome-icon>
        </span>
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
// .activity {
//   // display: grid;
//   grid-template-areas:
//     'title title . date'
//     'distance speed duration buttons';
//   grid-template-columns: 1fr 1fr 1fr 1fr;
//   grid-gap: 1rem;

//   &__title {
//     grid-area: title;
//   }

//   &__date {
//     grid-area: date;
//     justify-self: right;
//   }

//   &__distance {
//     grid-area: distance;
//   }

//   &__speed {
//     grid-area: speed;
//   }

//   &__duration {
//     grid-area: duration;
//   }

//   &__buttons {
//     grid-area: buttons;
//     justify-self: right;
//   }
// }
</style>
