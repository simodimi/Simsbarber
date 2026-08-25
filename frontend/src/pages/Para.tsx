import {
  useRef,
  useState,
  useEffect,
  type ChangeEvent,
  type SyntheticEvent,
} from "react";
import Button from "../ui/Button";
import openeye from "../assets/icone/openEye.png";
import close from "../assets/icone/closeEye.png";
import { useNavigate } from "react-router-dom";
import cancel from "../assets/icone/cancel.png";
import good from "../assets/icone/vrai.png";
import { toast } from "react-toastify";
import pen from "../assets/icone/crayon.png";
import person from "../assets/icone/person.png";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import connect, { setAccessToken } from "../services/Util";
import { useAuth } from "../pages/AuthContext";
// Types
interface para {
  id: number;
  nom: string;
}
interface restriction {
  id: number;
  text: string;
}
interface BgProps {
  setvisualbackground: React.Dispatch<React.SetStateAction<string | null>>;
}

const avatarUrls = [
  `http://localhost:5000/avatars/A1.jpg`,
  `http://localhost:5000/avatars/A2.jpg`,
  `http://localhost:5000/avatars/A3.jpg`,
  `http://localhost:5000/avatars/A4.jpg`,
  `http://localhost:5000/avatars/A5.jpg`,
  `http://localhost:5000/avatars/A6.jpg`,
  `http://localhost:5000/avatars/A7.jpg`,
  `http://localhost:5000/avatars/A8.jpg`,
  `http://localhost:5000/avatars/A9.jpg`,
  `http://localhost:5000/avatars/A10.jpg`,
  `http://localhost:5000/avatars/A11.jpg`,
  `http://localhost:5000/avatars/A12.jpg`,
  `http://localhost:5000/avatars/A13.jpg`,
  `http://localhost:5000/avatars/A14.jpg`,
  `http://localhost:5000/avatars/A15.jpg`,
  `http://localhost:5000/avatars/A16.jpg`,
  `http://localhost:5000/avatars/A17.jpg`,
  `http://localhost:5000/avatars/A18.jpg`,
  `http://localhost:5000/avatars/A19.jpg`,
  `http://localhost:5000/avatars/A20.jpg`,
];

const backgroundUrls = [
  `http://localhost:5000/background/arbre.jpg`,
  `http://localhost:5000/background/bateau.jpg`,
  `http://localhost:5000/background/board.jpeg`,
  `http://localhost:5000/background/cascade.jpg`,
  `http://localhost:5000/background/galaxie.jpeg`,
  `http://localhost:5000/background/mountains.jpg`,
  `http://localhost:5000/background/neige.jpg`,
  `http://localhost:5000/background/pink.jpeg`,
  `http://localhost:5000/background/water.jpg`,
];

