import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import Connexion from "./pages/Connexion";
import Notification from "./ui/Notification";
import Accueil from "./pages/Accueil";
import Inscription from "./pages/Inscription";
import ForgetPassword from "./pages/ForgetPassword";
import Prestation from "./pages/Prestation";
import CategoriePrestation from "./pages/CategoriePrestation";
import CategoriePrestationSelect from "./pages/CategoriePrestationSelect";
import Team from "./pages/Team";
import About from "./pages/About";

import Calendrier from "./components/Calendrier";
import Profil from "./pages/Profil";
import Reservation from "./pages/Reservation";
import Message from "./pages/Message";
import Para from "./pages/Para";
import { useState } from "react";
import ErrorPage from "./pages/ErrorPage";
import Planning from "./pagesAdmin/Planning";
import Client from "./pagesAdmin/Client";
import EquipeAdmin from "./pagesAdmin/EquipeAdmin";
import ForgetPasswordAdmin from "./pagesAdmin/ForgetPasswordAdmin";
import HomeAdmin from "./pagesAdmin/HomeAdmin";
import InscriptionAdmin from "./pagesAdmin/InscriptionAdmin";
import MessageAdmin from "./pagesAdmin/MessageAdmin";
import ParaAdmin from "./pagesAdmin/ParaAdmin";
import PrestationAdmin from "./pagesAdmin/PrestationAdmin";
import ConnexionAdmin from "./pagesAdmin/ConnexionAdmin";
import Avis from "./pagesAdmin/Avis";
import Categories from "./pagesAdmin/Categories";
import { AuthProviderUser } from "./pages/AuthContext";
import ProtectRouteUser from "./services/ProtectRouteUser";
import InscriptionAfter from "./components/InscriptionAfter";
import { AuthProviderAdmin } from "./pagesAdmin/AdminAuthContext";
import { NotificationProvider } from "./services/NotificationContext";

interface Clients {
  id: number;
  photoUser: string;
  nameUser: string;
  mailUser: string;
  statusReservationUser: "Activer" | "Bloquer";
}
function App() {
  const [visualbackground, setvisualbackground] = useState<string | null>(null);
  const [visualsms, setvisualsms] = useState<number | null>(null);
  const [avissms, setavissms] = useState<number | null>(null);
  const [visualconsult, setvisualconsult] = useState<Clients | null>(null);

  const Adminlayout = () => {
    return (
      <>
        <Routes>
          <Route index element={<ConnexionAdmin />} />
          <Route path="planning" element={<Planning />} />
          <Route
            path="client"
            element={
              <Client
                setvisualsms={setvisualsms}
                setvisualconsult={setvisualconsult}
              />
            }
          />
          <Route path="categorie" element={<Categories />} />
          <Route path="equipe" element={<EquipeAdmin />} />
          <Route path="forgetpassword" element={<ForgetPasswordAdmin />} />
          <Route path="home" element={<HomeAdmin />} />
          <Route path="inscription" element={<InscriptionAdmin />} />
          <Route
            path="message"
            element={<MessageAdmin visualsms={visualsms} avissms={avissms} />}
          />
          <Route path="para" element={<ParaAdmin />} />
          <Route path="prestation" element={<PrestationAdmin />} />
          <Route
            path="avis"
            element={
              <Avis setavissms={setavissms} visualconsult={visualconsult} />
            }
          />
        </Routes>
      </>
    );
  };
  return (
    <div className="AppHome">
      <BrowserRouter>
        <AuthProviderUser>
          <NotificationProvider>
            <Routes>
              <Route path="/" element={<Connexion />} />
              <Route path="/inscription" element={<Inscription />} />
              <Route path="/accueil" element={<Accueil />} />
              <Route path="/reinitialisation" element={<ForgetPassword />} />

              <Route path="/prestation" element={<Prestation />} />
              <Route
                path="/prestation/:categoryId"
                element={<CategoriePrestation />}
              />
              <Route
                path="/prestation/:categoryId/:itemId"
                element={<CategoriePrestationSelect />}
              />
              <Route path="/team" element={<Team />} />
              <Route path="/about" element={<About />} />
              <Route element={<ProtectRouteUser />}>
                <Route path="/calendrier" element={<Calendrier />} />
                <Route path="/profil" element={<Profil />}>
                  <Route index element={<Reservation />} />{" "}
                  {/* Page par défaut */}
                  <Route path="reservation" element={<Reservation />} />
                  <Route path="message" element={<Message />} />
                  <Route
                    path="para"
                    element={<Para setvisualbackground={setvisualbackground} />}
                  />
                </Route>
              </Route>

              {/*côté admin */}
              <Route
                path="/admin/*"
                element={
                  <AuthProviderAdmin>
                    <Adminlayout />
                  </AuthProviderAdmin>
                }
              />
              <Route path="/autorisation" element={<InscriptionAfter />} />
              <Route path="*" element={<ErrorPage />} />
            </Routes>
            <Notification />
          </NotificationProvider>
        </AuthProviderUser>
      </BrowserRouter>
    </div>
  );
}

export default App;
