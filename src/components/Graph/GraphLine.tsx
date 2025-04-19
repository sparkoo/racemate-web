import { racemate } from "racemate-msg";

export interface GraphLap {
  lap: racemate.Lap;
  lines: GraphLine[];
}

export interface GraphLine {
  x: (frame: racemate.Frame) => number;
  y: (frame: racemate.Frame) => number;
  color: string;
  dashed?: boolean;
}
