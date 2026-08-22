import "../styles/connexion.css";
import logo from "../assets/icone/logo.png";
import close from "../assets/icone/closeEye.png";
import open from "../assets/icone/openEye.png";
import { Link, useNavigate } from "react-router-dom";
import Button from "../ui/Button";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import cancel from "../assets/icone/cancel.png";
import good from "../assets/icone/vrai.png";
import connect from "../services/Util";
interface data {
  mailUser: string;
  passwordUser: string;
  passwordUserConfirm: string;
  codeUser: string;
}
interface restriction {
  id: number;
  text: string;
}
interface stepper {
  step1: boolean;
  step2: boolean;
  step3: boolean;
}
interface AxiosError {
  response?: { data?: { error?: string } };
}
const ForgetPassword = () => {
  const [textewrite, settextewrite] = useState<string>("");
  const [modepassword, setmodepassword] = useState<string>("password");
  const [showpassword, setshowpassword] = useState<boolean>(false);
  //confirmer password
  const [modepassword2, setmodepassword2] = useState<string>("password");
  const [showpassword2, setshowpassword2] = useState<boolean>(false);
  const [dataform, setdataform] = useState<data>({
    mailUser: "",
    passwordUser: "",
    passwordUserConfirm: "",
    codeUser: "",
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

  //stepper
  const [activestep, setactivestep] = useState<stepper>({
    step1: true,
    step2: false,
    step3: false,
  });
  const [time, settime] = useState(300);
  const [timestarted, settimestarted] = useState<boolean>(false);
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
  //horloge
  const minutes = Math.floor(time / 60)
    .toString()
    .padStart(2, "0");
  const secondes = (time % 60).toString().padStart(2, "0");
  //compte à rebours
  useEffect(() => {
    //si on est à la prémière étape ou si le temps n'a pas été démarré
    if (activestep.step1 || timestarted === false) {
      return;
    }
    if (time === 0) {
      setactivestep({ ...activestep, step1: true, step2: false, step3: false });
      settime(0);
      settimestarted(false);
      settextewrite("temps épuisé veillez recommencer le processus");
      toast.error("temps épuisé veillez recommencer le processus");
      return;
    }
    const interval = setTimeout(() => {
      settime((prev) => prev - 1);
    }, 1000);
    return () => {
      clearTimeout(interval);
    };
  }, [time, activestep.step1, timestarted]);

  const handlesubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!activestep.step3) return;
    if (activestep.step3) {
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
    }
    try {
      const data = await connect.post("/api/auth/reset-password", {
        mailUser: dataform.mailUser,
        nouveauPassword: dataform.passwordUserConfirm,
        code: dataform.codeUser,
      });
      if (data.status === 200) {
        toast.success(
          "Mot de passe réinitialisé avec succès ! Veuillez vous connecter.",
        );
        navigate("/");
        setdataform({
          ...dataform,
          mailUser: "",
          passwordUser: "",
          passwordUserConfirm: "",
          codeUser: "",
        });
        settextewrite("");
      }
    } catch (error) {
      const err = error as AxiosError;
      if (err.response) {
        toast.error(err.response.data?.error || "Une erreur s'est produite.");
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
  const handlenext = async () => {
    if (activestep.step1) {
      if (!dataform.mailUser) {
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
        const data = await connect.post("/api/auth/forgot-password", {
          mailUser: dataform.mailUser,
        });
        if (data.status === 200) {
          setactivestep({
            ...activestep,
            step1: false,
            step2: true,
            step3: false,
          });
          settextewrite("");
          settime(300);
          settimestarted(true);
        }
      } catch (error) {
        const err = error as AxiosError;
        if (err) {
          toast.error(err.response?.data?.error);
          setactivestep({
            ...activestep,
            step1: true,
            step2: false,
            step3: false,
          });
          settextewrite(
            err.response?.data?.error || "Une erreur s'est produite.",
          );
        }
      }
    }
    if (activestep.step2) {
      if (!dataform.codeUser) {
        settextewrite("veuillez remplir tous les champs");
        toast.error("Veuillez remplir tous les champs");
        return;
      }
      try {
        const data = await connect.post("/api/auth/verify-code", {
          mailUser: dataform.mailUser,
          code: dataform.codeUser,
        });
        if (data.status === 200) {
          setactivestep({
            ...activestep,
            step1: false,
            step2: false,
            step3: true,
          });
          settextewrite("");
        }
      } catch (error) {
        const err = error as AxiosError;
        if (err) {
          toast.error(err.response?.data?.error);
          setactivestep({
            ...activestep,
            step1: false,
            step2: true,
            step3: false,
          });
          settextewrite("code de vérification incorrect");
          toast.error("Code de vérification incorrect");
        }
      }
    }
  };
  const handleback = () => {
    if (activestep.step2) {
      setactivestep({ ...activestep, step1: true, step2: false, step3: false });
      settextewrite("");
      settime(300);
      settimestarted(false);
    }
    if (activestep.step3) {
      setactivestep({ ...activestep, step1: false, step2: true, step3: false });
      settextewrite("");
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
            {activestep.step1 && (
              <>
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
              </>
            )}
            {activestep.step2 && (
              <>
                <div className="ConnexionHomeFormCase">
                  <p>Code de vérification</p>
                  <p className="CodeSms">
                    Vous avez reçu un code de vérification via mail,veillez le
                    saisir dans les 5 minutes qui suivent.
                  </p>
                  <p className="horloge">
                    <span>{minutes}</span>:<span>{secondes}</span>
                  </p>
                  <input
                    type="text"
                    value={dataform.codeUser}
                    name="codeUser"
                    id=""
                    placeholder="veuillez saisir votre code de vérification"
                    onChange={handlechange}
                  />
                </div>
              </>
            )}
            {activestep.step3 && (
              <>
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
              </>
            )}

            <div className="ConnexionBtnReset">
              {!activestep.step1 && (
                <Button type="button" className="error" onClick={handleback}>
                  Retour
                </Button>
              )}
              {activestep.step3 ? (
                <>
                  <Button type="submit" className="succes">
                    Valider
                  </Button>
                </>
              ) : (
                <>
                  {" "}
                  <Button type="button" className="succes" onClick={handlenext}>
                    Suivant
                  </Button>
                </>
              )}
            </div>
          </form>
        </div>
        <div className="ConnexionHomeLink">
          <p>
            Vous avez un compte? <Link to="/">connectez vous</Link>{" "}
          </p>
          <p>
            Vous n'avez pas de compte?{" "}
            <Link to="/inscription">créez votre compte</Link>{" "}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgetPassword;
