import { FunctionalComponent } from "preact";
import { racemate } from "racemate-msg";
import { useEffect, useRef, useState } from "preact/hooks";
import * as d3 from "d3";
import { TrackMap, TrackImageMap, TrackRotationMap } from "../types/tracks";
import { RefreshCw } from "preact-feather";

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
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);

  // Handle responsive sizing with dynamic values
  const [width, setWidth] = useState<number>(800);
  const [height, setHeight] = useState<number>(800);

  // Reference to the container div to measure available space
  const containerRef = useRef<HTMLDivElement>(null);

  // Track container group reference for zoom operations
  const containerGroupRef = useRef<d3.Selection<
    SVGGElement,
    unknown,
    null,
    undefined
  > | null>(null);

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
    // Using fixed 800x800 coordinate space that will be scaled by the SVG transform
    return {
      xScale: d3.scaleLinear().domain(xDomain).range([0, 800]),
      yScale: d3.scaleLinear().domain(zDomain).range([800, 0]),
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

  // Effect to handle responsive sizing
  useEffect(() => {
    if (!containerRef.current) return;

    const updateDimensions = () => {
      const container = containerRef.current;
      if (!container) return;

      const containerRect = container.getBoundingClientRect();

      // Use the maximum dimension available to stretch the graph
      // while still maintaining the aspect ratio in the viewBox
      setWidth(containerRect.width);
      setHeight(containerRect.height);
    };

    // Initial update
    updateDimensions();

    // Set up resize observer
    const resizeObserver = new ResizeObserver(updateDimensions);
    resizeObserver.observe(containerRef.current);

    return () => {
      if (containerRef.current) {
        resizeObserver.unobserve(containerRef.current);
      }
      resizeObserver.disconnect();
    };
  }, []);

  // Function to reset zoom to default state
  const resetZoom = () => {
    if (!svgRef.current || !zoomRef.current || !containerGroupRef.current)
      return;

    const svg = d3.select(svgRef.current);
    // Type assertion to make TypeScript happy
    svg
      .transition()
      .duration(750)
      .call(zoomRef.current.transform as any, d3.zoomIdentity);
  };

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    if (!mapRendered) {
      svg.selectAll("*").remove(); // Clear previous content

      // Create a container group for all elements that need rotation
      // Center it in the available space
      const container = svg
        .append("g")
        .attr("class", "track-container")
        .attr("transform", `translate(${width / 2}, ${height / 2})`);

      // Store the container reference for zoom operations
      containerGroupRef.current = container;

      // Calculate the scaling factor to fill the available space
      // while maintaining the aspect ratio
      const minDimension = Math.min(width, height);
      const scaleFactor = minDimension / 800; // 800 is the original size

      // Apply track-specific rotation and scaling
      const rotation = getTrackRotation();
      const rotationGroup = container
        .append("g")
        .attr("class", "rotation-group")
        .attr(
          "transform",
          `rotate(${rotation}) scale(${scaleFactor}) translate(${-400}, ${-400})`
        );

      // Add track background image to the container (not in the rotation group)
      // This way the image won't rotate with the track data
      const trackImageUrl = getTrackImageUrl();
      if (trackImageUrl) {
        // Add the background image before the rotation group
        // so it appears behind the telemetry data
        container
          .insert("image", ".rotation-group")
          .attr("href", trackImageUrl)
          .attr("width", minDimension)
          .attr("height", minDimension)
          .attr("x", -minDimension / 2)
          .attr("y", -minDimension / 2)
          .attr("preserveAspectRatio", "xMidYMid meet")
          .attr("opacity", 0.3);
      }

      // Initialize zoom behavior
      const zoom = d3
        .zoom<SVGSVGElement, unknown>()
        .scaleExtent([0.5, 10]) // Min and max zoom scale
        .on("zoom", (event) => {
          container.attr("transform", event.transform);
        });

      // Store zoom behavior in ref for reset function
      zoomRef.current = zoom;

      // Apply zoom behavior to SVG
      svg.call(zoom as any).on("dblclick.zoom", null); // Disable double-click zoom to avoid conflicts

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

  // Track name is now displayed in the parent Telemetry component

  return (
    <div className="relative h-full w-full flex flex-col items-center justify-center">
      {/* Track name removed - now displayed in parent component */}

      {/* Reset zoom button */}
      <button
        onClick={resetZoom}
        className="absolute top-2 right-2 z-10 bg-gray-800 bg-opacity-70 p-2 rounded text-white hover:bg-gray-700 transition-colors"
        title="Reset zoom"
      >
        <RefreshCw size={16} />
      </button>

      {/* Zoom instructions */}
      <div className="absolute bottom-2 right-2 z-10 bg-gray-800 bg-opacity-70 px-3 py-1 rounded text-white text-xs">
        Use mouse wheel to zoom, drag to pan
      </div>

      {/* Container for track visualization */}
      <div
        ref={containerRef}
        className="relative w-full h-full flex items-center justify-center overflow-hidden cursor-move"
      >
        {/* SVG for the telemetry data */}
        <svg
          ref={svgRef}
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="xMidYMid meet"
          className="w-full h-full"
        />
      </div>
    </div>
  );
};

export default TelemetryMap;
