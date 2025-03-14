import { FunctionalComponent } from "preact";
import { racemate } from "racemate-msg";
import { useEffect, useRef, useState } from "preact/hooks";
import * as d3 from "d3";

interface Props {
  lap: racemate.Lap; //TODO: handle multiple laps
  hoveredFrames: number[];
}

const TelemetryMap: FunctionalComponent<Props> = ({ lap, hoveredFrames }) => {
  const [carDot, setCarDot] =
    useState<d3.Selection<SVGCircleElement, unknown, null, undefined>>(); //TODO: handle multiple cars
  const [mapRendered, setMapRendered] = useState<boolean>(false);

  const svgRef = useRef<SVGSVGElement>(null);

  // TODO: handle real size with resizing
  const width = 800;
  const height = 800;

  const xScale = d3
    .scaleLinear()
    .domain([
      d3.min(lap.frames, (d) => d.car_coordinate_x) || 0,
      d3.max(lap.frames, (d) => d.car_coordinate_x) || 1,
    ])
    .range([0, width]);

  const yScale = d3
    .scaleLinear()
    .domain([
      d3.min(lap.frames, (d) => d.car_coordinate_z) || 0,
      d3.max(lap.frames, (d) => d.car_coordinate_z) || 1,
    ])
    .range([0, height]);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    if (!mapRendered) {
      svg.selectAll("*").remove(); // Clear previous content

      const line = d3
        .line<racemate.Frame>()
        .x((d) => xScale(d.car_coordinate_x))
        .y((d) => yScale(d.car_coordinate_z))
        .curve(d3.curveBasis); // Choose your curve type

      svg
        .append("path")
        .datum(lap.frames)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1)
        .attr("d", line);

      setCarDot(
        svg
          .append("circle")
          .attr("stroke", "lightgray")
          .attr("stroke-width", 5)
          .attr("fill", "blue")
          .attr("cx", 0)
          .attr("cy", 0)
          .attr("r", 5)
          .attr("display", null)
      );
      setMapRendered(true);
    }

    carDot
      ?.attr("cx", xScale(lap.frames[hoveredFrames[0]].car_coordinate_x))
      .attr("cy", yScale(lap.frames[hoveredFrames[0]].car_coordinate_z));
  }, [lap, width, height, hoveredFrames]);

  return (
    <div>
      <svg ref={svgRef} width={width} height={height} />
    </div>
  );
};

export default TelemetryMap;
