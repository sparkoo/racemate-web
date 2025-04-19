import { FunctionalComponent } from "preact";
import { useEffect, useState } from "preact/hooks";
import { useLocation } from "preact-iso/router";

// Import the functions you need from the SDKs you need
import { Tracks } from "../types/tracks";
import LapListing from "./LapListing";
import { LapData } from "../types/lapdata";
import SelectedLaps from "./SelectedLaps";
import LastRecordedLaps from "./LastRecordedLaps";

interface Props {}

const Main: FunctionalComponent<Props> = ({}) => {
  const location = useLocation();
  const [selectedTrack, setSelectedTrack] = useState<string>("");
  const [selectedLaps, setSelectedLaps] = useState<LapData[]>([]);

  // Initialize track from URL when component mounts
  useEffect(() => {
    const params = new URLSearchParams(location.url.split("?")[1] || "");
    const trackParam = params.get("track");
    if (trackParam && Tracks.some((t) => t.kunos_id === trackParam)) {
      setSelectedTrack(trackParam);
    }
  }, []); // Run only on mount

  // Update URL when track changes and clear selected laps
  const updateTrack = (track: string) => {
    setSelectedTrack(track);
    setSelectedLaps([]); // Clear selected laps when track changes

    const params = new URLSearchParams(location.url.split("?")[1] || "");
    if (track) {
      params.set("track", track);
    } else {
      params.delete("track");
    }
    const newUrl = `${location.url.split("?")[0]}${
      params.toString() ? "?" + params.toString() : ""
    }`;
    history.replaceState(null, "", newUrl);
  };

  const selectedLapCallback = (lap: LapData) => {
    // Check if lap is already selected
    if (selectedLaps.some((selected) => selected.id === lap.id)) {
      // If lap is already selected, remove it
      setSelectedLaps(
        selectedLaps.filter((selected) => selected.id !== lap.id)
      );
      return;
    }

    // If trying to add a new lap
    if (selectedLaps.length >= 2) {
      alert("Maximum 2 laps can be selected for comparison");
      return;
    }
    setSelectedLaps([...selectedLaps, lap]);
  };

  return (
    <div
      className={
        "grid grid-cols-6 gap-4 h-screen max-h-screen overflow-hidden p-4"
      }
    >
      <div className={"card col-span-4 min-h-0 flex flex-col"}>
        <h2 className={"text-3xl"}>Find laps for track</h2>
        <div className={"flex flex-col gap-4 flex-1 min-h-0 mt-4"}>
          <div>
            <select
              className={"select select-ghost select-xl w-full"}
              onChange={(e) =>
                updateTrack((e.target as HTMLSelectElement).value)
              }
              value={selectedTrack}
            >
              <option value="" disabled>
                Select track ...
              </option>
              {Tracks.map((track) => (
                <option key={track.kunos_id} value={track.kunos_id}>
                  {track.name}
                </option>
              ))}
            </select>
          </div>

          <div className={"flex-1 min-h-0 overflow-hidden"}>
            {!selectedTrack ? (
              <div className={"text-center text-lg text-gray-500 mt-8"}>
                Select a track to view laps
              </div>
            ) : (
              <LapListing
                selectedTrack={selectedTrack}
                selectedLapCallback={selectedLapCallback}
                selectedLaps={selectedLaps}
              />
            )}
          </div>
        </div>
      </div>
      <div className={"card shadow-sm col-span-2 min-h-0 overflow-auto"}>
        <div className={"card-body"}>
          <LastRecordedLaps />

          <h2 className={"card-title text-2xl mt-6"}>Selected Laps</h2>
          <SelectedLaps
            laps={selectedLaps}
            onRemoveLap={(lap) =>
              setSelectedLaps(selectedLaps.filter((l) => l.id !== lap.id))
            }
          />
        </div>
      </div>
    </div>
  );
};

export default Main;
