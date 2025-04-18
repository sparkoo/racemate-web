import { FunctionalComponent } from "preact";
import { racemate } from "racemate-msg";
import TelemetryGraph, { HoverData } from "./Graph/TelemetryGraph";
import { useState } from "preact/hooks";

interface Props {
  laps: racemate.Lap[];
  hoveredFrames: number[];
  hoveredFramesCallback: (hoveredFrames: number[]) => void;
}

const TelemetryGraphs: FunctionalComponent<Props> = ({
  laps,
  hoveredFrames,
  hoveredFramesCallback,
}) => {
  const [minValue, setMinValue] = useState<number>(0);
  const [maxValue, setMaxValue] = useState<number>(1);

  const [hoverData, setHoverData] = useState<HoverData>({
    pointerPosX: 0,
    frameIndex: hoveredFrames,
  });

  const calcValue = (e: Event): number => {
    const target = e.target as HTMLInputElement;
    const value = Number(target.value);
    return value / 100;
  };

  const setHoverDataCallback = (data: HoverData) => {
    hoveredFramesCallback(data.frameIndex);
    setHoverData(data);
  };

  return (
    <div>
      <input
        className={"w-full"}
        type="range"
        min={0}
        max={100}
        value={minValue * 100}
        onChange={(e) => setMinValue(calcValue(e))}
      />
      <br />
      <input
        className={"w-full"}
        type="range"
        min={0}
        max={100}
        value={maxValue * 100}
        onChange={(e) => setMaxValue(calcValue(e))}
      />
      <TelemetryGraph
        hoverData={hoverData}
        hoverDataCallback={setHoverDataCallback}
        xMin={minValue}
        xMax={maxValue}
        lapsData={laps.map((lap, i) => ({
          lap,
          lines: [
            {
              x: (frame) => frame.normalized_car_position,
              y: (frame) => frame.gas,
              color: "green",
              dashed: i === 1,
            },
            {
              x: (frame) => frame.normalized_car_position,
              y: (frame) => frame.brake,
              color: "red",
              dashed: i === 1,
            },
          ],
        }))}
      />
      <TelemetryGraph
        hoverData={hoverData}
        hoverDataCallback={setHoverDataCallback}
        xMin={minValue}
        xMax={maxValue}
        yMin={-1}
        lapsData={laps.map((lap, i) => ({
          lap,
          lines: [
            {
              x: (frame) => frame.normalized_car_position,
              y: (frame) => frame.steer_angle,
              color: "orange",
              dashed: i === 1,
            },
          ],
        }))}
      />
      <TelemetryGraph
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
              x: (frame) => frame.normalized_car_position,
              y: (frame) => frame.gear,
              color: "gray",
            },
          ],
        }))}
      />
      <TelemetryGraph
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
              x: (frame) => frame.normalized_car_position,
              y: (frame) => frame.rpm,
              color: "yellow",
            },
          ],
        }))}
      />
      <TelemetryGraph
        hoverData={hoverData}
        hoverDataCallback={setHoverDataCallback}
        xMin={minValue}
        xMax={maxValue}
        yMax={300}
        lapsData={laps.map((lap) => ({
          lap,
          lines: [
            {
              x: (frame) => frame.normalized_car_position,
              y: (frame) => frame.speed_kmh,
              color: "blue",
            },
          ],
        }))}
      />
    </div>
  );
};

export default TelemetryGraphs;
