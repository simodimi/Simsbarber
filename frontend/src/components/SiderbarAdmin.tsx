import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Button from "../ui/Button";
import login from "../assets/icone/login.png";
import logo from "../assets/icone/logo2.png";
import logouts from "../assets/icone/logout.png";
import "../styles/accueil.css";
import { useAdminAuth } from "../pagesAdmin/AdminAuthContext";

const SiderbarAdmin = () => {
  const [hidingProfil, sethidingProfil] = useState<boolean>(false);
  const [selectMenu, setselectMenu] = useState<string>("");
  const navigate = useNavigate();
  const { admin, logout } = useAdminAuth();
  const local = useLocation();
  useEffect(() => {
    if (local.pathname === "/admin/home") {
      setselectMenu("home");
    }
    if (
      local.pathname === "/admin/prestation" ||
      local.pathname.startsWith("/admin/prestation")
    ) {
      setselectMenu("prestation");
    }
    if (local.pathname === "/admin/categorie") {
      setselectMenu("categorie");
    }
    if (local.pathname === "/admin/equipe") {
      setselectMenu("equipe");
    }
    if (local.pathname === "/admin/message") {
      setselectMenu("message");
    }
    if (local.pathname === "/admin/client") {
      setselectMenu("client");
    }
    if (local.pathname === "/admin/avis") {
      setselectMenu("avis");
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
          <Link to={"/admin/home"}>
            <img src={logo} alt="" />
          </Link>
        </div>
        <div className="AccueilNavbarPages">
          <Link to={"/admin/home"}>
            <div className={`Header ${selectMenu === "home" ? "active" : ""}`}>
              Tableau de bord
            </div>
          </Link>
          <Link to={"/admin/prestation"}>
            {" "}
            <div
              className={`Header ${selectMenu === "prestation" ? "active" : ""}`}
            >
              Prestations
            </div>
          </Link>
          <Link to={"/admin/categorie"}>
            {" "}
            <div
              className={`Header ${selectMenu === "categorie" ? "active" : ""}`}
            >
              Catégories
            </div>
          </Link>
          <Link to={"/admin/message"}>
            {" "}
            <div
              className={`Header ${selectMenu === "message" ? "active" : ""}`}
            >
              Message
            </div>
          </Link>
          <Link to={"/admin/client"}>
            {" "}
            <div
              className={`Header ${selectMenu === "client" ? "active" : ""}`}
            >
              Client
            </div>
          </Link>
          <Link to={"/admin/equipe"}>
            {" "}
            <div
              className={`Header ${selectMenu === "equipe" ? "active" : ""}`}
            >
              équipe
            </div>
          </Link>
          <Link to={"/admin/avis"}>
            {" "}
            <div className={`Header ${selectMenu === "avis" ? "active" : ""}`}>
              Avis
            </div>
          </Link>
        </div>
        <div className="AccueilNavbarConnect">
          <div className="AccueilNavbarConnectbtn">
            <div className="AccueilNavbarConnectbtnName">
              <img
                src={logo}
                alt=""
                onClick={() => sethidingProfil((prev) => !prev)}
              />
              <p>{admin?.nameAdmin}</p>
            </div>
            {hidingProfil && (
              <div className="AccueilNavbarConnectOption" ref={refside}>
                {!admin ? (
                  <div
                    className="AccueilNavbarConnectOptionList"
                    onClick={() => navigate("/admin")}
                  >
                    <img src={login} alt="" />
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
                {/*   <Link to={"/admin/para"} style={{ textDecoration: "none" }}>
                  {" "}
                  <div className="AccueilNavbarConnectOptionList">
                    <img src={profil} alt="" />
                    <p>Mon Profil</p>
                  </div>
                </Link>*/}
              </div>
            )}
          </div>
          <Link to={"/admin/planning"}>
            <div className="AccueilNavbarConnectbtns">
              <Button className="glow">Réserver</Button>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SiderbarAdmin;
