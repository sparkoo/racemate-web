import { FunctionalComponent } from "preact";
import { Lap } from "../types/lap";
import Plot from "react-plotly.js";

interface Props {
  lap: Lap;
  graphWidth: number;
}

const TelemetryMap: FunctionalComponent<Props> = ({ lap, graphWidth }) => {
  return (
    <div>
      <Plot
        data={[
          {
            x: lap.Frames.map((c) => -c.CarCoordinates[0]),
            y: lap.Frames.map((c) => c.CarCoordinates[2]),
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
