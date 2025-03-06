import { racemate } from "racemate-msg";

export interface GraphLap {
  lap: racemate.Lap
  lines: GraphLine[]
}

export interface GraphLine {
  yAxis: (frame: racemate.Frame) => number
  color: string
}
