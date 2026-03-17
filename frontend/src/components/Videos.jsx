import TopControls from "./Video/TopControls.jsx";
import Cards from "./Video/Cards";


export default function App() {
  return (
    <div className="min-h-screen w-full [background-image:var(--bg-main-gradient)] bg-[var(--bg-fallback)] flex flex-col">
      <TopControls />
      <Cards />
    </div>
  );
}


