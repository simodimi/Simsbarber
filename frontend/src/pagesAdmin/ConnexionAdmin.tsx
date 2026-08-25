import React from "react";
import "../styles/connexion.css";
import logo from "../assets/icone/logo.png";
import close from "../assets/icone/closeEye.png";
import open from "../assets/icone/openEye.png";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Button from "../ui/Button";
import { useState } from "react";
import { toast } from "react-toastify";
import { useAdminAuth } from "./AdminAuthContext";

interface data {
  emailAdmin: string;
  passwordAdmin: string;
}
interface AxiosError {
  response?: { data?: { error?: string } };
}
const ConnexionAdmin = () => {
  const [textewrite, settextewrite] = useState<string>("");
  const [modepassword, setmodepassword] = useState<string>("password");
  const [showpassword, setshowpassword] = useState<boolean>(false);
  const [dataform, setdataform] = useState<data>({
    emailAdmin: "",
    passwordAdmin: "",
  });
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from;
  const { login } = useAdminAuth();
  const handlepass = () => {
    const eye = !showpassword;
    setshowpassword(eye);
    setmodepassword(eye ? "text" : "password");
  };
  const handlechange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setdataform({ ...dataform, [name]: value });
  };
  const handlesubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!dataform.emailAdmin || !dataform.passwordAdmin) {
      settextewrite("veuillez remplir tous les champs");
      toast.error("Veuillez remplir tous les champs");
      return;
    }
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(dataform.emailAdmin)) {
      settextewrite("l'email ne respecte pas la forme");
      toast.error("l'email ne respecte pas la forme");
      return;
    }
    try {
      await login(dataform.emailAdmin, dataform.passwordAdmin);
      navigate(from || "/admin/home");
      settextewrite("");
      setdataform({ ...dataform, emailAdmin: "", passwordAdmin: "" });
    } catch (error) {
      const err = error as AxiosError;
      if (err.response) {
        toast.error(err.response.data?.error || "Une erreur s'est produite.");
        settextewrite(err.response.data?.error || "Une erreur s'est produite.");
      }
    }
  };
  return (
    <div className="ConnexionHeader">
      <div className="ConnexionHome">
        <div className="ConnexionHomeLogo">
          <img src={logo} alt="" />
        </div>
        <p id="errortext">{textewrite}</p>
        <div className="ConnexionHomeForm">
          <form onSubmit={handlesubmit}>
            <div className="ConnexionHomeFormCase">
              <p>Email</p>

              <input
                type="email"
                value={dataform.emailAdmin}
                name="emailAdmin"
                id=""
                placeholder="veuillez entrer votre mail"
                onChange={handlechange}
              />
            </div>
            <div className="ConnexionHomeFormCase">
              <p>Mot de passe</p>
              <div className="ConnexionHomeFormCasePassword">
                <input
                  value={dataform.passwordAdmin}
                  type={modepassword}
                  name="passwordAdmin"
                  id=""
                  placeholder="veuillez entrer votre mot de passe"
                  onChange={handlechange}
                />
                <div className="FormEyePassword">
                  <img
                    src={showpassword ? close : open}
                    alt=""
                    onClick={handlepass}
                  />
                </div>
              </div>
            </div>
            <div className="ConnexionBtn">
              <Button type="submit" className="succes">
                Se connecter
              </Button>
            </div>
          </form>
        </div>
        <div className="ConnexionHomeLink">
          <p>
            Vous n'avez pas de compte?{" "}
            <Link to="/admin/inscription">créer votre compte</Link>{" "}
          </p>
          <p>
            Vous avez oublié votre mot de passe?{" "}
            <Link to="/admin/forgetpassword">
              rénitialisez votre compte
            </Link>{" "}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ConnexionAdmin;
