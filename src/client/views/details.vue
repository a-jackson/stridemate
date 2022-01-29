<template>
  <div class="container details" v-if="activity">
    <div class="details__summary">
      <span class="icon">
        <font-awesome-icon :icon="icon"></font-awesome-icon>
      </span>
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
    const response = await httpClient.get<Activity>(
      `/api/activities/${this.id}`,
    );
    this.activity = response.data;
    this.$forceUpdate();
  }
}
</script>

<style lang="scss">
.details {
  height: 100%;
  display: grid;
  grid-template-rows: 1fr 1fr;
  grid-template-columns: 1fr 1fr;

  &__map {
    grid-column: 1 / 3;
  }

  &__map {
    grid-column: 1 / 3;
  }
}
</style>
