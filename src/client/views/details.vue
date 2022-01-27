<template>
  <div id="map" class="map"></div>
</template>

<script lang="ts">
import { Vue } from 'vue-class-component';
import L from 'leaflet';
import { Prop } from 'vue-property-decorator';
import { Location } from '../../models/location';
import { httpClient } from '../services/http';

export default class Details extends Vue {
  @Prop() public id!: string;
  public map?: L.Map;

  private locations: Location[] = [];

  public async mounted() {
    const response = await httpClient.get<Location[]>(
      `/api/locations/${this.id}`,
    );
    this.locations = response.data;

    this.map = L.map('map');
    L.tileLayer(
      'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}',
      {
        attribution:
          'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox/streets-v11',
        tileSize: 512,
        zoomOffset: -1,
        accessToken:
          'pk.eyJ1IjoiYWphY2tzb24zIiwiYSI6ImNreXhmaGhjcDBhbnIycHBndnlkcHd1bnMifQ.oyHzaE4R_xqE2mx-Jx1cvg',
      },
    ).addTo(this.map);
    const group = L.featureGroup();
    this.locations.forEach(location => {
      L.circle([location.latitude, location.longitude], {
        color: 'red',
        fillColor: '#f03',
        fillOpacity: 0.5,
        radius: location.accuracy,
      }).addTo(group);
    });
    group.addTo(this.map);
    this.map.fitBounds(group.getBounds());
  }
}
</script>

<style lang="scss">
@import 'leaflet/dist/leaflet.css';

.map {
  height: 700px;
}
</style>
