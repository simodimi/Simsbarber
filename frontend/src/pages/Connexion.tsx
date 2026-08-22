import "../styles/connexion.css";
import logo from "../assets/icone/logo.png";
import close from "../assets/icone/closeEye.png";
import open from "../assets/icone/openEye.png";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Button from "../ui/Button";
import { useState } from "react";
import { toast } from "react-toastify";
import { useAuth } from "../pages/AuthContext";

interface data {
  mailUser: string;
  passwordUser: string;
}
interface AxiosError {
  response?: { data?: { error?: string } };
}
const Connexion = () => {
  const [textewrite, settextewrite] = useState<string>("");
  const [modepassword, setmodepassword] = useState<string>("password");
  const [showpassword, setshowpassword] = useState<boolean>(false);
  const [dataform, setdataform] = useState<data>({
    mailUser: "",
    passwordUser: "",
  });
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from;
  const { login } = useAuth();
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
    if (!dataform.mailUser || !dataform.passwordUser) {
      settextewrite("veuillez remplir tous les champs");
      toast.error("Veuillez remplir tous les champs");
      return;
    }
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(dataform.mailUser)) {
      settextewrite("l'email ne respecte pas la forme");
      toast.error("l'email ne respecte pas la forme");
      return;
    }
    try {
      await login(dataform.mailUser, dataform.passwordUser);
      navigate(from || "/accueil");
      settextewrite("");
      setdataform({ ...dataform, mailUser: "", passwordUser: "" });
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
                value={dataform.mailUser}
                name="mailUser"
                id=""
                placeholder="veuillez entrer votre mail"
                onChange={handlechange}
              />
            </div>
            <div className="ConnexionHomeFormCase">
              <p>Mot de passe</p>
              <div className="ConnexionHomeFormCasePassword">
                <input
                  value={dataform.passwordUser}
                  type={modepassword}
                  name="passwordUser"
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
            <Link to="/inscription">créer votre compte</Link>{" "}
          </p>
          <p>
            Vous avez oublié votre mot de passe?{" "}
            <Link to="/reinitialisation">rénitialisez votre compte</Link>{" "}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Connexion;
