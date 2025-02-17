import { FunctionalComponent } from "preact";
import { useEffect, useState } from "preact/hooks";
import { useLocation } from "preact-iso";

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
import { GripMap, TrackMap, Tracks } from "../types/tracks";
import { CarMap } from "../types/cars";
import { firebaseApp } from "../main";

interface Props {}

interface LapData {
  id: string;
  fileFireStorage: string;
  name: string;
  track: string;
  laptime: number;
  car: string;
  timestamp: number;
  trackGrip: number;
  weather: string;
  airTemp: number;
  roadTemp: number;
  sessionType: number;
  rainTypes: number;
  lapNumber: string;
}

const LapListing: FunctionalComponent<Props> = ({}) => {
  const router = useLocation();
  const db = getFirestore(firebaseApp);

  const [laps, setLaps] = useState<LapData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any | null>(null);
  const [selectedTrack, setSelectedTrack] = useState<string>("");

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

  return (
    <table class="table min-w-full table-zebra table-md table-pin-rows">
      <thead>
        <tr>
          <th>Time</th>
          <th>Name</th>
          <th>
            <select
              class="select select-ghost w-full"
              value={selectedTrack}
              onChange={(e) =>
                setSelectedTrack((e.target as HTMLSelectElement).value)
              }
            >
              <option value="" selected>
                All Tracks
              </option>
              {Tracks.map((track) => (
                <option value={track.kunos_id}>{track.name}</option>
              ))}
            </select>
          </th>
          <th>Car</th>
          <th>LapTime</th>
          <th>Track grip (Tyres)</th>
          <th>Temp (Air/Track)</th>
          <th>Session Type</th>
        </tr>
      </thead>
      <tbody>
        {laps.map((item) => (
          <tr
            key={item.id}
            class="cursor-pointer hover:bg-amber-950"
            onClick={() => router.route(`/telemetry?id=${item.id}`)}
          >
            <td>{new Date(item.timestamp * 1000).toLocaleString()}</td>
            <td>{item.name}</td>
            <td>{TrackMap.get(item.track)}</td>
            <td>{CarMap.get(item.car)}</td>
            <td>{formatLaptime(item.laptime)}</td>
            <td>{GripMap.get(item.trackGrip)} ({item.rainTypes == 1 ? "W" : "D"})</td>
            <td>{item.airTemp.toFixed(1)}&deg;C / {item.roadTemp.toFixed(1)}&deg;C</td>
            <td>{convertSessionType(item.sessionType)}</td>
          </tr>
        ))}
      </tbody>
    </table>
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
