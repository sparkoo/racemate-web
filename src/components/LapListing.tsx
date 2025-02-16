import { FunctionalComponent } from "preact";
import { useEffect, useState } from "preact/hooks";

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {
  collection,
  getFirestore,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { GripMap, TrackMap, Tracks } from "../types/tracks";
import { CarMap, Cars } from "../types/cars";
import { TargetedEvent } from "preact/compat";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  projectId: "racemate-3dc5c",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

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
  airTemp: string;
  roadTemp: string;
  sessionType: number;
  rainTypes: string;
  lapNumber: string;
}

const LapListing: FunctionalComponent<Props> = ({}) => {
  const [laps, setLaps] = useState<LapData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any | null>(null);
  const [selectedTrack, setSelectedTrack] = useState<string>("");

  useEffect(() => {
    const fetchLaps = async () => {
      try {
        const productsCollection = collection(db, "laps");
        const q = query(
          productsCollection,
          where("track", "==", selectedTrack),
          orderBy("timestamp", "desc")
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

  const handleTrackFilter = (event: Event): void => {
    const target = event.target as HTMLSelectElement;
    setSelectedTrack(target.value);
  };

  return (
    <table class="table min-w-full table-zebra table-md table-pin-rows">
      <thead>
        <tr>
          <th>Time</th>
          <th>Name</th>
          <th>
            <select
              value={selectedTrack}
              onChange={handleTrackFilter}
              class="select select-ghost w-full"
            >
              <option value="*" selected>
                All Tracks
              </option>
              {Tracks.map((track) => (
                <option value={track.kunos_id}>{track.name}</option>
              ))}
            </select>
          </th>
          <th>
            <select class="select select-ghost w-full">
              <option value="" selected>
                All Cars
              </option>
              {Cars.map((car) => (
                <option value={car.kunos_id}>{car.name}</option>
              ))}
            </select>
          </th>
          <th>LapTime</th>
          <th>Track grip</th>
          <th>Session Type</th>
        </tr>
      </thead>
      <tbody>
        {laps.map((item) => (
          <tr key={item.id}>
            <td>{new Date(item.timestamp * 1000).toLocaleString()}</td>
            <td>{item.name}</td>
            <td>{TrackMap.get(item.track)}</td>
            <td>{CarMap.get(item.car)}</td>
            <td>{formatLaptime(item.laptime)}</td>
            <td>{GripMap.get(item.trackGrip)}</td>
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
