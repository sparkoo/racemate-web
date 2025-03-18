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

  // TODO: cleanup. these are to keep the aspect ratio of the graph.
  const xExtent = d3.extent(lap.frames, (d) => d.car_coordinate_x) as [
    number,
    number
  ];
  const yExtent = d3.extent(lap.frames, (d) => d.car_coordinate_z) as [
    number,
    number
  ];

  const maxExtent = Math.max(xExtent[1] - xExtent[0], yExtent[1] - yExtent[0]);
  const centerX = (xExtent[0] + xExtent[1]) / 2;
  // const centerY = (yExtent[0] + yExtent[1]) / 2;

  const domain = [centerX - maxExtent / 2, centerX + maxExtent / 2];

  const xScale = d3.scaleLinear().domain(domain).range([0, width]);
  const yScale = d3.scaleLinear().domain(domain).range([height, 0]);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    if (!mapRendered) {
      svg.selectAll("*").remove(); // Clear previous content

      const line = d3
        .line<racemate.Frame>()
        .x((d) => xScale(d.car_coordinate_x))
        .y((d) => yScale(-d.car_coordinate_z))
        .curve(d3.curveBasis); // Choose your curve type

      svg
        .append("path")
        .datum(lap.frames)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1)
        .attr("d", line)
        .attr("transform", `rotate(-50, ${width / 2}, ${height / 2})`);

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
          .attr("transform", `rotate(-50, ${width / 2}, ${height / 2})`)
      );
      setMapRendered(true);
    }

    carDot
      ?.attr("cx", xScale(lap.frames[hoveredFrames[0]].car_coordinate_x))
      .attr("cy", yScale(-lap.frames[hoveredFrames[0]].car_coordinate_z));
  }, [lap, width, height, hoveredFrames]);

  // TODO: somehow better set track image
  return (
    <div>
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className={
          "bg-[url('tracks/donington.svg')] w-full bg-cover bg-center bg-no-repeat"
        }
      />
    </div>
  );
};

export default TelemetryMap;
