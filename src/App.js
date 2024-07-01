import Landing from "./pages/Landing";

import {
  Routes,
  Route,
  useNavigationType,
  useLocation,
} from "react-router-dom";
import { BrowserRouter } from "react-router-dom";
import { Test } from "./pages/Test";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import TrainDash from "./pages/TrainDash";
import { Translate } from "./pages/Translate";
import Manual from "./pages/Manual";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/Assistant" element={<Test />} />
          <Route path="/Login" element={<Login />} />
          <Route path="/Signup" element={<Signup />} />
          <Route path="/Dashboard" element={<TrainDash />} />
          <Route path="/Translate" element={<Translate />} />
          <Route path="/Manual" element={<Manual />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
