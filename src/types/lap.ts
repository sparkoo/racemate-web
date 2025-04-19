export interface Lap {
  Frames: Frame[];
  CarModel: Int16Array;
  Track: Int16Array;
  PlayerName: Int16Array;
  PlayerNick: Int16Array;
  PlayerSurname: Int16Array;
  LapTimeMs: number;
  TrackGripStatus: number;
  RainIntensity: number;
  SessionIndex: number;
  SessionType: number;
}

export interface Frame {
  NormalizedCarPosition: number;
  Gas: number;
  Brake: number;
  SteerAngle: number;
  Gear: number;
  RPM: number;
  SpeedKmh: number;
  CarCoordinates: number[];
}
