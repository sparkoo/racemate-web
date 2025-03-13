import { FunctionalComponent } from "preact";
import { racemate } from "racemate-msg";
import { GraphLap } from "./GraphLine";
import * as d3 from "d3";
import { useEffect, useRef, useState } from "preact/hooks";

interface Props {
  height?: number;
  xMin?: number;
  xMax?: number;
  yMin?: number;
  yMax?: number;

  lapsData: GraphLap[];

  pointerPosX: number;
  pointerPosXCallback: (x: number) => void;
}

const TelemetryGraph: FunctionalComponent<Props> = ({
  height = 200,
  lapsData,
  xMin = 0,
  xMax = 1,
  yMin = 0,
  yMax = 1,
  pointerPosXCallback,
  pointerPosX,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [verticalLine, setVerticalLine] =
    useState<d3.Selection<SVGLineElement, unknown, null, undefined>>();
  const [graphsRendered, setGraphsRendered] = useState<boolean>(false);
  const [hoveredValue, setHoveredValue] = useState<{n: number, color: string}[]>([]);

  const width = 800;
  const xScale = d3.scaleLinear().domain([xMin, xMax]).range([0, width]);
  const yScale = d3.scaleLinear().domain([yMin, yMax]).range([height, 0]);

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);

    if (!graphsRendered) {
      // Clear previous content
      svg.selectAll("*").remove();

      lapsData.forEach((lapData) => {
        lapData.lines.forEach((telemetryLine) => {
          // Set up scales

          // Create the line generator
          const line = d3
            .line<racemate.Frame>()
            .x((d) => xScale(telemetryLine.x(d)))
            .y((d) => yScale(telemetryLine.y(d)));

          // Draw the line
          svg
            .append("path")
            .datum(lapData.lap.frames)
            .attr("fill", "none")
            .attr("stroke", telemetryLine.color)
            .attr("stroke-width", 1)
            .attr("d", line);
        });
      });

      setVerticalLine(
        svg
          .append("line")
          .attr("stroke", "lightgray")
          .attr("stroke-width", 1)
          .attr("x1", pointerPosX)
          .attr("x2", pointerPosX)
          .attr("y1", 0)
          .attr("y2", height)
          .attr("stroke-dasharray", 6)
          .attr("display", null)
      );

      setGraphsRendered(true);
    }

    if (verticalLine) {
      verticalLine.attr("transform", `translate(${pointerPosX},0)`);
      const currentHoveredValues: {n: number, color: string}[] = [];
      lapsData.forEach((lapData) => {
        const i = translateXPosToFrameIndex(pointerPosX, lapData);
        lapData.lines.forEach((line) => {
          currentHoveredValues.push({n: line.y(lapData.lap.frames[i]), color: line.color});
        });
      });
      setHoveredValue(currentHoveredValues);
    }
  }, [pointerPosX]);

  const translateXPosToFrameIndex = (
    xPos: number,
    lapData: GraphLap
  ): number => {
    const scaledX = xScale.invert(xPos);
    return bisect(lapData.lap.frames, scaledX);
  };

  const bisect = d3.bisector(
    (d) => (d as racemate.Frame).normalized_car_position
  ).center;

  const onEv = (e: PointerEvent): void => {
    if (!verticalLine) return;
    pointerPosXCallback(d3.pointer(e)[0]);
  };

  return (
    <div className={"bg-gray-800 mt-3"}>
      <svg
        ref={svgRef}
        width={"100%"}
        height={height}
        onPointerEnter={(e: PointerEvent) => onEv(e)}
        onPointerMove={(e: PointerEvent) => onEv(e)}
        onPointerLeave={(e: PointerEvent) => onEv(e)}
      />
      {hoveredValue.map((n) => (
        <p style={`color: ${n.color};`}>{n.n.toFixed(3)}</p>
      ))}
    </div>
  );
};

export default TelemetryGraph;
