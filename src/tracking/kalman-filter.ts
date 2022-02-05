const MinAccuracy = 1;

export class KalmanFilter {
  private qMps: number;
  private timeMs: number;
  private lat: number;
  private lng: number;
  private variance: number; // P matrix.  Negative means object uninitialised.  NB: units irrelevant, as long as same units used throughout

  constructor(qMps: number) {
    this.qMps = qMps;
    this.variance = -1;
  }

  public get timestamp() {
    return this.timeMs;
  }
  public get latitude() {
    return this.lat;
  }
  public get longtiude() {
    return this.lng;
  }
  public get accuracy() {
    return Math.sqrt(this.variance);
  }

  public process(
    latitude: number,
    longitude: number,
    accuracy: number,
    timeMs: number,
  ) {
    if (accuracy < MinAccuracy) accuracy = MinAccuracy;

    if (this.variance < 0) {
      // if variance < 0, object is unitialised, so initialise with current values
      this.timeMs = timeMs;
      this.lat = latitude;
      this.lng = longitude;
      this.variance = accuracy * accuracy;
    } else {
      // else apply Kalman filter methodology
      const timeDiff = timeMs - this.timeMs;
      if (timeDiff > 0) {
        // time has moved on, so the uncertainty in the current position increases
        this.variance += (timeDiff * this.qMps * this.qMps) / 1000;
        this.timeMs = timeMs;
      }

      // Kalman gain matrix K = Covarariance * Inverse(Covariance + MeasurementVariance)
      // NB: because K is dimensionless, it doesn't matter that variance has different units to lat and lng
      const K = this.variance / (this.variance + accuracy * accuracy);
      // apply K
      this.lat += K * (latitude - this.lat);
      this.lng += K * (longitude - this.lng);
      // new Covarariance  matrix is (IdentityMatrix - K) * Covarariance
      this.variance = (1 - K) * this.variance;
    }
  }
}
