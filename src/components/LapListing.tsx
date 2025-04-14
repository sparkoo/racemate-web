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
}

const LapListing: FunctionalComponent<Props> = ({
  selectedTrack,
  selectedLapCallback,
}) => {
  const db = getFirestore(firebaseApp);

  const [laps, setLaps] = useState<LapData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any | null>(null);

  useEffect(() => {
    const fetchLaps = async () => {
      try {
        const productsCollection = collection(db, "laps");
        const wheres: QueryFieldFilterConstraint[] = [];
        if (selectedTrack) {
          wheres.push(where("track", "==", selectedTrack));
        }
        const q = query(
          productsCollection,
          ...wheres,
          orderBy("laptime", "asc")
        );

        const unsubscribe = onSnapshot(
          q,
          (querySnapshot) => {
            const fetchedProducts = querySnapshot.docs.map(
              (doc) =>
                ({
                  id: doc.id,
                  ...doc.data(),
                } as LapData)
            );
            setLaps(fetchedProducts);
            setLoading(false);
          },
          (err) => {
            setError(err.message);
            setLoading(false);
            console.error("Error listening for updates:", err);
          }
        );

        return unsubscribe;
      } catch (err: any) {
        setError(err.message);
        setLoading(false);
        console.error("Error fetching products:", err);
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
        class="cursor-pointer hover:bg-amber-950"
        // onClick={() => router.route(`/telemetry?id=${lap.id}`)}
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

  return (
    <div className={"h-9/10 overflow-y-auto"}>
      <table className={"table min-w-full table-zebra table-md table-pin-rows"}>
        <thead>
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
        <tbody>{laps.map(renderRow)}</tbody>
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
