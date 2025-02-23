import { FunctionalComponent } from "preact";
import Plot from "react-plotly.js";
import { racemate } from "racemate-msg";

interface Props {
  lap: racemate.Lap;
  graphWidth: number;
}

const TelemetryGraphs: FunctionalComponent<Props> = ({ lap, graphWidth }) => {
  const layout: Partial<Plotly.Layout> = {
    width: graphWidth,
    height: 150,
    xaxis: { visible: true, rangeslider: { visible: true }, fixedrange: false },
    yaxis: { visible: false, fixedrange: true },
    margin: {
      l: 5,
      r: 5,
      t: 5,
      b: 5,
    },
    showlegend: false,
  };
  return (
    <div>
      <Plot
        data={[
          {
            x: lap.frames.map((c) => c.normalized_car_position),
            y: lap.frames.map((c) => c.gas),
            // type: 'scatter',
            mode: "lines",
            name: "Throttle",
            marker: { color: "green" },
          },
          {
            x: lap.frames.map((c) => c.normalized_car_position),
            y: lap.frames.map((c) => c.brake),
            // type: 'scatter',
            mode: "lines",
            name: "Brake",
            marker: { color: "red" },
          },
        ]}
        layout={layout}
        config={{ staticPlot: false, displayModeBar: false }}
      />
      <Plot
        data={[
          {
            x: lap.frames.map((c) => c.normalized_car_position),
            y: lap.frames.map((c) => c.steer_angle),
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
            x: lap.frames.map((c) => c.normalized_car_position),
            y: lap.frames.map((c) => c.gear),
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
            x: lap.frames.map((c) => c.normalized_car_position),
            y: lap.frames.map((c) => c.rpm),
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
            x: lap.frames.map((c) => c.normalized_car_position),
            y: lap.frames.map((c) => c.speed_kmh),
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
