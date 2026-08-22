import "../styles/connexion.css";
import logo from "../assets/icone/logo.png";
import close from "../assets/icone/closeEye.png";
import open from "../assets/icone/openEye.png";
import { Link, useNavigate } from "react-router-dom";
import Button from "../ui/Button";
import { useState } from "react";
import { toast } from "react-toastify";
import cancel from "../assets/icone/cancel.png";
import good from "../assets/icone/vrai.png";
import connect from "../services/Util";
interface data {
  nameUser: string;
  mailUser: string;
  passwordUser: string;
  passwordUserConfirm: string;
}
interface restriction {
  id: number;
  text: string;
}
interface AxiosError {
  response?: { data?: { error?: string } };
}
const Inscription = () => {
  const [textewrite, settextewrite] = useState<string>("");
  const [modepassword, setmodepassword] = useState<string>("password");
  const [showpassword, setshowpassword] = useState<boolean>(false);
  //confirmer password
  const [modepassword2, setmodepassword2] = useState<string>("password");
  const [showpassword2, setshowpassword2] = useState<boolean>(false);
  const [dataform, setdataform] = useState<data>({
    nameUser: "",
    mailUser: "",
    passwordUser: "",
    passwordUserConfirm: "",
  });
  //tableau de restriction
  const restriction: restriction[] = [
    { id: 1, text: "Au moins 8 caractères." },
    { id: 2, text: "Au moins 1 lettre minuscule." },
    { id: 3, text: "Au moins 1 lettre majuscule." },
    { id: 4, text: "Au moins 1 chiffre." },
    { id: 5, text: "Au moins 1 caractère spécial." },
  ];
  const [showrestriction, setshowrestriction] = useState<boolean>(false);
  const navigate = useNavigate();
  const handlepass = () => {
    const eye = !showpassword;
    setshowpassword(eye);
    setmodepassword(eye ? "text" : "password");
  };
  //confirmer password
  const handlepass2 = () => {
    const eye = !showpassword2;
    setshowpassword2(eye);
    setmodepassword2(eye ? "text" : "password");
  };
  const handlechange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setdataform({ ...dataform, [name]: value });
    if (name === "passwordUser") {
      //visualier les restrictions si au moins 1 caractère saisi dans le champ password
      setshowrestriction(value.trim().length > 0);
    }
  };
  const handlesubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (
      !dataform.mailUser ||
      !dataform.passwordUser ||
      !dataform.nameUser ||
      !dataform.passwordUserConfirm
    ) {
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
    const check = {
      longueur: dataform.passwordUser.length >= 8,
      minuscule: /[a-z]/.test(dataform.passwordUser),
      majuscule: /[A-Z]/.test(dataform.passwordUser),
      chiffre: /\d/.test(dataform.passwordUser),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(dataform.passwordUser),
    };
    //on transforme un objet(check) en tableau avec (object.values) et on verifie qu'on aura true
    if (!Object.values(check).every((p) => p)) {
      settextewrite("le mot de passe ne respecte pas les standards");
      toast.error("le mot de passe ne respecte pas les standards");
      return;
    }
    if (dataform.passwordUser !== dataform.passwordUserConfirm) {
      settextewrite("les mots de passe ne sont pas identiques");
      toast.error("les mots de passe ne sont pas identiques");
      return;
    }
    try {
      const data = await connect.post("/api/auth/register", dataform);
      if (data.status === 201) {
        toast.success(`Inscription reussi ${dataform.nameUser}`);
        navigate("/accueil");
        setdataform({
          ...dataform,
          nameUser: "",
          mailUser: "",
          passwordUser: "",
          passwordUserConfirm: "",
        });
        settextewrite("");
      }
    } catch (error) {
      const err = error as AxiosError;
      if (err.response) {
        toast.error(err.response.data?.error);
        settextewrite(err.response.data?.error || "Une erreur s'est produite.");
      }
    }
  };
  const checkpassword = (p: restriction) => {
    const pass = dataform.passwordUser;
    if (p.id === 1) {
      return pass.length >= 8;
    }
    if (p.id === 2) {
      return /[a-z]/.test(pass);
    }
    if (p.id === 3) {
      return /[A-Z]/.test(pass);
    }
    if (p.id === 4) {
      return /\d/.test(pass);
    }
    if (p.id === 5) {
      return /[!@#$%^&*(),.?":{}|<>]/.test(pass);
    }
    return false;
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
              <p>Nom</p>

              <input
                type="text"
                value={dataform.nameUser}
                name="nameUser"
                id=""
                placeholder="veuillez entrer votre nom"
                onChange={handlechange}
              />
            </div>
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
            <div className="ConnexionHomeFormCase">
              <p>Confirmer mot de passe</p>
              <div className="ConnexionHomeFormCasePassword">
                <input
                  value={dataform.passwordUserConfirm}
                  type={modepassword2}
                  name="passwordUserConfirm"
                  id=""
                  placeholder="veuillez confirmer votre mot de passe"
                  onChange={handlechange}
                />
                <div className="FormEyePassword">
                  <img
                    src={showpassword2 ? close : open}
                    alt=""
                    onClick={handlepass2}
                  />
                </div>
              </div>
            </div>
            {showrestriction && (
              <>
                {restriction.map((p) => (
                  <div
                    className="RestrictionCase"
                    key={p.id}
                    style={{ color: checkpassword(p) ? "green" : "red" }}
                  >
                    <img src={checkpassword(p) ? good : cancel} alt="" />

                    <p>{p.text}</p>
                  </div>
                ))}
              </>
            )}

            <div className="ConnexionBtn">
              <Button type="submit" className="succes">
                S'inscrire
              </Button>
            </div>
          </form>
        </div>
        <div className="ConnexionHomeLink">
          <p>
            Vous avez un compte? <Link to="/">connectez vous</Link>{" "}
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

export default Inscription;
