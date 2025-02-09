import { useEffect, useState } from 'preact/hooks'
import './app.css'
import Plot from 'react-plotly.js';

export function App() {
  const [frames, setFrames] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCoordinates = async () => {
      try {
        const response = await fetch('1739096360.json'); // Replace with your file path
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const lap = await response.json()
        setFrames(lap.Frames);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred.");
        }
        console.error("Error loading coordinates:", err);
      }
    };

    loadCoordinates();
  }, []); // Empty dependency array ensures this runs only once on mount

  return (
    <>
      <div>
      <Plot
          data={[
            {
              x: frames.map(c => c.NormalizedCarPosition),
              y: frames.map(c => c.Gas),
              // type: 'scatter',
              mode: 'lines',
              name: "Throttle",
              marker: { color: 'green' },
            },
            {
              x: frames.map(c => c.NormalizedCarPosition),
              y: frames.map(c => c.Brake),
              // type: 'scatter',
              mode: 'lines',
              name: "Brake",
              marker: { color: 'red' },
            },
          ]}
          layout={{
            width: 1400,
            height: 100,
            xaxis: { visible: false },
            yaxis: { visible: false },
            margin: {
              l: 5, r: 5, t: 5, b: 5,
            },
            showlegend: false,
          }}
          config={{ staticPlot: true }}
        />
        <Plot
          data={[
            {
              x: frames.map(c => c.NormalizedCarPosition),
              y: frames.map(c => c.SteerAngle),
              // type: 'scatter',
              mode: 'lines',
              name: "Throttle",
              marker: { color: 'orange' },
            },
          ]}
          layout={{
            width: 1400,
            height: 100,
            xaxis: { visible: false },
            yaxis: { visible: false },
            margin: {
              l: 5, r: 5, t: 5, b: 5,
            }
          }}
          config={{ staticPlot: true }}
        />
        <Plot
          data={[
            {
              x: frames.map(c => c.NormalizedCarPosition),
              y: frames.map(c => c.Gear),
              // type: 'scatter',
              mode: 'lines',
              name: "Throttle",
              marker: { color: 'blue' },
            },
          ]}
          layout={{
            width: 1400,
            height: 100,
            xaxis: { visible: false },
            yaxis: { visible: false },
            margin: {
              l: 5, r: 5, t: 5, b: 5,
            }
          }}
          config={{ staticPlot: true }}
        />
        <Plot
          data={[
            {
              x: frames.map(c => c.NormalizedCarPosition),
              y: frames.map(c => c.RPM),
              // type: 'scatter',
              mode: 'lines',
              name: "Throttle",
              marker: { color: 'gray' },
            },
          ]}
          layout={{
            width: 1400,
            height: 100,
            xaxis: { visible: false },
            yaxis: { visible: false },
            margin: {
              l: 5, r: 5, t: 5, b: 5,
            }
          }}
          config={{ staticPlot: true }}
        />
        <Plot
          data={[
            {
              x: frames.map(c => c.NormalizedCarPosition),
              y: frames.map(c => c.SpeedKmh),
              // type: 'scatter',
              mode: 'lines',
              name: "Throttle",
              marker: { color: 'black' },
            },
          ]}
          layout={{
            width: 1400,
            height: 100,
            xaxis: { visible: false },
            yaxis: { visible: false },
            margin: {
              l: 5, r: 5, t: 5, b: 5,
            }
          }}
          config={{ staticPlot: true }}
        />
        <Plot
          data={[
            {
              x: frames.map(c => -c.CarCoordinates[0]),
              y: frames.map(c => c.CarCoordinates[2]),
              // type: 'scatter',
              mode: 'lines',
              marker: { color: 'red' },
            },
          ]}
          layout={{
            width: 1400,
            height: 800,
            xaxis: { visible: false },
            yaxis: { visible: false },
            margin: {
              l: 5, r: 5, t: 5, b: 5,
            }
          }}
          config={{ staticPlot: true }}
        />
      </div>
    </>
  )
}
