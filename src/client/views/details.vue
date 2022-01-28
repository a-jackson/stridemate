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
    var geojsonMarkerOptions = {
      radius: 5,
      fillColor: '#ff0000',
      color: '#ffffff',
      weight: 2,
      opacity: 1,
      fillOpacity: 0.9,
    };

    this.map = L.map('map');
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.map);

    const features = this.locations.map(location => {
      return {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [location.longitude, location.latitude],
        },
        properties: {
          tst: location.time,
          acc: location.accuracy,
          vel: location.velocity,
        },
      };
    });

    const geoJsonLayer = new L.GeoJSON(
      {
        type: 'FeatureCollection',
        features: features,
      } as GeoJSON.FeatureCollection,
      {
        pointToLayer: function (feature, latlng) {
          return L.circleMarker(latlng, geojsonMarkerOptions);
        },
      },
    );

    this.map.addLayer(geoJsonLayer);
    this.map.fitBounds(geoJsonLayer.getBounds());
  }
}
</script>

<style lang="scss">
@import 'leaflet/dist/leaflet.css';

.map {
  height: 700px;
}
</style>
