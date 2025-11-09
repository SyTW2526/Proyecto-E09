import { BrowserRouter, Routes, Route } from "react-router-dom";
import StartPage from "../pages/StartPage";
import SignUpPage from "../pages/SignUpPage";
import HomePage from "../pages/HomePage";

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<StartPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/home" element={<HomePage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
