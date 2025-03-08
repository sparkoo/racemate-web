import { FunctionalComponent } from "preact";
import { racemate } from "racemate-msg";
import { useRef, useEffect } from "react";
import { GraphLap } from "./GraphLine";
import * as d3 from "d3";

interface Props {
  width: number;
  height: number;

  lapData: GraphLap[];
}

const TelemetryGraph: FunctionalComponent<Props> = ({
  height = 150,
  lapData,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const width = 700;
    const margin = { top: 20, right: 30, bottom: 30, left: 40 };

    // Clear previous content
    svg.selectAll("*").remove();

    // Set up scales
    const xScale = d3
      .scaleLinear()
      .domain([0, d3.max(lapData[0].lap.frames, (d) => d.normalized_car_position)!])
      .range([margin.left, width - margin.right]);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(lapData[0].lap.frames, (d) => d.gas)!])
      .range([height - margin.bottom, margin.top]);

    // Create the line generator
    const line = d3
      .line<racemate.Frame>()
      .x((d) => xScale(d.normalized_car_position))
      .y((d) => yScale(d.gas));

    // Draw the line
    svg
      .append("path")
      .datum(lapData[0].lap.frames)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 2)
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
  }, [lapData]);

  return <>
  <svg ref={svgRef} width={"100%"} height={height} />
  </>;
};

export default TelemetryGraph;
