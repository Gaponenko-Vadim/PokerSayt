import { Route, Routes } from "react-router-dom";
import Layout from "./layout";
import Home from "./pages/Home";
import CardTable from "./components/СardTable";
const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/CardTable" element={<CardTable />} />
      </Route>
    </Routes>
  );
};

export default App;
