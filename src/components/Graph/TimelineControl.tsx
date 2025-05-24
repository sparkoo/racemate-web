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
  onZoomChange?: (min: number, max: number) => void;
}

const TimelineControl: FunctionalComponent<Props> = ({
  width: propWidth,
  height: propHeight = 60,
  laps,
  xMin = 0,
  xMax = 1,
  onHoverChange,
  onZoomChange,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [width, setWidth] = useState<number>(propWidth || 800);
  const [verticalLine, setVerticalLine] = 
    useState<d3.Selection<SVGLineElement, unknown, null, undefined>>();
  const [brushSelection, setBrushSelection] = useState<[number, number]>([xMin, xMax]);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isResizing, setIsResizing] = useState<'left' | 'right' | null>(null);
  const [startDragX, setStartDragX] = useState<number>(0);
  // Track the width of the brush selection for potential future use
  const brushRef = useRef<d3.Selection<SVGGElement, unknown, null, undefined>>();

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
    const xScale = d3.scaleLinear().domain([0, 1]).range([0, width]);
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
        .attr("pointer-events", "none")
    );

    // Draw speed graph as a reference for the entire range
    laps.forEach((lap, lapIndex) => {
      if (!lap.frames || lap.frames.length === 0) return;

      // Create the line generator for speed
      const line = d3
        .line<racemate.Frame>()
        .x((d) => xScale(d.normalized_car_position))
        .y((d) => yScale(d.speed_kmh / 300)); // Normalize speed to 0-1 range (assuming max speed ~300)

      // Draw the line
      svg
        .append("path")
        .datum(lap.frames)
        .attr("fill", "none")
        .attr("stroke", lapIndex === 0 ? "#3b82f6" : "#ef4444") // Blue for first lap, red for second
        .attr("stroke-width", 1.5)
        .attr("stroke-dasharray", lapIndex === 0 ? null : "6,4")
        .attr("d", line);
    });

    // Add zoom indicator (brush)
    const brushStartX = xScale(brushSelection[0]);
    const brushEndX = xScale(brushSelection[1]);

    // Create brush group
    const brushGroup = svg.append("g").attr("class", "brush-group");
    brushRef.current = brushGroup;

    // Draw the brush rectangle
    brushGroup
      .append("rect")
      .attr("class", "brush-selection")
      .attr("x", brushStartX)
      .attr("y", 0)
      .attr("width", brushEndX - brushStartX)
      .attr("height", propHeight)
      .attr("fill", "rgba(255, 255, 255, 0.2)")
      .attr("stroke", "white")
      .attr("stroke-width", 1)
      .attr("cursor", "move")
      .on("mousedown", (event: MouseEvent) => {
        setIsDragging(true);
        setStartDragX(event.clientX);
        event.preventDefault();
      });

    // Add left handle
    brushGroup
      .append("rect")
      .attr("class", "brush-handle-left")
      .attr("x", brushStartX - 5)
      .attr("y", propHeight / 2 - 15)
      .attr("width", 10)
      .attr("height", 30)
      .attr("fill", "white")
      .attr("cursor", "ew-resize")
      .attr("rx", 2)
      .on("mousedown", (event: MouseEvent) => {
        setIsResizing("left");
        setStartDragX(event.clientX);
        event.preventDefault();
      });

    // Add right handle
    brushGroup
      .append("rect")
      .attr("class", "brush-handle-right")
      .attr("x", brushEndX - 5)
      .attr("y", propHeight / 2 - 15)
      .attr("width", 10)
      .attr("height", 30)
      .attr("fill", "white")
      .attr("cursor", "ew-resize")
      .attr("rx", 2)
      .on("mousedown", (event: MouseEvent) => {
        setIsResizing("right");
        setStartDragX(event.clientX);
        event.preventDefault();
      });

    // Add percentage labels
    brushGroup
      .append("text")
      .attr("class", "brush-label-left")
      .attr("x", brushStartX + 5)
      .attr("y", 15)
      .attr("fill", "white")
      .attr("font-size", "10px")
      .text(`${Math.round(brushSelection[0] * 100)}%`);

    brushGroup
      .append("text")
      .attr("class", "brush-label-right")
      .attr("x", brushEndX - 30)
      .attr("y", 15)
      .attr("fill", "white")
      .attr("font-size", "10px")
      .text(`${Math.round(brushSelection[1] * 100)}%`);

    // Add reset button
    const resetButton = svg
      .append("g")
      .attr("class", "reset-button")
      .attr("cursor", "pointer")
      .attr("transform", `translate(${width - 60}, 15)`);

    resetButton
      .append("rect")
      .attr("width", 50)
      .attr("height", 20)
      .attr("fill", "#4b5563")
      .attr("rx", 3);

    resetButton
      .append("text")
      .attr("x", 25)
      .attr("y", 14)
      .attr("text-anchor", "middle")
      .attr("fill", "white")
      .attr("font-size", "10px")
      .text("Reset");

    resetButton.on("click", () => {
      setBrushSelection([0, 1]);
      if (onZoomChange) {
        onZoomChange(0, 1);
      }
    });

  }, [width, propHeight, laps, brushSelection]);

  const bisect = d3.bisector(
    (d) => (d as racemate.Frame).normalized_car_position
  ).center;

  const translateXPosToFrameIndex = (
    xPos: number,
    lap: racemate.Lap
  ): number => {
    if (!lap.frames || lap.frames.length === 0) return 0;
    // Map the position within the visible range to the actual data range
    const visibleRangeWidth = brushSelection[1] - brushSelection[0];
    const positionInVisibleRange = xPos / width;
    const actualPosition = brushSelection[0] + (positionInVisibleRange * visibleRangeWidth);
    return bisect(lap.frames, actualPosition);
  };

  // Handle mouse move events for brush dragging and resizing
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (!isDragging && !isResizing) return;
      if (!brushRef.current || !svgRef.current) return;

      // We don't need to use svg or svgRect here as we're working with normalized values
      const deltaX = event.clientX - startDragX;
      const deltaXNormalized = deltaX / width;

      let newBrushSelection = [...brushSelection] as [number, number];

      if (isDragging) {
        // Move the entire brush
        const brushWidth = brushSelection[1] - brushSelection[0];
        let newStart = brushSelection[0] + deltaXNormalized;
        
        // Ensure we don't go out of bounds
        if (newStart < 0) newStart = 0;
        if (newStart + brushWidth > 1) newStart = 1 - brushWidth;
        
        newBrushSelection = [newStart, newStart + brushWidth];
      } else if (isResizing === 'left') {
        // Resize from the left handle
        let newStart = brushSelection[0] + deltaXNormalized;
        
        // Ensure we don't go out of bounds or cross the right handle
        if (newStart < 0) newStart = 0;
        if (newStart >= brushSelection[1] - 0.01) newStart = brushSelection[1] - 0.01;
        
        newBrushSelection = [newStart, brushSelection[1]];
      } else if (isResizing === 'right') {
        // Resize from the right handle
        let newEnd = brushSelection[1] + deltaXNormalized;
        
        // Ensure we don't go out of bounds or cross the left handle
        if (newEnd > 1) newEnd = 1;
        if (newEnd <= brushSelection[0] + 0.01) newEnd = brushSelection[0] + 0.01;
        
        newBrushSelection = [brushSelection[0], newEnd];
      }

      // Update brush selection
      setBrushSelection(newBrushSelection);
      setStartDragX(event.clientX);

      // Notify parent component of zoom change
      if (onZoomChange) {
        onZoomChange(newBrushSelection[0], newBrushSelection[1]);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(null);
    };

    if (isDragging || isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, startDragX, brushSelection, width, onZoomChange]);

  const onPointerEvent = (e: PointerEvent): void => {
    if (!verticalLine || laps.length === 0 || isDragging || isResizing) return;
    
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
      <div className="flex justify-between text-xs text-gray-400 px-2">
        <span>{Math.round(brushSelection[0] * 100)}%</span>
        <span>{Math.round(brushSelection[1] * 100)}%</span>
      </div>
    </div>
  );
};

export default TimelineControl;
