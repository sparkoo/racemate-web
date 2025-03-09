import { FunctionalComponent } from "preact";
import { racemate } from "racemate-msg";
import TelemetryGraph from "./Graph/TelemetryGraph";

interface Props {
  lap: racemate.Lap;
}

const TelemetryGraphs: FunctionalComponent<Props> = ({ lap }) => {
  return (
    <div>
      <TelemetryGraph
        lapsData={[
          {
            lap: lap,
            lines: [
              {
                x: (frame) => frame.normalized_car_position,
                y: (frame) => frame.gas,
                color: "green",
              },
              {
                x: (frame) => frame.normalized_car_position,
                y: (frame) => frame.brake,
                color: "red",
              },
            ],
          },
        ]}
      />
      <TelemetryGraph
        yMin={-1}
        lapsData={[
          {
            lap: lap,
            lines: [
              {
                x: (frame) => frame.normalized_car_position,
                y: (frame) => frame.steer_angle,
                color: "orange",
              },
            ],
          },
        ]}
      />
      <TelemetryGraph
        yMax={6}
        yMin={0}
        lapsData={[
          {
            lap: lap,
            lines: [
              {
                x: (frame) => frame.normalized_car_position,
                y: (frame) => frame.gear,
                color: "gray",
              },
            ],
          },
        ]}
      />
      <TelemetryGraph
        yMin={3000}
        yMax={8000}
        lapsData={[
          {
            lap: lap,
            lines: [
              {
                x: (frame) => frame.normalized_car_position,
                y: (frame) => frame.rpm,
                color: "yellow",
              },
            ],
          },
        ]}
      />
      <TelemetryGraph
        yMax={300}
        lapsData={[
          {
            lap: lap,
            lines: [
              {
                x: (frame) => frame.normalized_car_position,
                y: (frame) => frame.speed_kmh,
                color: "blue",
              },
            ],
          },
        ]}
      />
    </div>
  );
};

export default TelemetryGraphs;
