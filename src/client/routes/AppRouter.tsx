import { BrowserRouter, Routes, Route } from "react-router-dom";
import StartPage from "../pages/StartPage";
import SignUpPage from "../pages/SignUpPage";
import SignInPage from "../pages/SignInPage";
import HomePage from "../pages/HomePage";
import TradeRoomPage from "../pages/TradePage";
import ProfilePage from "../pages/ProfilePage";
import FriendsPage from "../pages/FriendsPage";
import CollectionPage from "../pages/CollectionPage";
import OpenPackPage from "../pages/OpenPackPage";

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<StartPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/login" element={<SignInPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/coleccion" element={<CollectionPage />} />
        <Route path="/abrir" element={<OpenPackPage />} />
        <Route path="/trade" element={<TradeRoomPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/friends" element={<FriendsPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
