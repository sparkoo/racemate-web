import { FunctionalComponent } from "preact";
import { useEffect, useState } from "preact/hooks";

// Import the functions you need from the SDKs you need
import {
  collection,
  getFirestore,
  onSnapshot,
  orderBy,
  query,
  QueryFieldFilterConstraint,
  where,
} from "firebase/firestore";
import { GripMap } from "../types/tracks";
import { CarMap } from "../types/cars";
import { firebaseApp } from "../main";
import { LapData } from "../types/lapdata";

interface Props {
  selectedTrack: string;
  selectedLapCallback: (lap: LapData) => void;
  selectedLaps: LapData[];
}

const LapListing: FunctionalComponent<Props> = ({
  selectedTrack,
  selectedLapCallback,
  selectedLaps,
}) => {
  const db = getFirestore(firebaseApp);

  const [laps, setLaps] = useState<LapData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any | null>(null);

  useEffect(() => {
    console.log('LapListing: selectedTrack changed to', selectedTrack);
    if (!selectedTrack) {
      setLaps([]);
      setLoading(false);
      return;
    }

    const fetchLaps = async () => {
      try {
        console.log('LapListing: Fetching laps for track', selectedTrack);
        const lapsCollection = collection(db, "laps");
        const wheres: QueryFieldFilterConstraint[] = [];
        wheres.push(where("track", "==", selectedTrack));
        
        const q = query(
          lapsCollection,
          ...wheres,
          orderBy("laptime", "asc")
        );

        const unsubscribe = onSnapshot(
          q,
          (querySnapshot) => {
            console.log('LapListing: Got snapshot with', querySnapshot.size, 'documents');
            const fetchedLaps = querySnapshot.docs.map(
              (doc) => ({
                id: doc.id,
                ...doc.data(),
              } as LapData)
            );
            setLaps(fetchedLaps);
            setLoading(false);
          },
          (err) => {
            console.error("LapListing: Error listening for updates:", err);
            setError(err.message);
            setLoading(false);
          }
        );

        return unsubscribe;
      } catch (err: any) {
        console.error("LapListing: Error setting up query:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchLaps();
  }, [selectedTrack]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  const renderRow = (lap: LapData) => {
    return (
      <tr
        key={lap.id}
        class={`cursor-pointer ${selectedLaps.some(selected => selected.id === lap.id) ? '!bg-amber-950 hover:!bg-amber-900' : 'hover:!bg-amber-900'}`}
        onClick={() => {
          selectedLapCallback(lap);
        }}
      >
        <td>{new Date(lap.timestamp * 1000).toLocaleString()}</td>
        <td>{lap.name}</td>
        <td>{CarMap.get(lap.car)}</td>
        <td>{formatLaptime(lap.laptime)}</td>
        <td>
          {GripMap.get(lap.trackGrip)} ({lap.rainTypes == 1 ? "W" : "D"})
        </td>
        <td>
          {lap.airTemp.toFixed(1)}&deg;C / {lap.roadTemp.toFixed(1)}&deg;C
        </td>
        <td>{convertSessionType(lap.sessionType)}</td>
      </tr>
    );
  };

  console.log('LapListing: Rendering with', laps.length, 'laps');
  console.log('LapListing: First lap:', laps[0]);

  return (
    <div className={"h-full overflow-auto border border-base-300 rounded-lg"}>
      <table className={"table table-zebra table-md table-pin-rows w-full"}>
        <thead className={"bg-base-100 sticky top-0 z-10"}>
            <tr>
              <th>Time</th>
              <th>Name</th>
              <th>Car</th>
              <th>LapTime</th>
              <th>Track grip (Tyres)</th>
              <th>Temp (Air/Track)</th>
              <th>Session Type</th>
            </tr>
          </thead>
          <tbody>
            {laps.map(renderRow)}
          </tbody>
        </table>
    </div>
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

function convertSessionType(type: number): string {
  switch (type) {
    case 0:
      return "Practice";
    case 1:
      return "Qualify";
    case 2:
      return "Race";
    case 3:
      return "HotLap";
    default:
      return "Unknown";
  }
}

export default LapListing;
