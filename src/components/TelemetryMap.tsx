import { FunctionalComponent } from "preact";
import { racemate } from "racemate-msg";
import { useEffect, useRef, useState } from "preact/hooks";
import * as d3 from "d3";
import { TrackMap, TrackImageMap, TrackRotationMap } from "../types/tracks";

interface Props {
  laps: racemate.Lap[];
  hoveredFrames: number[];
}

const TelemetryMap: FunctionalComponent<Props> = ({ laps, hoveredFrames }) => {
  const [carDots, setCarDots] = useState<
    d3.Selection<SVGCircleElement, unknown, null, undefined>[]
  >([]); // Array of car position indicators for each lap
  const [mapRendered, setMapRendered] = useState<boolean>(false);

  const svgRef = useRef<SVGSVGElement>(null);

  // Handle responsive sizing
  const width = 800;
  const height = 800;

  // Helper function to find the closest frame by normalized position
  const findClosestFrameByPosition = (
    frames: racemate.Frame[],
    targetPosition: number
  ): racemate.Frame => {
    if (!frames || frames.length === 0) return frames[0];

    // Find the frame with the closest normalized_car_position to the target
    return frames.reduce((closest, current) => {
      const currentDiff = Math.abs(
        current.normalized_car_position - targetPosition
      );
      const closestDiff = Math.abs(
        closest.normalized_car_position - targetPosition
      );
      return currentDiff < closestDiff ? current : closest;
    }, frames[0]);
  };

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

  // Get track rotation angle
  const getTrackRotation = () => {
    if (!laps || laps.length === 0) return 0;
    const trackId = laps[0].track;
    return TrackRotationMap.get(trackId) || 0; // Default to 0 if not specified
  };

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    if (!mapRendered) {
      svg.selectAll("*").remove(); // Clear previous content

      // Create a container group for all elements that need rotation
      const container = svg
        .append("g")
        .attr("class", "track-container")
        .attr("transform", `translate(${width / 2}, ${height / 2})`);

      // Apply track-specific rotation
      const rotation = getTrackRotation();
      const rotationGroup = container
        .append("g")
        .attr("class", "rotation-group")
        .attr(
          "transform",
          `rotate(${rotation}) translate(${-width / 2}, ${-height / 2})`
        );

      const line = d3
        .line<racemate.Frame>()
        .x((d) => xScale(d.car_coordinate_x))
        .y((d) => yScale(-d.car_coordinate_z)) // Negative sign to flip the track
        .curve(d3.curveBasis); // Choose your curve type

      // Draw the track paths
      rotationGroup
        .append("path")
        .datum(laps[0].frames)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1)
        .attr("d", line);

      rotationGroup
        .append("path")
        .datum(laps[1].frames)
        .attr("fill", "none")
        .attr("stroke", "red")
        .attr("stroke-width", 1)
        .attr("d", line);

      // Add car position indicators for each lap
      const newCarDots: d3.Selection<
        SVGCircleElement,
        unknown,
        null,
        undefined
      >[] = [];

      // Create a car position indicator for each lap
      laps.forEach((_, index) => {
        const lapColor = index === 0 ? "steelblue" : "red";

        const carDotElement = rotationGroup
          .append("circle")
          .attr("stroke", "white")
          .attr("stroke-width", 1)
          .attr("fill", lapColor)
          .attr("cx", 0)
          .attr("cy", 0)
          .attr("r", 3)
          .attr("opacity", 0.8)
          .attr("display", null);

        newCarDots.push(carDotElement);
      });

      setCarDots(newCarDots);
      setMapRendered(true);
    }

    // Update car positions for each lap
    carDots.forEach((dot, index) => {
      if (
        index < laps.length &&
        hoveredFrames.length > 0 &&
        laps[index].frames
      ) {
        // Use the first hoveredFrame index for all laps
        // This ensures all dots move together at the same normalized position
        const frameIndex = hoveredFrames[0];

        // Find the equivalent position in this lap based on normalized_car_position
        if (frameIndex < laps[0].frames.length) {
          const normalizedPosition =
            laps[0].frames[frameIndex].normalized_car_position;

          // Find the closest frame in this lap with the same normalized position
          const closestFrame = findClosestFrameByPosition(
            laps[index].frames,
            normalizedPosition
          );

          dot
            .attr("cx", xScale(closestFrame.car_coordinate_x))
            .attr("cy", yScale(-closestFrame.car_coordinate_z)); // Negative sign to flip
        }
      }
    });
  }, [laps, width, height, hoveredFrames, carDots]);

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
