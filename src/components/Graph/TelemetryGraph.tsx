import { FunctionalComponent } from "preact";
import { racemate } from "racemate-msg";
import { useRef, useEffect } from "react";
import { GraphLap } from "./GraphLine";
import * as d3 from "d3";

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
  const margin = { top: 20, right: 30, bottom: 30, left: 40 };

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
        const xScale = d3
          .scaleLinear()
          .domain([xMin, xMax])
          .range([margin.left, width - margin.right]);

        const yScale = d3
          .scaleLinear()
          .domain([yMin, yMax])
          .range([height - margin.bottom, margin.top]);

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

        // Add X axis
        svg
          .append("g")
          .attr("transform", `translate(0,${height - margin.bottom})`)
          .call(d3.axisBottom(xScale));

        // Add Y axis
        svg
          .append("g")
          .attr("transform", `translate(${margin.left},0)`)
          .call(d3.axisLeft(yScale));
      });
    });
  }, [laps]);

  return <svg ref={svgRef} width={"100%"} height={height} />;
};

export default TelemetryGraph;
