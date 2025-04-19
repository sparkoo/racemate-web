import { FunctionalComponent } from "preact";
import { racemate } from "racemate-msg";
import { useEffect, useRef, useState } from "preact/hooks";
import * as d3 from "d3";
import { TrackMap, TrackImageMap } from "../types/tracks";

interface Props {
  laps: racemate.Lap[];
  hoveredFrames: number[];
}

const TelemetryMap: FunctionalComponent<Props> = ({ laps, hoveredFrames }) => {
  const [carDot, setCarDot] = useState<
    d3.Selection<SVGCircleElement, unknown, null, undefined>[]
  >([]); //TODO: handle multiple cars
  const [mapRendered, setMapRendered] = useState<boolean>(false);

  const svgRef = useRef<SVGSVGElement>(null);

  // Handle responsive sizing
  const width = 800;
  const height = 800;

  // Calculate proper scales to center the track data
  const calculateScales = () => {
    // Get the extents of X and Z coordinates (Z is used for Y in the display)
    const xExtent = d3.extent(laps[0].frames, (d) => d.car_coordinate_x) as [
      number,
      number
    ];
    const zExtent = d3.extent(laps[0].frames, (d) => d.car_coordinate_z) as [
      number,
      number
    ];

    // Calculate the centers of the track
    const xCenter = (xExtent[0] + xExtent[1]) / 2;
    const zCenter = (zExtent[0] + zExtent[1]) / 2;

    // Calculate the dimensions of the track
    const xSize = xExtent[1] - xExtent[0];
    const zSize = zExtent[1] - zExtent[0];

    // Determine the maximum dimension to maintain aspect ratio
    const maxSize = Math.max(xSize, zSize);

    // Add padding (10%)
    const padding = maxSize * 0.1;
    const paddedSize = maxSize + padding * 2;

    // Create domains centered on the track
    const xDomain = [xCenter - paddedSize / 2, xCenter + paddedSize / 2];
    const zDomain = [zCenter - paddedSize / 2, zCenter + paddedSize / 2];

    // Create and return the scales
    return {
      xScale: d3.scaleLinear().domain(xDomain).range([0, width]),
      yScale: d3.scaleLinear().domain(zDomain).range([height, 0]),
    };
  };

  // Get the scales
  const { xScale, yScale } = calculateScales();

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    if (!mapRendered) {
      svg.selectAll("*").remove(); // Clear previous content

      const line = d3
        .line<racemate.Frame>()
        .x((d) => xScale(d.car_coordinate_x))
        .y((d) => yScale(-d.car_coordinate_z)) // Restore the negative sign to flip the track
        .curve(d3.curveBasis); // Choose your curve type

      svg
        .append("path")
        .datum(laps[0].frames)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1)
        .attr("d", line);
      svg
        .append("path")
        .datum(laps[1].frames)
        .attr("fill", "none")
        .attr("stroke", "red")
        .attr("stroke-width", 1)
        .attr("d", line);

      setCarDot([
        ...carDot,
        svg
          .append("circle")
          .attr("stroke", "lightgray")
          .attr("stroke-width", 5)
          .attr("fill", "blue")
          .attr("cx", 0)
          .attr("cy", 0)
          .attr("r", 5)
          .attr("display", null),
      ]);
      setMapRendered(true);
    }

    carDot[0]
      ?.attr("cx", xScale(laps[0].frames[hoveredFrames[0]].car_coordinate_x))
      .attr("cy", yScale(-laps[0].frames[hoveredFrames[0]].car_coordinate_z)); // Restore the negative sign
  }, [laps[0], width, height, hoveredFrames]);

  // Get the track image URL using the TrackImageMap
  const getTrackImageUrl = () => {
    if (!laps || laps.length === 0) return "";
    const trackId = laps[0].track;
    const imageFile = TrackImageMap.get(trackId);
    
    if (imageFile) {
      return `tracks/${imageFile}`;
    }
    
    // Fallback in case the track isn't in our map
    console.log(`No track image found for track ID: ${trackId}`);
    return "";
  };
  
  // Get the track display name
  const getTrackName = () => {
    if (!laps || laps.length === 0) return "";
    return TrackMap.get(laps[0].track) || laps[0].track;
  };

  return (
    <div className="relative h-full w-full flex flex-col items-center justify-center">
      {/* Track name */}
      <div className="absolute top-2 left-2 z-10 bg-gray-800 bg-opacity-70 px-3 py-1 rounded text-white">
        {getTrackName()}
      </div>
      
      {/* Container for track visualization */}
      <div className="relative w-full h-full flex items-center justify-center">
        {/* Track background image */}
        <div
          className="absolute inset-0 bg-contain bg-center bg-no-repeat opacity-30"
          style={{ backgroundImage: `url(${getTrackImageUrl()})` }}
        />

        {/* SVG for the telemetry data */}
        <svg
          ref={svgRef}
          width={width}
          height={height}
          className="w-full h-full absolute top-0 left-0"
        />
      </div>
    </div>
  );
};

export default TelemetryMap;
