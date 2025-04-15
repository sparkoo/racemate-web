import { FunctionalComponent } from "preact";
import { useEffect, useState } from "preact/hooks";

// Import the functions you need from the SDKs you need
import { Tracks } from "../types/tracks";
import LapListing from "./LapListing";
import { LapData } from "../types/lapdata";
import SelectedLaps from "./SelectedLaps";

interface Props {}

const Main: FunctionalComponent<Props> = ({}) => {
  const [selectedTrack, setSelectedTrack] = useState<string>("");
  const [selectedLaps, setSelectedLaps] = useState<LapData[]>([]);

  useEffect(() => {
    console.log("selected", selectedTrack);
  }, [selectedTrack]);

  const selectedLapCallback = (lap: LapData) => {
    // Check if lap is already selected
    if (selectedLaps.some(selected => selected.id === lap.id)) {
      // If lap is already selected, remove it
      setSelectedLaps(selectedLaps.filter(selected => selected.id !== lap.id));
      return;
    }
    
    // If trying to add a new lap
    if (selectedLaps.length >= 2) {
      alert('Maximum 2 laps can be selected for comparison');
      return;
    }
    setSelectedLaps([...selectedLaps, lap]);
  };

  return (
    <div className={"grid grid-cols-6 gap-4 h-screen max-h-screen overflow-hidden p-4"}>
      <div className={"card col-span-4 min-h-0 flex flex-col"}>
        <h2 className={"text-3xl mb-4"}>Find laps for track</h2>
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
        <LapListing
          selectedTrack={selectedTrack}
          selectedLapCallback={selectedLapCallback}
          selectedLaps={selectedLaps}
        />
      </div>
      <div className={"card shadow-sm col-span-2 min-h-0 overflow-auto"}>
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
          <h2 className={"card-title text-2xl"}>Your last recorded laps</h2>
          <SelectedLaps 
            laps={selectedLaps} 
            onRemoveLap={(lap) => setSelectedLaps(selectedLaps.filter(l => l.id !== lap.id))}
          />
        </div>
      </div>
    </div>
  );
};

export default Main;
