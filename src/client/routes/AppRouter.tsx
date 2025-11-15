import { BrowserRouter, Routes, Route } from "react-router-dom";
import StartPage from "../pages/StartPage";
import SignUpPage from "../pages/SignUpPage";
import SignInPage from "../pages/SignInPage";
import HomePage from "../pages/HomePage";
import TradeRoomPage from "../pages/TradePage";

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<StartPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/login" element={<SignInPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/trade" element={<TradeRoomPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
