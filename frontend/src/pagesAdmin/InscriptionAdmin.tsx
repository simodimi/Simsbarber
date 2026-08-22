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
  nameAdmin: string;
  emailAdmin: string;
  passwordAdmin: string;
  passwordAdminConfirm: string;
}
interface restriction {
  id: number;
  text: string;
}
interface AxiosError {
  response?: { data?: { error?: string } };
}
const InscriptionAdmin = () => {
  const [textewrite, settextewrite] = useState<string>("");
  const [modepassword, setmodepassword] = useState<string>("password");
  const [showpassword, setshowpassword] = useState<boolean>(false);
  //confirmer password
  const [modepassword2, setmodepassword2] = useState<string>("password");
  const [showpassword2, setshowpassword2] = useState<boolean>(false);
  const [dataform, setdataform] = useState<data>({
    nameAdmin: "",
    emailAdmin: "",
    passwordAdmin: "",
    passwordAdminConfirm: "",
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
    if (name === "passwordAdmin") {
      //visualier les restrictions si au moins 1 caractère saisi dans le champ password
      setshowrestriction(value.trim().length > 0);
    }
  };
  const handlesubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (
      !dataform.emailAdmin ||
      !dataform.passwordAdmin ||
      !dataform.nameAdmin ||
      !dataform.passwordAdminConfirm
    ) {
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
    const check = {
      longueur: dataform.passwordAdmin.length >= 8,
      minuscule: /[a-z]/.test(dataform.passwordAdmin),
      majuscule: /[A-Z]/.test(dataform.passwordAdmin),
      chiffre: /\d/.test(dataform.passwordAdmin),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(dataform.passwordAdmin),
    };
    //on transforme un objet(check) en tableau avec (object.values) et on verifie qu'on aura true
    if (!Object.values(check).every((p) => p)) {
      settextewrite("le mot de passe ne respecte pas les standards");
      toast.error("le mot de passe ne respecte pas les standards");
      return;
    }
    if (dataform.passwordAdmin !== dataform.passwordAdminConfirm) {
      settextewrite("les mots de passe ne sont pas identiques");
      toast.error("les mots de passe ne sont pas identiques");
      return;
    }
    try {
      // On n'envoie que les 3 champs attendus par requestAccessSchema
      // (passwordAdminConfirm reste local au front, jamais envoyé au serveur).
      const data = await connect.post("/api/admin/auth/request-access", {
        nameAdmin: dataform.nameAdmin,
        mailAdmin: dataform.emailAdmin,
        passwordAdmin: dataform.passwordAdmin,
      });
      // CORRIGÉ : le backend renvoie 201 (création), pas 200.
      if (data.status === 201) {
        toast.success(
          `Inscription en attente de validation par l'administrateur`,
        );
        // On transmet le requestId à InscriptionAfter via le state de
        // navigation (pas dans l'URL), pour qu'elle sache QUELLE demande
        // surveiller.
        navigate("/autorisation", {
          state: { requestId: data.data.requestId },
        });
        setdataform({
          ...dataform,
          nameAdmin: "",
          emailAdmin: "",
          passwordAdmin: "",
          passwordAdminConfirm: "",
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
    const pass = dataform.passwordAdmin;
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
                value={dataform.nameAdmin}
                name="nameAdmin"
                id=""
                placeholder="veuillez entrer votre nom"
                onChange={handlechange}
              />
            </div>
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
            <div className="ConnexionHomeFormCase">
              <p>Confirmer mot de passe</p>
              <div className="ConnexionHomeFormCasePassword">
                <input
                  value={dataform.passwordAdminConfirm}
                  type={modepassword2}
                  name="passwordAdminConfirm"
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
            Vous avez un compte? <Link to="/admin/">connectez vous</Link>{" "}
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

export default InscriptionAdmin;
