import { FunctionalComponent } from "preact";
import { racemate } from "racemate-msg";
import { GraphLap } from "./GraphLine";
import * as d3 from "d3";
import { useEffect, useRef, useState } from "preact/hooks";

interface Props {
  height: number; // Make height required
  xMin?: number;
  xMax?: number;
  yMin?: number;
  yMax?: number;

  lapsData: GraphLap[];

  hoverData: HoverData;
  hoverDataCallback: (hoverData: HoverData) => void;
}

export interface HoverData {
  pointerPosX: number;
  frameIndex: number[];
}

const TelemetryGraph: FunctionalComponent<Props> = ({
  height,
  lapsData,
  xMin = 0,
  xMax = 1,
  yMin = 0,
  yMax = 1,
  hoverDataCallback,
  hoverData,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [verticalLine, setVerticalLine] =
    useState<d3.Selection<SVGLineElement, unknown, null, undefined>>();

  // We still need to set the hovered values for potential future use
  const [, setHoveredValue] = useState<
    { n: number; color: string }[]
  >([]);

  const [width, setWidth] = useState<number>(800);

  // Responsive width: use ResizeObserver on container
  useEffect(() => {
    if (!svgRef.current) return;
    const container = svgRef.current.parentElement;
    if (!container) return;
    const observer = new window.ResizeObserver((entries) => {
      for (let entry of entries) {
        if (entry.contentRect) {
          setWidth(entry.contentRect.width);
        }
      }
    });
    observer.observe(container);
    // Set initial width
    setWidth(container.getBoundingClientRect().width);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);

    // Always redraw on width/height change
    // Clear previous content
    svg.selectAll("*").remove();

    // Create scales with current width/height
    const { xScale, yScale } = getScales();

    lapsData.forEach((lapData) => {
      lapData.lines.forEach((telemetryLine) => {
        // Filter frames by xMin/xMax (normalized_car_position)
        const filteredFrames = (lapData.lap.frames || []).filter(
          (frame) => {
            const pos = telemetryLine.x(frame);
            return pos >= xMin && pos <= xMax;
          }
        );
        // Create the line generator
        const line = d3
          .line<racemate.Frame>()
          .x((d) => xScale(telemetryLine.x(d)))
          .y((d) => yScale(telemetryLine.y(d)));

        // Draw the line
        svg
          .append("path")
          .datum(filteredFrames)
          .attr("fill", "none")
          .attr("stroke", telemetryLine.color)
          .attr("stroke-width", 1)
          .attr("stroke-dasharray", telemetryLine.dashed ? "6,4" : null)
          .attr("d", line);
      });
    });

    setVerticalLine(
      svg
        .append("line")
        .attr("stroke", "lightgray")
        .attr("stroke-width", 1)
        .attr("x1", hoverData.pointerPosX)
        .attr("x2", hoverData.pointerPosX)
        .attr("y1", 0)
        .attr("y2", height)
        .attr("stroke-dasharray", 6)
        .attr("display", null)
    );

    if (verticalLine) {
      verticalLine
        .attr("x1", hoverData.pointerPosX)
        .attr("x2", hoverData.pointerPosX);

      const currentHoveredValues: { n: number; color: string }[] = [];
      lapsData.forEach((lapData) => {
        lapData.lines.forEach((line) => {
          const frameIndex = hoverData.frameIndex[0];
          const frame =
            lapData.lap.frames && frameIndex < lapData.lap.frames.length
              ? lapData.lap.frames[frameIndex]
              : undefined;
          if (frame) {
            currentHoveredValues.push({
              n: line.y(frame),
              color: line.color,
            });
          }
        });
      });
      setHoveredValue(currentHoveredValues);
    }
  }, [hoverData, width, height, xMin, xMax, yMin, yMax, lapsData]);

  function getScales() {
    return {
      xScale: d3.scaleLinear().domain([xMin, xMax]).range([0, width]),
      yScale: d3.scaleLinear().domain([yMin, yMax]).range([height, 0]),
    };
  }

  const translateXPosToFrameIndex = (
    xPos: number,
    lapData: GraphLap
  ): number => {
    const { xScale } = getScales();
    const scaledX = xScale.invert(xPos);
    return bisect(lapData.lap.frames, scaledX);
  };

  const bisect = d3.bisector(
    (d) => (d as racemate.Frame).normalized_car_position
  ).center;

  const onEv = (e: PointerEvent): void => {
    if (!verticalLine) return;
    const pointerPosX = d3.pointer(e)[0];
    const frameIndex = translateXPosToFrameIndex(pointerPosX, lapsData[0]);
    hoverDataCallback({ pointerPosX: pointerPosX, frameIndex: [frameIndex] });
  };

  return (
    <div className={"bg-gray-800 mt-1"} style={{ height }}>
      <svg
        ref={svgRef}
        width={width}
        height={height}
        style={{ width: "100%" }}
        onPointerEnter={(e: PointerEvent) => onEv(e)}
        onPointerMove={(e: PointerEvent) => onEv(e)}
        onPointerLeave={(e: PointerEvent) => onEv(e)}
      />
      {/* Numbers are hidden as requested */}
    </div>
  );
};

export default TelemetryGraph;
