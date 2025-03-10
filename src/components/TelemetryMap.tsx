import { FunctionalComponent } from "preact";
import { racemate } from "racemate-msg";
import Curve from "./Curve";

interface Props {
  lap: racemate.Lap;
}

const TelemetryMap: FunctionalComponent<Props> = ({ lap }) => {
  return (
    <div className={"bg-[url('Donington_circuit.svg_rot.png')] bg-cover"}>
      <Curve data={lap.frames} width={800} height={800} />
    </div>
  );
};

export default TelemetryMap;
