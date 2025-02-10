import { useEffect, useState } from "preact/hooks";
import "./app.css";
import Plot from "react-plotly.js";
import { format } from "date-fns";

interface Lap {
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

interface Frame {
  NormalizedCarPosition: number;
  Gas: number;
  Brake: number;
  SteerAngle: number;
  Gear: number;
  RPM: number;
  SpeedKmh: number;
  CarCoordinates: number[];
}

function int16ArrayToString(bytes: Int16Array) {
  let result = "";
  for (let i = 0; i < bytes.length && bytes[i] != 0; i++) {
    result += String.fromCharCode(bytes[i]);
  }
  return result;
}

export function App() {
  const [lap, setLap] = useState<Lap | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadLap = async () => {
      try {
        const response = await fetch("1739096360.json"); // Replace with your file path
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const lap = await response.json();
        setLap(lap);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred.");
        }
        console.error("Error loading coordinates:", err);
      }
    };
    console.log("hellow");
    loadLap();
  }, []); // Empty dependency array ensures this runs only once on mount

  if (lap != null) {
    return (
      <>
        <h1>blabol</h1>
        <button className="btn">Hello daisyUI</button>
        <ul>
          <li>Track: {int16ArrayToString(lap.Track)}</li>
          <li>Car: {int16ArrayToString(lap.CarModel)}</li>
          <li>
            Time: {format(new Date(lap.LapTimeMs), "mm:ss:SSS").toString()}
          </li>
          <li>
            Name: {int16ArrayToString(lap.PlayerName)}{" "}
            {int16ArrayToString(lap.PlayerSurname)}
          </li>
        </ul>
        <div class="w-full grid grid-cols-2">
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
              layout={{
                width: 1400,
                height: 100,
                xaxis: { visible: false },
                yaxis: { visible: false },
                margin: {
                  l: 5,
                  r: 5,
                  t: 5,
                  b: 5,
                },
                showlegend: false,
              }}
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
              layout={{
                width: 1400,
                height: 100,
                xaxis: { visible: false },
                yaxis: { visible: false },
                margin: {
                  l: 5,
                  r: 5,
                  t: 5,
                  b: 5,
                },
              }}
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
              layout={{
                width: 1400,
                height: 100,
                xaxis: { visible: false },
                yaxis: { visible: false },
                margin: {
                  l: 5,
                  r: 5,
                  t: 5,
                  b: 5,
                },
              }}
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
              layout={{
                width: 1400,
                height: 100,
                xaxis: { visible: false },
                yaxis: { visible: false },
                margin: {
                  l: 5,
                  r: 5,
                  t: 5,
                  b: 5,
                },
              }}
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
              layout={{
                width: 1400,
                height: 100,
                xaxis: { visible: false },
                yaxis: { visible: false },
                margin: {
                  l: 5,
                  r: 5,
                  t: 5,
                  b: 5,
                },
              }}
              config={{ staticPlot: true }}
            />
          </div>
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
                width: 800,
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
        </div>
      </>
    );
  } else {
    return (
      <>
        <h1>no data</h1>
      </>
    );
  }
}
