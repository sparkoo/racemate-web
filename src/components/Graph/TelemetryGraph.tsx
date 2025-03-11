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
}

const TelemetryGraph: FunctionalComponent<Props> = ({
  height = 200,
  lapsData: laps,
  xMin = 0,
  xMax = 1,
  yMin = 0,
  yMax = 1,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [verticalLine, setVerticalLine] =
    useState<d3.Selection<SVGLineElement, unknown, null, undefined>>();

  useEffect(() => {
    if (!svgRef.current) return;

    //TODO: handle resize
    const width = svgRef.current.getBoundingClientRect().width;

    const svg = d3.select(svgRef.current);

    // Clear previous content
    svg.selectAll("*").remove();

    laps.forEach((lapData) => {
      lapData.lines.forEach((telemetryLine) => {
        // Set up scales
        const xScale = d3.scaleLinear().domain([xMin, xMax]).range([0, width]);

        const yScale = d3.scaleLinear().domain([yMin, yMax]).range([height, 0]);

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
        .attr("x1", 0)
        .attr("x2", 0)
        .attr("y1", 0)
        .attr("y2", height)
        .attr("stroke-dasharray", 6)
        .attr("display", null)
    );
  }, [laps]);

  const onEv = (e: PointerEvent): void => {
    if (!verticalLine) return;
    verticalLine.attr("transform", `translate(${e.offsetX},0)`);
  };

  return (
    <svg
      ref={svgRef}
      width={"100%"}
      height={height}
      onPointerEnter={onEv}
      onPointerMove={onEv}
      onPointerLeave={onEv}
    />
  );
};

export default TelemetryGraph;
