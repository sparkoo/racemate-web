import { FunctionalComponent } from "preact";
import { useEffect, useState } from "preact/hooks";

// Import the functions you need from the SDKs you need
import { Tracks } from "../types/tracks";

interface Props {}

const LapListing: FunctionalComponent<Props> = ({}) => {
  const [selectedTrack, setSelectedTrack] = useState<string>("");
  useEffect(() => {
    console.log("selected", selectedTrack);
  }, [selectedTrack]);

  return (
    <div className={"grid grid-cols-6 gap-4"}>
      <div className={"card col-span-4"}>
        <h2 className={"text-3xl"}>Find laps for track</h2>
        <select
          className={"select select-ghost select-xl"}
          onChange={(e) =>
            setSelectedTrack((e.target as HTMLSelectElement).value)
          }
        >
          <option disabled selected>
            Select track ...
          </option>
          {Tracks.map((track) => (
            <option value={track.kunos_id}>{track.name}</option>
          ))}
        </select>
      </div>
      <div className={"card shadow-sm col-span-2"}>
        <div className={"card-body"}>
          <h2 className={"card-title text-2xl"}>Your last recorded laps</h2>
          <table
            className={"table min-w-full table-zebra table-md table-pin-rows"}
          >
            <thead>
              <tr>
                <th>Track</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Nords</td>
                <td>8:16:235</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LapListing;
