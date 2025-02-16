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
} from "firebase/firestore";
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
  trackGrip: string;
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

  useEffect(() => {
    const fetchLaps = async () => {
      try {
        const productsCollection = collection(db, "laps");
        const q = query(productsCollection, orderBy("timestamp", "desc"));

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
  }, []);

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
            <select class="select select-ghost w-full">
              <option selected>
                All Tracks
              </option>
              <option>Nurburgring</option>
            </select>
          </th>
          <th>Car</th>
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
            <td>{item.track}</td>
            <td>{item.car}</td>
            <td>{formatLaptime(item.laptime)}</td>
            <td>{item.trackGrip}</td>
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
