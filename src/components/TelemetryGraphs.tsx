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
  const graphCount = 6; // Increased to include delta graph
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

  // Calculate delta between two laps
  const calculateDeltaData = () => {
    if (laps.length < 2) return [];

    const lap1 = laps[0];
    const lap2 = laps[1];

    // Create a map of position to time for each lap
    const lap1PositionToTime = new Map<number, number>();
    const lap2PositionToTime = new Map<number, number>();

    lap1.frames?.forEach((frame) => {
      if (frame.normalized_car_position !== undefined) {
        // Round position to 3 decimal places for better matching
        const position =
          Math.round(frame.normalized_car_position * 1000) / 1000;
        lap1PositionToTime.set(position, frame.current_time || 0);
      }
    });

    lap2.frames?.forEach((frame) => {
      if (frame.normalized_car_position !== undefined) {
        // Round position to 3 decimal places for better matching
        const position =
          Math.round(frame.normalized_car_position * 1000) / 1000;
        lap2PositionToTime.set(position, frame.current_time || 0);
      }
    });

    // Create delta frames with position and time difference
    const deltaFrames: racemate.Frame[] = [];

    // Use positions from lap1 as reference
    lap1.frames?.forEach((frame) => {
      if (frame.normalized_car_position !== undefined) {
        const position =
          Math.round(frame.normalized_car_position * 1000) / 1000;
        const lap1Time = lap1PositionToTime.get(position);
        const lap2Time = lap2PositionToTime.get(position);

        if (lap1Time !== undefined && lap2Time !== undefined) {
          // Calculate delta (lap1 - lap2), positive means lap1 is slower
          const timeDelta = lap1Time - lap2Time;

          // Create a new frame with the position and delta
          const deltaFrame = new racemate.Frame({
            normalized_car_position: position,
            // Store delta in speed_kmh field (repurposing for delta)
            speed_kmh: timeDelta / 1000,
          });

          deltaFrames.push(deltaFrame);
        }
      }
    });

    // Sort frames by position
    deltaFrames.sort(
      (a, b) =>
        (a.normalized_car_position || 0) - (b.normalized_car_position || 0)
    );

    return deltaFrames;
  };

  // Get delta frames
  const deltaFrames = calculateDeltaData();

  // Create a virtual lap for delta data
  const deltaLap = new racemate.Lap({
    frames: deltaFrames,
  });

  return (
    <div ref={containerRef} className="h-full flex flex-col">
      {/* Delta Graph - New graph showing time difference between laps */}
      <TelemetryGraph
        height={calculateGraphHeight()}
        hoverData={hoverData}
        hoverDataCallback={() => {}}
        xMin={xMin}
        xMax={xMax}
        yMin={-1} // Allow for negative values (when lap1 is faster)
        yMax={1} // Adjust based on expected delta range
        lapsData={[
          {
            lap: deltaLap,
            lines: [
              {
                x: (frame) => frame?.normalized_car_position || 0,
                y: (frame) => frame?.speed_kmh || 0, // Using speed_kmh field to store delta
                color: "purple", // Purple for delta
                dashed: false,
              },
            ],
          },
        ]}
      />
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
