import { FunctionalComponent } from "preact";
import { racemate } from "racemate-msg";
import * as d3 from "d3";
import { useEffect, useRef, useState } from "preact/hooks";

interface Props {
  width?: number;
  height?: number;
  laps: racemate.Lap[];
  xMin?: number;
  xMax?: number;
  onHoverChange: (hoverData: { pointerPosX: number; frameIndex: number[] }) => void;
}

const TimelineControl: FunctionalComponent<Props> = ({
  width: propWidth,
  height: propHeight = 60,
  laps,
  xMin = 0,
  xMax = 1,
  onHoverChange,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [width, setWidth] = useState<number>(propWidth || 800);
  const [verticalLine, setVerticalLine] = 
    useState<d3.Selection<SVGLineElement, unknown, null, undefined>>();

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
    if (!svgRef.current || laps.length === 0) return;
    const svg = d3.select(svgRef.current);

    // Clear previous content
    svg.selectAll("*").remove();

    // Create scales with current width/height
    const xScale = d3.scaleLinear().domain([xMin, xMax]).range([0, width]);
    const yScale = d3.scaleLinear().domain([0, 1]).range([propHeight, 0]);

    // Draw a background
    svg
      .append("rect")
      .attr("width", width)
      .attr("height", propHeight)
      .attr("fill", "#2d3748") // Dark background
      .attr("rx", 4); // Rounded corners

    // Create a vertical line for hover indication
    setVerticalLine(
      svg
        .append("line")
        .attr("stroke", "white")
        .attr("stroke-width", 1)
        .attr("x1", 0)
        .attr("x2", 0)
        .attr("y1", 0)
        .attr("y2", propHeight)
        .attr("display", "none")
    );

    // Draw speed graph as a reference
    laps.forEach((lap, lapIndex) => {
      if (!lap.frames || lap.frames.length === 0) return;

      // Filter frames by xMin/xMax (normalized_car_position)
      const filteredFrames = lap.frames.filter(
        (frame) => {
          const pos = frame.normalized_car_position;
          return pos >= xMin && pos <= xMax;
        }
      );

      // Create the line generator for speed
      const line = d3
        .line<racemate.Frame>()
        .x((d) => xScale(d.normalized_car_position))
        .y((d) => yScale(d.speed_kmh / 300)); // Normalize speed to 0-1 range (assuming max speed ~300)

      // Draw the line
      svg
        .append("path")
        .datum(filteredFrames)
        .attr("fill", "none")
        .attr("stroke", lapIndex === 0 ? "#3b82f6" : "#ef4444") // Blue for first lap, red for second
        .attr("stroke-width", 1.5)
        .attr("stroke-dasharray", lapIndex === 0 ? null : "6,4")
        .attr("d", line);
    });

    // Add label
    svg
      .append("text")
      .attr("x", 10)
      .attr("y", 20)
      .attr("fill", "white")
      .attr("font-size", "12px")
      .text("Timeline Control");

  }, [width, propHeight, xMin, xMax, laps]);

  const bisect = d3.bisector(
    (d) => (d as racemate.Frame).normalized_car_position
  ).center;

  const translateXPosToFrameIndex = (
    xPos: number,
    lap: racemate.Lap
  ): number => {
    if (!lap.frames || lap.frames.length === 0) return 0;
    const xScale = d3.scaleLinear().domain([xMin, xMax]).range([0, width]);
    const scaledX = xScale.invert(xPos);
    return bisect(lap.frames, scaledX);
  };

  const onPointerEvent = (e: PointerEvent): void => {
    if (!verticalLine || laps.length === 0) return;
    
    const pointerPosX = d3.pointer(e)[0];
    
    // Show the vertical line
    verticalLine
      .attr("x1", pointerPosX)
      .attr("x2", pointerPosX)
      .attr("display", null);
    
    // Calculate frame indices for all laps
    const frameIndices = laps.map(lap => translateXPosToFrameIndex(pointerPosX, lap));
    
    // Notify parent component
    onHoverChange({ 
      pointerPosX: pointerPosX, 
      frameIndex: frameIndices 
    });
  };

  const onPointerLeave = (): void => {
    if (verticalLine) {
      verticalLine.attr("display", "none");
    }
  };

  return (
    <div className="bg-gray-800 rounded mb-2" style={{ height: propHeight }}>
      <svg
        ref={svgRef}
        width={width}
        height={propHeight}
        style={{ width: "100%" }}
        onPointerEnter={(e: PointerEvent) => onPointerEvent(e)}
        onPointerMove={(e: PointerEvent) => onPointerEvent(e)}
        onPointerLeave={() => onPointerLeave()}
      />
    </div>
  );
};

export default TimelineControl;
