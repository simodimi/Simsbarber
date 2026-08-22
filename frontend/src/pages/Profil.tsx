import Siderbar from "../components/Siderbar";
import { Link, Outlet, useLocation } from "react-router-dom";
import logo from "../assets/icone/logo1.png";
import "../styles/profil.css";
import { useEffect, useState } from "react";
import { useNotification } from "../services/NotificationContext";
const Profil = () => {
  const local = useLocation();
  const { unreadCount } = useNotification();
  const [selectMenu, setselectMenu] = useState("reservation");
  useEffect(() => {
    if (local.pathname === "/profil/reservation") {
      setselectMenu("reservation");
    }
    if (local.pathname === "/profil/message") {
      setselectMenu("message");
    }
    if (local.pathname === "/profil/para") {
      setselectMenu("para");
    }
  }, [local]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100vh",
      }}
    >
      <Siderbar />
      <div className="profilHeader">
        <div className="ProfilHeaderMenu">
          <div className="ProfilHeaderMenuCard">
            <Link to="/profil/reservation">
              <div
                className={`ProfilHeaderMenuTitle ${selectMenu === "reservation" ? "active" : ""}`}
                onClick={() => {
                  setselectMenu("reservation");
                }}
              >
                <p>Mes Réservations</p>
              </div>
            </Link>
            <Link to="/profil/message">
              <div
                className={`ProfilHeaderMenuTitle ${selectMenu === "message" ? "active" : ""}`}
                onClick={() => {
                  setselectMenu("message");
                }}
              >
                <p>Mes Messages</p>
                {unreadCount > 0 && (
                  <span
                    style={{
                      position: "absolute",
                      top: "-5px",
                      right: "-10px",
                      backgroundColor: "red",
                      color: "white",
                      borderRadius: "50%",
                      padding: "2px 6px",
                      fontSize: "12px",
                      fontWeight: "bold",
                    }}
                  >
                    {unreadCount}
                  </span>
                )}
              </div>
            </Link>
            <Link to="/profil/para">
              <div
                className={`ProfilHeaderMenuTitle ${selectMenu === "para" ? "active" : ""}`}
                onClick={() => setselectMenu("para")}
              >
                <p>Mes Paramètres</p>
              </div>
            </Link>
          </div>
          <div className="ProfilHeaderMenuImg">
            <img src={logo} alt="" />
          </div>
        </div>
        <div className="profilHeaderContent">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Profil;
