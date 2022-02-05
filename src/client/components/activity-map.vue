<template>
  <div ref="element"></div>
</template>
<script lang="ts">
import L from 'leaflet';
import { Vue } from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import { httpClient } from '../services/http';
import { Location } from '../../models/location';
import { watch } from '@vue/runtime-core';
import { ActivityLocation } from '../../models/activity-location';

export default class ActivityMap extends Vue {
  @Prop() public id!: string;
  public map?: L.Map;
  public geoJsonLayer?: L.GeoJSON;

  public created() {
    watch(
      () => this.id,
      async () => await this.loadData(),
    );
  }

  public async loadData() {
    const response = await httpClient.get<ActivityLocation[]>(
      `/api/locations/${this.id}`,
    );

    const features = {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: response.data.map(location => [
          location.longitude,
          location.latitude,
        ]),
      },
      properties: null,
    } as GeoJSON.Feature<GeoJSON.LineString>;

    if (this.map && this.geoJsonLayer) {
      this.geoJsonLayer.clearLayers();
      this.geoJsonLayer.addData(features);
      this.map.fitBounds(this.geoJsonLayer.getBounds());
    }
  }

  public async mounted() {
    this.map = L.map(this.$refs.element as HTMLElement);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.map);

    var empty_geojson = {
      type: 'FeatureCollection',
      features: [],
    } as GeoJSON.FeatureCollection;

    this.geoJsonLayer = new L.GeoJSON(empty_geojson);

    this.map.addLayer(this.geoJsonLayer);

    await this.loadData();
  }
}
</script>
<style lang="scss">
@import 'leaflet/dist/leaflet.css';
</style>
