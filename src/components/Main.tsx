import { FunctionalComponent } from "preact";
import { useEffect } from "preact/hooks";

// Import the functions you need from the SDKs you need
import { Tracks } from "../types/tracks";

interface Props {}

const LapListing: FunctionalComponent<Props> = ({}) => {
  useEffect(() => {}, []);

  return (
    <>
      <select class="select select-ghost select-xl">
        <option disabled selected>
          Select track ...
        </option>
        {Tracks.map((track) => (
          <option value={track.kunos_id}>{track.name}</option>
        ))}
      </select>
    </>
  );
};

export default LapListing;
