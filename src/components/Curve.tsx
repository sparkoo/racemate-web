import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { racemate } from "racemate-msg";

interface CurveProps {
  data: racemate.Frame[];
  width?: number;
  height?: number;
}

const Curve: React.FC<CurveProps> = ({ data, width = 500, height = 300 }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clear previous content

    const xScale = d3
      .scaleLinear()
      .domain([d3.min(data, (d) => d.car_coordinate_x) || 0, d3.max(data, (d) => d.car_coordinate_x) || 1])
      .range([0, width]);

    const yScale = d3
      .scaleLinear()
      .domain([d3.min(data, (d) => d.car_coordinate_z) || 0, d3.max(data, (d) => d.car_coordinate_z) || 1])
      .range([height, 0]); // Invert y-axis for SVG

    const line = d3
      .line<racemate.Frame>()
      .x((d) => xScale(d.car_coordinate_x))
      .y((d) => yScale(-d.car_coordinate_z))
      .curve(d3.curveBasis); // Choose your curve type

    svg
      .append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', 'steelblue')
      .attr('stroke-width', 1)
      .attr('d', line);
  }, [data, width, height]);

  return <svg ref={svgRef} width={width} height={height} />;
};

export default Curve;