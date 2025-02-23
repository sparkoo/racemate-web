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

  const [lap, setLap] = useState<racemate.Lap | null>(null);
  const [error, setError] = useState<string | null>(null);

  const divRef = useRef<HTMLDivElement>(null);
  const [graphWidth, setWidth] = useState<number>(0);

  useEffect(() => {
    const loadLap = async () => {
      // Create a storage reference

      try {
        const lapRef = doc(db, "laps", router.query["id"]);
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
          setLap(lap);

          return documentData; // Return the document data
        } else {
          // Document doesn't exist
          console.log("No such document!");
          return null; // Or throw an error, depending on your needs
        }
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred.");
        }
        console.error("Error loading coordinates:", err);
      }
    };
    loadLap();

    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setWidth(entry.contentRect.width);
      }
    });

    if (divRef.current) {
      observer.observe(divRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []); // Empty dependency array ensures this runs only once on mount

  if (lap != null) {
    return (
      <>
        <span>{error}</span>
        <ul>
          <li>Track: {TrackMap.get(lap.track)}</li>
          <li>Car: {CarMap.get(lap.car_model)}</li>
          <li>
            Time: {format(new Date(lap.lap_time_ms), "mm:ss:SSS").toString()}
          </li>
          <li>
            Name: {lap.player_name} {lap.player_surname}
          </li>
        </ul>
        <div class="w-full grid grid-cols-2">
          <div ref={divRef}>
            <TelemetryGraphs lap={lap} graphWidth={graphWidth} />
          </div>
          <div>
            <TelemetryMap lap={lap} graphWidth={graphWidth} />
          </div>
        </div>
      </>
    );
  } else {
    return <div>No Lap Data</div>;
  }
};

export default Telemetry;
