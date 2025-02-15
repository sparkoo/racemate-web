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
  apiKey: "AIzaSyBQ3UysKh5lscmf2u8rGZ_AgVhPJ81ltCo",
  authDomain: "racemate-3dc5c.firebaseapp.com",
  projectId: "racemate-3dc5c",
  storageBucket: "racemate-3dc5c.firebasestorage.app",
  messagingSenderId: "935374379053",
  appId: "1:935374379053:web:87b6464781d479549600a4",
  measurementId: "G-D6LY59DN3D",
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
  const [data, setData] = useState<LapData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any | null>(null);

  useEffect(() => {
    const fetchData = async () => {
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
            setData(fetchedProducts);
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
    fetchData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div>
      <table class="min-w-full divide-y divide-gray-200 table-auto">
        {" "}
        {/* min-w-full makes the table take full width */}
        <thead>
          <tr>
            <th
              scope="col"
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Time
            </th>
            <th
              scope="col"
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Name
            </th>
            <th
              scope="col"
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Track
            </th>
            <th
              scope="col"
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Car
            </th>
            <th
              scope="col"
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              LapTime
            </th>
            <th
              scope="col"
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Session Type
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.id}>
              <td class="px-2 py-1 whitespace-nowrap text-sm font-medium text-gray-300">
                {new Date(item.timestamp * 1000).toLocaleString()}
              </td>
              <td class="px-2 py-1 whitespace-nowrap text-sm font-medium">
                {item.name}
              </td>
              <td class="px-2 py-1 whitespace-nowrap text-sm font-medium text-gray-300">
                {item.track}
              </td>
              <td class="px-2 py-1 whitespace-nowrap text-sm text-gray-300">
                {item.car}
              </td>
              <td class="px-2 py-1 whitespace-nowrap text-sm text-gray-300">
                {formatLaptime(item.laptime)}
              </td>
              <td class="px-2 py-1 whitespace-nowrap text-right text-sm font-medium text-gray-300">
                {convertSessionType(item.sessionType)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

function formatLaptime(milliseconds: number): string {
  const minutes = Math.floor(milliseconds / (1000 * 60));
  const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);
  const millis = milliseconds % 1000;

  const minutesStr = minutes.toString().padStart(2, '0');
  const secondsStr = seconds.toString().padStart(2, '0');
  const millisStr = millis.toString().padStart(3, '0');

  return `${minutesStr}:${secondsStr}.${millisStr}`;
}

function convertSessionType(type: number): string {
  switch (type) {
    case 0: return "Practice";
    case 1: return "Qualify";
    case 2: return "Race";
    case 3: return "HotLap";
    default: return "Unknown";
  }
}

export default LapListing;
