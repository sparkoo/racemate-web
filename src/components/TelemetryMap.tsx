import { FunctionalComponent } from "preact";
import Plot from "react-plotly.js";
import { racemate } from "racemate-msg";

interface Props {
  lap: racemate.Lap;
  graphWidth: number;
}

const TelemetryMap: FunctionalComponent<Props> = ({ lap, graphWidth }) => {
  return (
    <div>
      <Plot
        data={[
          {
            x: lap.frames.map((c) => -c.car_coordinate_x),
            y: lap.frames.map((c) => c.car_coordinate_z),
            mode: "lines",
            marker: { color: "red" },
          },
        ]}
        layout={{
          width: graphWidth,
          height: 800,
          xaxis: { visible: false },
          yaxis: { visible: false },
          margin: {
            l: 5,
            r: 5,
            t: 5,
            b: 5,
            pad: 0,
          },
          paper_bgcolor: "rgba(0,0,0,0)",
          plot_bgcolor: "rgba(0,0,0,0)",
        }}
        config={{ staticPlot: true }}
      />
    </div>
  );
};

export default TelemetryMap;
