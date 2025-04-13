import { format } from "date-fns/format";
import { FunctionalComponent } from "preact";
import { useEffect, useRef, useState } from "preact/hooks";
import TelemetryGraphs from "./TelemetryGraphs";
import TelemetryMap from "./TelemetryMap";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import { getDownloadURL, getStorage, ref } from "firebase/storage";
import { firebaseApp } from "../main";
import { racemate } from "racemate-msg";
import { useRoute } from "preact-iso";
import { CarMap } from "../types/cars";
import { TrackMap } from "../types/tracks";

interface Props {}

const Telemetry: FunctionalComponent<Props> = ({}) => {
  const db = getFirestore(firebaseApp);
  const storage = getStorage(firebaseApp);
  const router = useRoute();

  const [laps, setLaps] = useState<racemate.Lap[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [hoveredFrames, setHoveredFrames] = useState<number[]>([]);

  const divRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadLaps = async () => {
      // Create a storage reference

      try {
        const lapIds = router.query["laps"].split(",");
        const loadedLaps: racemate.Lap[] = [];

        for (const lapId of lapIds) {
          const lapRef = doc(db, "laps", lapId);
          const lapSnap = await getDoc(lapRef);
          if (lapSnap.exists()) {
            // Document exists, access data
            const documentData = lapSnap.data();
            const fileRef = ref(storage, documentData["storagePath"]);
            const downloadURL = await getDownloadURL(fileRef);
            const response = await fetch(downloadURL);
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            const body = await response.bytes();
            const lap = racemate.Lap.deserialize(body);
            loadedLaps.push(lap);
          } else {
            setError(`lap ${lapId} not found!`);
            console.log(`lap ${lapId} not found!`);
          }
        }

        setLaps(loadedLaps);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred.");
        }
        console.error("Error loading coordinates:", err);
      }
    };

    loadLaps();
  }, []); // Empty dependency array ensures this runs only once on mount

  if (error !== null) {
    return (
      <>
        <span>{error}</span>
      </>
    );
  }

  if (laps.length > 0) {
    return (
      <>
        <span>{error}</span>
        <ul>
          <li>Track: {TrackMap.get(laps[0].track)}</li>
          <li>Car: {CarMap.get(laps[0].car_model)}</li>
          <li>
            Time:{" "}
            {format(new Date(laps[0].lap_time_ms), "mm:ss:SSS").toString()}
          </li>
          <li>
            Name: {laps[0].player_name} {laps[0].player_surname}
          </li>
        </ul>
        <div class="w-full grid grid-cols-2">
          <div ref={divRef}>
            <TelemetryGraphs
              lap={laps[0]}
              hoveredFrames={hoveredFrames}
              hoveredFramesCallback={(frames) => setHoveredFrames(frames)}
            />
          </div>
          <div>
            <TelemetryMap laps={laps} hoveredFrames={hoveredFrames} />
          </div>
        </div>
      </>
    );
  } else {
    return <div>Loading ({laps.length}) ...</div>;
  }
};

export default Telemetry;
