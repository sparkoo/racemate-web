import { FunctionalComponent } from "preact";
import Plot from "react-plotly.js";
import { racemate } from "racemate-msg";
import { useState } from "preact/hooks";
import TelemetryGraph from "./Graph/TelemetryGraph";
import { GraphLap, GraphLine } from "./Graph/GraphLine";

interface Props {
  lap: racemate.Lap;
  graphWidth: number;
}

const TelemetryGraphs: FunctionalComponent<Props> = ({ lap, graphWidth }) => {
  const [layout, setLayout] = useState<Partial<Plotly.Layout>>({
    // width: graphWidth,
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
  });

  const handleHover = (data: any): void => {
    if (data && data.points && data.points.length > 0) {
      const hoverX: number = data.points[0].x;
      const hoverY: number = data.points[0].y;
      setLayout({
        ...layout,
        shapes: [
          {
            type: "line",
            x0: hoverX,
            x1: hoverX,
            y0: 0,
            y1: 1,
            line: {
              color: "red",
              width: 1,
            },
          },
        ],
        annotations: [
          // Add annotation
          {
            x: hoverX,
            y: hoverY,
            text: hoverY.toString(),
            showarrow: true,
            arrowhead: 1,
            ax: 20,
            ay: -30,
          },
        ],
      });
    }
  };

  const handleUnhover = (): void => {
    setLayout({ ...layout, shapes: [] });
  };

  const handleChange = (): void => {
    setLayout({ ...layout, shapes: [] });
  };

  const throttleLine: GraphLine = {
    x: (frame) => frame.normalized_car_position,
    y: (frame) => frame.gas,
    color: "green",
  };
  const breakLine: GraphLine = {
    x: (frame) => frame.normalized_car_position,
    y: (frame) => frame.brake,
    color: "red",
  };

  return (
    <div>
      <TelemetryGraph
        width={graphWidth}
        height={150}
        lapData={[{ lap: lap, lines: [throttleLine, breakLine] }]}
      />
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
        onHover={handleHover}
        onUnhover={handleUnhover}
        onRelayout={handleChange}
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