const Para = ({ setvisualbackground }: BgProps) => {
  const navigate = useNavigate();

  // État utilisateur
  const { user, setUser } = useAuth();
  const [loading, setLoading] = useState(true);

  // Menus
  const parametre: para[] = [
    { id: 1, nom: "Se déconnecter" },
    { id: 2, nom: "Changer de mot de passe" },
    { id: 3, nom: "Changer photo de profil" },
    { id: 4, nom: "Supprimer le compte" },
    { id: 5, nom: "Changer fond d'écran des messages" },
    { id: 6, nom: "Informations sur le compte" },
  ];
  const [selectMenu, setselectMenu] = useState<number | null>(1);
  const [choiceMenu, setchoiceMenu] = useState<para | null>(null);

  // Password
  const [datapassword, setdatapassword] = useState({
    passwordUser: "",
    passwordUserConfirm: "",
  });
  const [showrestriction, setshowrestriction] = useState(false);
  const [modepassword, setmodepassword] = useState("password");
  const [showpassword, setshowpassword] = useState(false);
  const [modepassword1, setmodepassword1] = useState("password");
  const [showpassword1, setshowpassword1] = useState(false);

  // Photo
  const refimg = useRef<HTMLInputElement | null>(null);
  const [viewPhoto, setviewPhoto] = useState<string | null>(null);
  const [selectedPhotoFile, setSelectedPhotoFile] = useState<File | null>(null);
  const [photoSource, setPhotoSource] = useState<"preset" | "upload" | null>(
    null,
  );

  // Background
  const refbg = useRef<HTMLInputElement | null>(null);
  const [viewbg, setviewbg] = useState<string | null>(null);
  const [selectedBgFile, setSelectedBgFile] = useState<File | null>(null);
  const [bgSource, setBgSource] = useState<"preset" | "upload" | null>(null);

  // Dialog suppression
  const [open, setopen] = useState(false);

  // Règles de restriction pour le nouveau mot de passe
  const restriction: restriction[] = [
    { id: 1, text: "Au moins 8 caractères." },
    { id: 2, text: "Au moins 1 lettre minuscule." },
    { id: 3, text: "Au moins 1 lettre majuscule." },
    { id: 4, text: "Au moins 1 chiffre." },
    { id: 5, text: "Au moins 1 caractère spécial." },
  ];

  // ─── CHARGEMENT DU PROFIL ───
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await connect.get("/api/users/me");
        setUser(res.data);
        setviewPhoto(res.data.photoUser || null);
        setviewbg(res.data.chatBackgroundUrl || null);
        if (res.data.chatBackgroundUrl) {
          setvisualbackground(res.data.chatBackgroundUrl);
        }
      } catch (err) {
        toast.error("Erreur lors du chargement du profil");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [setvisualbackground]);

  // ─── HANDLERS PASSWORD ───
  const handleChangePassword = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setdatapassword({ ...datapassword, [name]: value });
    if (name === "passwordUserConfirm") {
      setshowrestriction(value.length > 0);
    }
  };

  const handleshowPass = () => {
    setshowpassword(!showpassword);
    setmodepassword(showpassword ? "password" : "text");
  };
  const handleshowPass1 = () => {
    setshowpassword1(!showpassword1);
    setmodepassword1(showpassword1 ? "password" : "text");
  };

  const checkpassword = (p: restriction) => {
    const pass = datapassword.passwordUserConfirm;
    switch (p.id) {
      case 1:
        return pass.length >= 8;
      case 2:
        return /[a-z]/.test(pass);
      case 3:
        return /[A-Z]/.test(pass);
      case 4:
        return /\d/.test(pass);
      case 5:
        return /[!@#$%^&*(),.?":{}|<>]/.test(pass);
      default:
        return false;
    }
  };

  const handlesubmitPassword = async (e: SyntheticEvent) => {
    e.preventDefault();
    try {
      await connect.put("/api/users/me/password", {
        currentPassword: datapassword.passwordUser,
        newPassword: datapassword.passwordUserConfirm,
      });
      toast.success("Mot de passe modifié avec succès");
      setdatapassword({ passwordUser: "", passwordUserConfirm: "" });
      setshowrestriction(false);
      setshowpassword(false);
      setshowpassword1(false);
    } catch (err: any) {
      toast.error(
        err.response?.data?.message ||
          "Erreur lors du changement de mot de passe",
      );
    }
  };

  // ─── HANDLERS PHOTO ───
  const handleChangePicture = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedPhotoFile(file);
      setPhotoSource("upload");
      const reader = new FileReader();
      reader.onloadend = () => {
        setviewPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectPresetAvatar = (url: string) => {
    setviewPhoto(url);
    setSelectedPhotoFile(null);
    setPhotoSource("preset");
  };

  const handlesubmitpicture = async (e: SyntheticEvent) => {
    e.preventDefault();
    try {
      if (selectedPhotoFile) {
        // Upload de fichier
        const formData = new FormData();
        formData.append("photo", selectedPhotoFile);
        const res = await connect.post("/api/users/me/photo", formData);
        // L'URL retournée est complète (grâce à la modification backend)
        setviewPhoto(res.data.photoUser);
        setUser(res.data);
      } else if (viewPhoto && photoSource === "preset") {
        // Avatar prédéfini
        await connect.put("/api/users/me", { photoUser: viewPhoto });
        const res = await connect.get("/api/users/me");
        setUser(res.data);
      } else {
        toast.error("Aucune photo sélectionnée");
        return;
      }
      toast.success("Photo mise à jour");
      // Recharger le profil
      const res = await connect.get("/api/users/me");
      setUser(res.data);
      setviewPhoto(res.data.photoUser);
      setSelectedPhotoFile(null);
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Erreur lors de l'enregistrement",
      );
    }
  };

  // ─── HANDLERS BACKGROUND ───
  const handleChangeBg = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedBgFile(file);
      setBgSource("upload");
      const reader = new FileReader();
      reader.onloadend = () => {
        setviewbg(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectPresetBackground = (url: string) => {
    setviewbg(url);
    setSelectedBgFile(null);
    setBgSource("preset");
  };

  const handlesubmitbg = async (e: SyntheticEvent) => {
    e.preventDefault();
    try {
      if (selectedBgFile) {
        // Upload de fichier
        const formData = new FormData();
        formData.append("background", selectedBgFile);
        const res = await connect.post(
          "/api/users/me/chat-background",
          formData,
        );
        setviewbg(res.data.chatBackgroundUrl);
        setvisualbackground(res.data.chatBackgroundUrl);
        setUser(res.data);
      } else if (viewbg && bgSource === "preset") {
        // Fond prédéfini
        await connect.put("/api/users/me/chat-background", {
          chatBackgroundUrl: viewbg,
        });
        setvisualbackground(viewbg);
        const res = await connect.get("/api/users/me");
        setUser(res.data);
      } else {
        toast.error("Aucun fond sélectionné");
        return;
      }
      toast.success("Fond d'écran mis à jour");
      setSelectedBgFile(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erreur");
    }
  };

  // ─── DÉCONNEXION ───
  const handleLogout = async () => {
    try {
      await connect.post("/api/auth/logout");
      setAccessToken(null);
      navigate("/");
    } catch (err) {
      toast.error("Erreur lors de la déconnexion");
    }
  };

  // ─── SUPPRESSION ───
  const handleDelete = async () => {
    try {
      await connect.delete("/api/users/me");
      await connect.post("/api/auth/logout");
      setAccessToken(null);
      navigate("/");
    } catch (err) {
      toast.error("Erreur lors de la suppression");
    }
  };

  if (loading) return <div className="loading-spinner">Chargement...</div>;

  return (
    <div className="ProfilMessage">
      <div className="ProfilMessageContact">
        <div className="ProfilParaContacttitle">
          <h1 style={{ color: "white" }}>Mes Paramètres</h1>
        </div>
        <div className="ProfilParaContactCard">
          {parametre.map((p) => (
            <div
              className={`ProfilParaContactCardPerson ${selectMenu === p.id ? "active" : ""}`}
              key={p.id}
              onClick={() => {
                setselectMenu(p.id);
                setchoiceMenu(p);
              }}
            >
              <p>{p.nom}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="ProfilMessageContent">
        {choiceMenu && (
          <div className="ProfilParaContentPerson">
            <p>{choiceMenu.nom}</p>
          </div>
        )}
        <div className="ProfilParaContentCard">
          {/* Se déconnecter */}
          {selectMenu === 1 && (
            <div>
              <h1 style={{ color: "#e8c97e" }}>
                {user?.nameUser}, Vous voulez vous déconnecter&nbsp;?
              </h1>
              <div
                style={{
                  display: "flex",
                  width: "100%",
                  justifyContent: "center",
                }}
              >
                <Button className="error" onClick={handleLogout}>
                  Se déconnecter
                </Button>
              </div>
            </div>
          )}

          {/* Changer mot de passe */}
          {selectMenu === 2 && (
            <div>
              <h1 style={{ color: "#e8c97e" }}>
                {user?.nameUser}, Vous voulez changer votre mot de passe&nbsp;?
              </h1>
              <div className="ConnexionHomeForm">
                <form onSubmit={handlesubmitPassword}>
                  <div className="ConnexionHomeFormCase">
                    <p>Mot de passe actuel</p>
                    <div className="ConnexionHomeFormCasePassword">
                      <input
                        name="passwordUser"
                        value={datapassword.passwordUser}
                        type={modepassword}
                        placeholder="Veuillez entrer votre mot de passe actuel"
                        onChange={handleChangePassword}
                      />
                      <div className="FormEyePassword">
                        <img
                          src={showpassword ? close : openeye}
                          alt=""
                          onClick={handleshowPass}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="ConnexionHomeFormCase">
                    <p>Nouveau mot de passe</p>
                    <div className="ConnexionHomeFormCasePassword">
                      <input
                        name="passwordUserConfirm"
                        type={modepassword1}
                        value={datapassword.passwordUserConfirm}
                        placeholder="Veuillez entrer votre nouveau mot de passe"
                        onChange={handleChangePassword}
                      />
                      <div className="FormEyePassword">
                        <img
                          src={showpassword1 ? close : openeye}
                          alt=""
                          onClick={handleshowPass1}
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
                      Valider
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Changer photo de profil */}
          {selectMenu === 3 && (
            <div>
              <h1 style={{ color: "#e8c97e" }}>
                {user?.nameUser}, Vous voulez changer votre photo de
                profil&nbsp;?
              </h1>
              <form onSubmit={handlesubmitpicture}>
                <div className="photoProfilCard">
                  <img src={viewPhoto || person} alt="" id="MainPicture" />
                  <img
                    src={pen}
                    alt=""
                    id="MainControl"
                    onClick={() => refimg.current?.click()}
                  />
                </div>
                <input
                  type="file"
                  ref={refimg}
                  style={{ display: "none" }}
                  onChange={handleChangePicture}
                  accept="image/*"
                />
                <p
                  style={{
                    textAlign: "center",
                    padding: "10px 0",
                    color: "white",
                  }}
                >
                  Vous pouvez choisir un des avatars ci-dessous&nbsp;:
                </p>
                <div className="avatarsPictureItem">
                  {avatarUrls.map((url, index) => (
                    <div className="avatarsPicture" key={index}>
                      <img
                        src={url}
                        alt=""
                        onClick={() => handleSelectPresetAvatar(url)}
                      />
                    </div>
                  ))}
                </div>
                <div
                  style={{
                    display: "flex",
                    width: "100%",
                    justifyContent: "center",
                    marginTop: "20px",
                  }}
                >
                  <Button className="succes" type="submit">
                    Valider
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Supprimer le compte */}
          {selectMenu === 4 && (
            <div>
              <h1 style={{ color: "#e8c97e" }}>
                {user?.nameUser}, Vous voulez supprimer votre compte&nbsp;?
              </h1>
              <div
                style={{
                  display: "flex",
                  width: "100%",
                  justifyContent: "center",
                }}
              >
                <Button className="error" onClick={() => setopen(true)}>
                  Supprimer
                </Button>
              </div>
            </div>
          )}

          {/* Changer fond d'écran */}
          {selectMenu === 5 && (
            <div>
              <h1 style={{ color: "#e8c97e" }}>
                {user?.nameUser}, Vous voulez changer le fond d'écran de votre
                messagerie&nbsp;?
              </h1>
              <form onSubmit={handlesubmitbg}>
                <div className="photoProfilCard">
                  <img src={viewbg || ""} alt="" id="MainPicture" />
                  <img
                    src={pen}
                    alt=""
                    id="MainControl"
                    onClick={() => refbg.current?.click()}
                  />
                </div>
                <input
                  type="file"
                  ref={refbg}
                  style={{ display: "none" }}
                  onChange={handleChangeBg}
                  accept="image/*"
                />
                <p
                  style={{
                    textAlign: "center",
                    padding: "10px 0",
                    color: "white",
                  }}
                >
                  Vous pouvez choisir un des fonds d'écran ci-dessous&nbsp;:
                </p>
                <div className="avatarsPictureItem">
                  {backgroundUrls.map((url, index) => (
                    <div className="avatarsPicture" key={index}>
                      <img
                        src={url}
                        alt=""
                        onClick={() => handleSelectPresetBackground(url)}
                      />
                    </div>
                  ))}
                </div>
                <div
                  style={{
                    display: "flex",
                    width: "100%",
                    justifyContent: "center",
                    marginTop: "20px",
                  }}
                >
                  <Button className="succes" type="submit">
                    Valider
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Informations sur le compte */}
          {selectMenu === 6 && (
            <div>
              <h1 style={{ color: "#e8c97e" }}>Votre compte</h1>
              <div>
                <p>
                  Nom :{" "}
                  <span style={{ color: "#e8c97e" }}>{user?.nameUser}</span>
                </p>
                <p>
                  Email :{" "}
                  <span style={{ color: "#e8c97e" }}>{user?.mailUser}</span>
                </p>
                <p>
                  Date d'adhésion :{" "}
                  <span style={{ color: "#e8c97e" }}>
                    {user?.createdAt
                      ? new Date(user.createdAt).toLocaleDateString()
                      : ""}
                  </span>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Dialog de confirmation suppression */}
      <Dialog
        open={open}
        onClose={() => setopen(false)}
        className="custom-dialog"
      >
        <DialogContent>
          <h1>{user?.nameUser}, vous confirmez votre choix&nbsp;?</h1>
          <div
            style={{
              display: "flex",
              width: "100%",
              justifyContent: "center",
              gap: "40px",
            }}
          >
            <Button className="succes" onClick={() => setopen(false)}>
              Non
            </Button>
            <Button className="error" onClick={handleDelete}>
              Oui
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Para;
