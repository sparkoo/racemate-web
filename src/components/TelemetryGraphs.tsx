import { FunctionalComponent } from "preact";
import { racemate } from "racemate-msg";
import TelemetryGraph, { HoverData } from "./Graph/TelemetryGraph";
import { useEffect, useRef, useState } from "preact/hooks";
import DualRangeSlider from "./UI/DualRangeSlider";

interface Props {
  laps: racemate.Lap[];
  hoveredFrames: number[];
  hoveredFramesCallback: (hoveredFrames: number[]) => void;
  containerHeight?: number; // Optional prop to override container height
}

const TelemetryGraphs: FunctionalComponent<Props> = ({
  laps,
  hoveredFrames,
  hoveredFramesCallback,
  containerHeight,
}) => {
  const [minValue, setMinValue] = useState<number>(0);
  const [maxValue, setMaxValue] = useState<number>(1);
  const [availableHeight, setAvailableHeight] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const [hoverData, setHoverData] = useState<HoverData>({
    pointerPosX: 0,
    frameIndex: hoveredFrames,
  });

  // Number of graphs we're displaying
  const graphCount = 5;
  // Space for sliders and padding
  const controlsHeight = 70;

  // Calculate the height for each graph
  const calculateGraphHeight = () => {
    if (containerHeight) {
      return Math.floor((containerHeight - controlsHeight) / graphCount);
    }

    if (containerRef.current) {
      return Math.floor((availableHeight - controlsHeight) / graphCount);
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

  const handleRangeChange = (min: number, max: number) => {
    setMinValue(min);
    setMaxValue(max);
  };

  const handleRangeReset = () => {
    setMinValue(0);
    setMaxValue(1);
  };

  const setHoverDataCallback = (data: HoverData) => {
    hoveredFramesCallback(data.frameIndex);
    setHoverData(data);
  };

  return (
    <div ref={containerRef} className="h-full flex flex-col">
      <DualRangeSlider
        minValue={minValue}
        maxValue={maxValue}
        onChange={handleRangeChange}
        onReset={handleRangeReset}
      />
      <TelemetryGraph
        height={calculateGraphHeight()}
        hoverData={hoverData}
        hoverDataCallback={setHoverDataCallback}
        xMin={minValue}
        xMax={maxValue}
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
        hoverDataCallback={setHoverDataCallback}
        xMin={minValue}
        xMax={maxValue}
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
        hoverDataCallback={setHoverDataCallback}
        xMin={minValue}
        xMax={maxValue}
        yMax={6}
        yMin={0}
        lapsData={laps.map((lap) => ({
          lap,
          lines: [
            {
              x: (frame) => frame?.normalized_car_position || 0,
              y: (frame) => frame?.gear || 0,
              color: "gray",
            },
          ],
        }))}
      />
      <TelemetryGraph
        height={calculateGraphHeight()}
        hoverData={hoverData}
        hoverDataCallback={setHoverDataCallback}
        xMin={minValue}
        xMax={maxValue}
        yMin={0}
        yMax={8000}
        lapsData={laps.map((lap) => ({
          lap,
          lines: [
            {
              x: (frame) => frame?.normalized_car_position || 0,
              y: (frame) => frame?.rpm || 0,
              color: "yellow",
            },
          ],
        }))}
      />
      <TelemetryGraph
        height={calculateGraphHeight()}
        hoverData={hoverData}
        hoverDataCallback={setHoverDataCallback}
        xMin={minValue}
        xMax={maxValue}
        yMax={300}
        lapsData={laps.map((lap) => ({
          lap,
          lines: [
            {
              x: (frame) => frame?.normalized_car_position || 0,
              y: (frame) => frame?.speed_kmh || 0,
              color: "blue",
            },
          ],
        }))}
      />
    </div>
  );
};

export default TelemetryGraphs;
