import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Button from "../ui/Button";
import logins from "../assets/icone/login.png";
import logouts from "../assets/icone/logout.png";
import person from "../assets/icone/person.png";
import profil from "../assets/icone/profils.png";
import logo from "../assets/icone/logo2.png";
import "../styles/accueil.css";
import { useAuth } from "../pages/AuthContext";
import { useNotification } from "../services/NotificationContext";
const Siderbar = () => {
  const [hidingProfil, sethidingProfil] = useState<boolean>(false);
  const [selectMenu, setselectMenu] = useState<string>("");
  const local = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { unreadCount } = useNotification();
  useEffect(() => {
    if (local.pathname === "/accueil") {
      setselectMenu("accueil");
    }
    if (
      local.pathname === "/prestation" ||
      local.pathname.startsWith("/prestation")
    ) {
      setselectMenu("prestation");
    }
    if (local.pathname === "/team") {
      setselectMenu("team");
    }
    if (local.pathname === "/about") {
      setselectMenu("about");
    }
  }, [local.pathname]);

  const refside = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const hideBlock = (e: MouseEvent) => {
      if (refside.current && !refside.current.contains(e.target as Node)) {
        sethidingProfil(false);
      }
    };
    document.addEventListener("mousedown", hideBlock);
    return () => {
      document.removeEventListener("mousedown", hideBlock);
    };
  }, []);
  //scroll automatiquement vers le haut
  const blockref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    blockref.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  return (
    <div className="AccueilHome" ref={blockref}>
      <div className="AccueilNavbar">
        <div className="AccueilNavbarIcone">
          <Link to={"/accueil"}>
            <img src={logo} alt="" />
          </Link>
        </div>
        <div className="AccueilNavbarPages">
          <Link to={"/accueil"}>
            <div
              className={`Header ${selectMenu === "accueil" ? "active" : ""}`}
            >
              Accueil
            </div>
          </Link>
          <Link to={"/prestation"}>
            {" "}
            <div
              className={`Header ${selectMenu === "prestation" ? "active" : ""}`}
            >
              Prestations
            </div>
          </Link>
          <Link to={"/team"}>
            {" "}
            <div className={`Header ${selectMenu === "team" ? "active" : ""}`}>
              équipe
            </div>
          </Link>
          <Link to={"/about"}>
            {" "}
            <div className={`Header ${selectMenu === "about" ? "active" : ""}`}>
              à Propos
            </div>
          </Link>
        </div>
        <div className="AccueilNavbarConnect">
          <div className="AccueilNavbarConnectbtn">
            <div className="AccueilNavbarConnectbtnName">
              <img
                src={user?.photoUser || person}
                alt=""
                onClick={() => sethidingProfil((prev) => !prev)}
              />
              <p>{user?.nameUser}</p>
            </div>
            {hidingProfil && (
              <div className="AccueilNavbarConnectOption" ref={refside}>
                {!user ? (
                  <div
                    className="AccueilNavbarConnectOptionList"
                    onClick={() => navigate("/")}
                  >
                    <img src={logins} alt="" />
                    <p>Connexion</p>
                  </div>
                ) : (
                  <div
                    className="AccueilNavbarConnectOptionList"
                    onClick={logout}
                  >
                    <img src={logouts} alt="" />
                    <p>Déconnexion</p>
                  </div>
                )}
                <Link
                  to={"/profil/reservation"}
                  style={{ textDecoration: "none" }}
                >
                  {" "}
                  <div
                    className="AccueilNavbarConnectOptionList"
                    style={{ position: "relative" }}
                  >
                    <img src={profil} alt="" />
                    <p>Mon Profil</p>
                    {unreadCount > 0 && (
                      <span
                        style={{
                          position: "absolute",
                          top: "-5px",
                          right: "-10px",
                          backgroundColor: "green",
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
              </div>
            )}
          </div>
          <Link to={"/calendrier"}>
            <div className="AccueilNavbarConnectbtns">
              <Button className="glow">Réserver</Button>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Siderbar;
