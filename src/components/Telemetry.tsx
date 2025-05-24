import { format } from "date-fns/format";
import { FunctionalComponent } from "preact";
import { useEffect, useRef, useState } from "preact/hooks";
import TelemetryGraphs from "./TelemetryGraphs";
import TelemetryMap from "./TelemetryMap";
import TimelineControl from "./Graph/TimelineControl";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import { getDownloadURL, getStorage, ref } from "firebase/storage";
import { firebaseApp } from "../main";
import { racemate } from "racemate-msg";
import { useRoute } from "preact-iso";
import { CarMap } from "../types/cars";
import { TrackMap } from "../types/tracks";
import { HoverData } from "./Graph/TelemetryGraph";

interface Props {}

const Telemetry: FunctionalComponent<Props> = ({}) => {
  const db = getFirestore(firebaseApp);
  const storage = getStorage(firebaseApp);
  const router = useRoute();

  const [laps, setLaps] = useState<racemate.Lap[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [hoverData, setHoverData] = useState<HoverData>({ pointerPosX: 0, frameIndex: [] });

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
        <div className="mb-4">
          <div className="mb-2">
            <strong>Track:</strong> {TrackMap.get(laps[0].track)}
          </div>
          
          <div className="flex gap-8">
            <div className="border-l-4 border-steelblue pl-3">
              <h3 className="font-semibold text-lg">Lap 1</h3>
              <ul>
                <li>Car: {CarMap.get(laps[0].car_model)}</li>
                <li>
                  Time:{" "}
                  {format(new Date(laps[0].lap_time_ms), "mm:ss:SSS").toString()}
                </li>
                <li>
                  Name: {laps[0].player_name} {laps[0].player_surname}
                </li>
              </ul>
            </div>
            
            {laps.length > 1 && (
              <div className="border-l-4 border-red-500 pl-3">
                <h3 className="font-semibold text-lg">Lap 2</h3>
                <ul>
                  <li>Car: {CarMap.get(laps[1].car_model)}</li>
                  <li>
                    Time:{" "}
                    {format(new Date(laps[1].lap_time_ms), "mm:ss:SSS").toString()}
                  </li>
                  <li>
                    Name: {laps[1].player_name} {laps[1].player_surname}
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
        <div class="w-full h-[calc(100vh-220px)] grid grid-cols-2 gap-4">
          <div class="flex flex-col h-full overflow-hidden" ref={divRef}>
            <TimelineControl
              laps={laps}
              onHoverChange={(data) => setHoverData(data)}
            />
            <TelemetryGraphs
              laps={laps}
              hoverData={hoverData}
            />
          </div>
          <div class="flex items-center justify-center h-full">
            <div class="aspect-square w-full max-w-full h-full">
              <TelemetryMap laps={laps} hoveredFrames={hoverData.frameIndex} />
            </div>
          </div>
        </div>
      </>
    );
  } else {
    return <div>Loading ({laps.length}) ...</div>;
  }
};

export default Telemetry;
