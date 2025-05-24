import { FunctionalComponent } from "preact";
import { racemate } from "racemate-msg";
import TelemetryGraph, { HoverData } from "./Graph/TelemetryGraph";
import { useEffect, useRef, useState } from "preact/hooks";

interface Props {
  laps: racemate.Lap[];
  hoverData: HoverData;
  containerHeight?: number; // Optional prop to override container height
  xMin?: number;
  xMax?: number;
}

const TelemetryGraphs: FunctionalComponent<Props> = ({
  laps,
  hoverData,
  containerHeight,
  xMin = 0,
  xMax = 1,
}) => {
  // Use the xMin and xMax props for zoom range
  const [availableHeight, setAvailableHeight] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Hover data is now controlled by parent component

  // Number of graphs we're displaying
  const graphCount = 5;
  // Space for sliders and padding
  const controlsHeight = 50;

  // Calculate the height for each graph
  const calculateGraphHeight = () => {
    if (containerHeight) {
      // Subtract an extra buffer to ensure all graphs fit
      return Math.floor((containerHeight - controlsHeight - 20) / graphCount);
    }

    if (containerRef.current) {
      // Subtract an extra buffer to ensure all graphs fit
      return Math.floor((availableHeight - controlsHeight - 20) / graphCount);
    }

    return 100; // Fallback height
  };

  // Update available height when container size changes
  useEffect(() => {
    if (!containerRef.current) return;

    const updateHeight = () => {
      if (containerRef.current) {
        setAvailableHeight(containerRef.current.clientHeight);
      }
    };

    // Set initial height
    updateHeight();

    // Set up resize observer
    const observer = new ResizeObserver(updateHeight);
    observer.observe(containerRef.current);

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, []);

  // Zoom is now handled by TimelineControl

  // No longer need to handle hover data callbacks

  return (
    <div ref={containerRef} className="h-full flex flex-col">
      <TelemetryGraph
        height={calculateGraphHeight()}
        hoverData={hoverData}
        hoverDataCallback={() => {}} // Dummy callback as we're not handling hover events here
        xMin={xMin}
        xMax={xMax}
        lapsData={laps.map((lap, i) => ({
          lap,
          lines: [
            {
              x: (frame) => frame?.normalized_car_position || 0,
              y: (frame) => frame?.gas || 0,
              color: "green",
              dashed: i === 1,
            },
            {
              x: (frame) => frame?.normalized_car_position || 0,
              y: (frame) => frame?.brake || 0,
              color: "red",
              dashed: i === 1,
            },
          ],
        }))}
      />
      <TelemetryGraph
        height={calculateGraphHeight()}
        hoverData={hoverData}
        hoverDataCallback={() => {}} // Dummy callback as we're not handling hover events here
        xMin={xMin}
        xMax={xMax}
        yMin={-1}
        lapsData={laps.map((lap, i) => ({
          lap,
          lines: [
            {
              x: (frame) => frame?.normalized_car_position || 0,
              y: (frame) => frame?.steer_angle || 0,
              color: "orange",
              dashed: i === 1,
            },
          ],
        }))}
      />
      <TelemetryGraph
        height={calculateGraphHeight()}
        hoverData={hoverData}
        hoverDataCallback={() => {}} // Dummy callback as we're not handling hover events here
        xMin={xMin}
        xMax={xMax}
        yMax={6}
        yMin={0}
        lapsData={laps.map((lap, i) => ({
          lap,
          lines: [
            {
              x: (frame) => frame?.normalized_car_position || 0,
              y: (frame) => frame?.gear || 0,
              color: "gray",
              dashed: i === 1,
            },
          ],
        }))}
      />
      <TelemetryGraph
        height={calculateGraphHeight()}
        hoverData={hoverData}
        hoverDataCallback={() => {}} // Dummy callback as we're not handling hover events here
        xMin={xMin}
        xMax={xMax}
        yMin={0}
        yMax={8000}
        lapsData={laps.map((lap, i) => ({
          lap,
          lines: [
            {
              x: (frame) => frame?.normalized_car_position || 0,
              y: (frame) => frame?.rpm || 0,
              color: "yellow",
              dashed: i === 1,
            },
          ],
        }))}
      />
      <TelemetryGraph
        height={calculateGraphHeight()}
        hoverData={hoverData}
        hoverDataCallback={() => {}} // Dummy callback as we're not handling hover events here
        xMin={xMin}
        xMax={xMax}
        yMax={300}
        lapsData={laps.map((lap, i) => ({
          lap,
          lines: [
            {
              x: (frame) => frame?.normalized_car_position || 0,
              y: (frame) => frame?.speed_kmh || 0,
              color: "blue",
              dashed: i === 1,
            },
          ],
        }))}
      />
    </div>
  );
};

export default TelemetryGraphs;
