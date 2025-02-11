import { format } from "date-fns/format";
import { FunctionalComponent } from "preact";
import { useEffect, useRef, useState } from "preact/hooks";
import TelemetryGraphs from "./TelemetryGraphs";
import TelemetryMap from "./TelemetryMap";
import { Lap } from "../types/lap";

interface Props {}

function int16ArrayToString(bytes: Int16Array) {
  let result = "";
  for (let i = 0; i < bytes.length && bytes[i] != 0; i++) {
    result += String.fromCharCode(bytes[i]);
  }
  return result;
}

const Telemetry: FunctionalComponent<Props> = ({}) => {
  const [lap, setLap] = useState<Lap | null>(null);
  const [error, setError] = useState<string | null>(null);

  const divRef = useRef<HTMLDivElement>(null);
  const [graphWidth, setWidth] = useState<number>(0);

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
    loadLap();

    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setWidth(entry.contentRect.width);
      }
    });

    if (divRef.current) {
      observer.observe(divRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []); // Empty dependency array ensures this runs only once on mount

  if (lap != null) {
    return (
      <>
        <span>{error}</span>
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
          <div ref={divRef}>
            <TelemetryGraphs lap={lap} graphWidth={graphWidth} />
          </div>
          <div>
            <TelemetryMap lap={lap} graphWidth={graphWidth} />
          </div>
        </div>
      </>
    );
  } else {
    return <div>No Lap Data</div>
  }
};

export default Telemetry;
