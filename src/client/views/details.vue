<template>
  <div class="details tile is-ancestor" v-if="activity">
    <div class="tile is-vertical">
      <div class="tile">
        <div class="tile is-parent is-3">
          <div class="tile is-child notification is-warning">
            <div v-if="previousActivity">
              <button class="button is-info">
                <router-link
                  :to="{
                    name: 'Details',
                    params: { id: previousActivity.activityId },
                  }"
                >
                  <span class="icon is-small">
                    <font-awesome-icon icon="arrow-left"> </font-awesome-icon>
                  </span>
                </router-link>
              </button>
              <div class="icon-text">
                <span class="icon">
                  <font-awesome-icon icon="clock"></font-awesome-icon>
                </span>
                <span
                  >{{ formatDateTime(previousActivity.startTime) }} -
                  {{ formatTime(previousActivity.endTime) }}</span
                >
              </div>
              <button
                class="button is-danger"
                title="Link with previous"
                @click="mergeWithPrevious()"
              >
                <span class="icon is-small">
                  <font-awesome-icon icon="link"></font-awesome-icon>
                </span>
              </button>
            </div>
          </div>
        </div>
        <div class="tile is-parent is-6">
          <div class="tile is-child notification is-info">
            <div class="title icon-text">
              <span class="icon">
                <font-awesome-icon :icon="icon"></font-awesome-icon>
              </span>
              <span>{{ activity.name }}</span>
            </div>
            <div></div>
            <div class="icon-text">
              <span class="icon">
                <font-awesome-icon icon="clock"></font-awesome-icon>
              </span>
              <span
                >{{ formatDateTime(activity.startTime) }} -
                {{ formatTime(activity.endTime) }}</span
              >
            </div>
            <div class="icon-text">
              <span class="icon">
                <font-awesome-icon icon="tachometer-alt"></font-awesome-icon>
              </span>
              <span>{{ activity.avgSpeedKm.toFixed(2) }} kph</span>
            </div>
            <div class="icon-text">
              <span class="icon">
                <font-awesome-icon icon="tachometer-alt"></font-awesome-icon>
              </span>
              <span>{{ activity.distanceKm.toFixed(2) }} km</span>
            </div>
          </div>
        </div>
        <div class="tile is-parent is-3">
          <div class="tile is-child notification is-warning">
            <div v-if="nextActivity">
              <span
                >{{ formatDateTime(nextActivity.startTime) }} -
                {{ formatTime(nextActivity.endTime) }}</span
              >
            </div>
          </div>
        </div>
      </div>
      <div class="title" style="height: 50vh">
        <div class="tile is-parent" style="height: 100%">
          <div
            class="tile is-child notification is-primary"
            style="height: 100%"
          >
            <activity-map
              style="width: 100%; height: 100%"
              :id="id"
            ></activity-map>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="loading" v-else></div>
</template>

<script lang="ts">
import { watch } from '@vue/runtime-core';
import { Options, Vue } from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import { Activity } from '../../models/activity';
import ActivityMap from '../components/activity-map.vue';
import { router } from '../router';
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
  private timeFormat = new Intl.DateTimeFormat('en-GB', {
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
    await this.loadActivity();

    watch(
      () => this.id,
      async () => await this.loadActivity(),
    );
  }

  private async loadActivity() {
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

  public formatDateTime(time: Date | number) {
    return this.dateTimeFormat.format(new Date(time));
  }

  public formatTime(time: Date | number) {
    return this.timeFormat.format(new Date(time));
  }

  public async mergeWithPrevious() {
    if (!this.activity || !this.previousActivity) {
      return;
    }

    const response = await httpClient.post<Activity>(
      `/api/activities/${this.activity.activityId}/mergeWithPrevious`,
    );
    await router.push({
      name: 'Details',
      params: { id: response.data.activityId },
    });
  }
}
</script>

<style lang="scss">
.details {
  height: 100%;
}
</style>
