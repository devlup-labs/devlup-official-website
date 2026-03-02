import TopControls from "./Components/TopControls";
import Cards from "./Components/Cards";
import "./index.css";

export default function App() {
  return (
    <div className="min-h-screen w-full bg-black flex flex-col">
      <TopControls />
      <Cards />
    </div>
  );
}