import { FunctionalComponent } from "preact";
import { LapData } from "../types/lapdata";
import { CarMap } from "../types/cars";
import { useLocation } from "preact-iso";
interface Props {
  laps: LapData[];
}
const SelectedLaps: FunctionalComponent<Props> = ({ laps }) => {
  const router = useLocation();
  const goAnalyze = () => {
    if (laps.length > 0) {
      router.route(`/telemetry?laps=${laps.map((lap) => lap.id).join(",")}`);
    } else {
      alert("pick some lap");
    }
  };

  return (
    <>
      <button className={"btn btn-lg btn-primary"} onClick={goAnalyze}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="size-6"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5m.75-9 3-3 2.148 2.148A12.061 12.061 0 0 1 16.5 7.605"
          />
        </svg>
        Analyze selected
      </button>
      <table className={"table min-w-full table-zebra table-md table-pin-rows"}>
        <thead>
          <tr>
            <th>Track</th>
            <th>Time</th>
          </tr>
        </thead>
        <tbody>
          {laps.map((lap) => {
            return (
              <tr>
                <td>{CarMap.get(lap.car)}</td>
                <td>{formatLaptime(lap.laptime)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
};

function formatLaptime(milliseconds: number): string {
  const minutes = Math.floor(milliseconds / (1000 * 60));
  const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);
  const millis = milliseconds % 1000;

  const minutesStr = minutes.toString().padStart(2, "0");
  const secondsStr = seconds.toString().padStart(2, "0");
  const millisStr = millis.toString().padStart(3, "0");

  return `${minutesStr}:${secondsStr}.${millisStr}`;
}

export default SelectedLaps;
