export interface Activity {
  activityId: number;
  name: string;
  startTime: Date;
  endTime: Date;
  distanceKm: number;
  avgSpeedKm: number;
  deviceId: number;
  device: string;
}
