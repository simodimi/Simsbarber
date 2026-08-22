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
  emailAdmin: string;
  passwordAdmin: string;
  passwordAdminConfirm: string;
  codeAdmin: string;
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

const ForgetPasswordAdmin = () => {
  const [textewrite, settextewrite] = useState<string>("");
  const [modepassword, setmodepassword] = useState<string>("password");
  const [showpassword, setshowpassword] = useState<boolean>(false);
  const [modepassword2, setmodepassword2] = useState<string>("password");
  const [showpassword2, setshowpassword2] = useState<boolean>(false);
  const [dataform, setdataform] = useState<data>({
    emailAdmin: "",
    passwordAdmin: "",
    passwordAdminConfirm: "",
    codeAdmin: "",
  });
  const restriction: restriction[] = [
    { id: 1, text: "Au moins 8 caractères." },
    { id: 2, text: "Au moins 1 lettre minuscule." },
    { id: 3, text: "Au moins 1 lettre majuscule." },
    { id: 4, text: "Au moins 1 chiffre." },
    { id: 5, text: "Au moins 1 caractère spécial." },
  ];
  const [showrestriction, setshowrestriction] = useState<boolean>(false);

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
  const handlepass2 = () => {
    const eye = !showpassword2;
    setshowpassword2(eye);
    setmodepassword2(eye ? "text" : "password");
  };
  const handlechange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setdataform({ ...dataform, [name]: value });
    if (name === "passwordAdmin") {
      setshowrestriction(value.trim().length > 0);
    }
  };
  const minutes = Math.floor(time / 60)
    .toString()
    .padStart(2, "0");
  const secondes = (time % 60).toString().padStart(2, "0");

  useEffect(() => {
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

  // ── ÉTAPE 3 : envoi réel au backend ──
  const handlesubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!activestep.step3) return;

    const check = {
      longueur: dataform.passwordAdmin.length >= 8,
      minuscule: /[a-z]/.test(dataform.passwordAdmin),
      majuscule: /[A-Z]/.test(dataform.passwordAdmin),
      chiffre: /\d/.test(dataform.passwordAdmin),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(dataform.passwordAdmin),
    };
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
      // Noms de champs alignés sur resetPasswordAdminSchema côté backend :
      // emailAdmin, code (pas codeAdmin), nouveauPassword (pas passwordAdmin).
      const data = await connect.post("/api/admin/auth/reset-password", {
        emailAdmin: dataform.emailAdmin,
        code: dataform.codeAdmin,
        nouveauPassword: dataform.passwordAdmin,
      });
      if (data.status === 200) {
        toast.success("Mot de passe réinitialisé avec succès");
        navigate("/admin/");
        setdataform({
          emailAdmin: "",
          passwordAdmin: "",
          passwordAdminConfirm: "",
          codeAdmin: "",
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
    const pass = dataform.passwordAdmin;
    if (p.id === 1) return pass.length >= 8;
    if (p.id === 2) return /[a-z]/.test(pass);
    if (p.id === 3) return /[A-Z]/.test(pass);
    if (p.id === 4) return /\d/.test(pass);
    if (p.id === 5) return /[!@#$%^&*(),.?":{}|<>]/.test(pass);
    return false;
  };

  // ── ÉTAPE 1 → 2 : demande réelle du code par email ──
  const handlenext = async () => {
    if (activestep.step1) {
      if (!dataform.emailAdmin) {
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
        const data = await connect.post("/api/admin/auth/forgot-password", {
          emailAdmin: dataform.emailAdmin,
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
        toast.error(err.response?.data?.error || "Une erreur s'est produite.");
        settextewrite(
          err.response?.data?.error || "Une erreur s'est produite.",
        );
      }
      return;
    }

    // ── ÉTAPE 2 → 3 : vérification réelle du code ──
    if (activestep.step2) {
      if (!dataform.codeAdmin) {
        settextewrite("veuillez remplir tous les champs");
        toast.error("Veuillez remplir tous les champs");
        return;
      }
      try {
        const data = await connect.post("/api/admin/auth/verify-code", {
          emailAdmin: dataform.emailAdmin,
          code: dataform.codeAdmin,
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
        settextewrite("code de vérification incorrect");
        toast.error(
          err.response?.data?.error || "Code de vérification incorrect",
        );
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
            )}
            {activestep.step2 && (
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
                  value={dataform.codeAdmin}
                  name="codeAdmin"
                  id=""
                  placeholder="veuillez saisir votre code de vérification"
                  onChange={handlechange}
                />
              </div>
            )}
            {activestep.step3 && (
              <>
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
              </>
            )}

            <div className="ConnexionBtnReset">
              {!activestep.step1 && (
                <Button type="button" className="error" onClick={handleback}>
                  Retour
                </Button>
              )}
              {activestep.step3 ? (
                <Button type="submit" className="succes">
                  Valider
                </Button>
              ) : (
                <Button type="button" className="succes" onClick={handlenext}>
                  Suivant
                </Button>
              )}
            </div>
          </form>
        </div>
        <div className="ConnexionHomeLink">
          <p>
            Vous avez un compte? <Link to="/admin/">connectez vous</Link>{" "}
          </p>
          <p>
            Vous n'avez pas de compte?{" "}
            <Link to="/admin/inscription">créez votre compte</Link>{" "}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgetPasswordAdmin;
