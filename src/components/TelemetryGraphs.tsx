import { FunctionalComponent } from "preact";
import { Lap } from "../types/lap";
import Plot from "react-plotly.js";

interface Props {
  lap: Lap;
  graphWidth: number;
}

const TelemetryGraphs: FunctionalComponent<Props> = ({ lap, graphWidth }) => {
  const layout: Partial<Plotly.Layout> = {
    width: graphWidth,
    height: 150,
    xaxis: { visible: false },
    yaxis: { visible: false },
    margin: {
      l: 5,
      r: 5,
      t: 5,
      b: 5,
    },
    showlegend: false,
  }
  return (
    <div>
      <Plot
        data={[
          {
            x: lap.Frames.map((c) => c.NormalizedCarPosition),
            y: lap.Frames.map((c) => c.Gas),
            // type: 'scatter',
            mode: "lines",
            name: "Throttle",
            marker: { color: "green" },
          },
          {
            x: lap.Frames.map((c) => c.NormalizedCarPosition),
            y: lap.Frames.map((c) => c.Brake),
            // type: 'scatter',
            mode: "lines",
            name: "Brake",
            marker: { color: "red" },
          },
        ]}
        layout={layout}
        config={{ staticPlot: true }}
      />
      <Plot
        data={[
          {
            x: lap.Frames.map((c) => c.NormalizedCarPosition),
            y: lap.Frames.map((c) => c.SteerAngle),
            // type: 'scatter',
            mode: "lines",
            name: "Throttle",
            marker: { color: "orange" },
          },
        ]}
        layout={layout}
        config={{ staticPlot: true }}
      />
      <Plot
        data={[
          {
            x: lap.Frames.map((c) => c.NormalizedCarPosition),
            y: lap.Frames.map((c) => c.Gear),
            // type: 'scatter',
            mode: "lines",
            name: "Throttle",
            marker: { color: "blue" },
          },
        ]}
        layout={layout}
        config={{ staticPlot: true }}
      />
      <Plot
        data={[
          {
            x: lap.Frames.map((c) => c.NormalizedCarPosition),
            y: lap.Frames.map((c) => c.RPM),
            // type: 'scatter',
            mode: "lines",
            name: "Throttle",
            marker: { color: "gray" },
          },
        ]}
        layout={layout}
        config={{ staticPlot: true }}
      />
      <Plot
        data={[
          {
            x: lap.Frames.map((c) => c.NormalizedCarPosition),
            y: lap.Frames.map((c) => c.SpeedKmh),
            // type: 'scatter',
            mode: "lines",
            name: "Throttle",
            marker: { color: "black" },
          },
        ]}
        layout={layout}
        config={{ staticPlot: true }}
      />
    </div>
  );
};

export default TelemetryGraphs;
