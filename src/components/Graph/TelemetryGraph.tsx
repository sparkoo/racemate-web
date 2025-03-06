import { FunctionalComponent } from "preact";
import { racemate } from "racemate-msg";
import React, { useRef, useEffect } from "react";
import { GraphLap, GraphLine } from "./GraphLine";
import * as d3 from "d3";

interface Props {
  width: number;
  height: number;

  lapData: GraphLap[];
}

interface Point {
  x: number;
  y: number;
}

const TelemetryGraph: FunctionalComponent<Props> = ({
  width = 200,
  height = 200,
  lapData,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  const data: Point[] = [
    { x: 1, y: 10 },
    { x: 5, y: 50 },
    { x: 10, y: 30 },
    { x: 15, y: 80 },
  ];

  // useEffect(() => {
  //   if (svgRef.current) {
  //     d3.select(svgRef.current).selectAll("*").remove(); //clear previous drawings.
  //     drawCurve(d3.select(svgRef.current), data, width, height, curveType);
  //   }
  // }, [data, width, height, curveType]);

  return <svg ref={svgRef} width={width} height={height} />;
};

const drawCurve = (): void => {};

export default TelemetryGraph;
