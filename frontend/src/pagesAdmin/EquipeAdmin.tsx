import SiderbarAdmin from "../components/SiderbarAdmin";
import Button from "../ui/Button";
import { GlowCard } from "../ui/Card";
import "../styles/prestation.css";

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type SyntheticEvent,
} from "react";

import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";

import pen from "../assets/icone/crayon.png";
import { toast } from "react-toastify";
import connect from "../services/Util";

interface Categories {
  id: number;
  nameEquipe: string;
  categoriesEquipe: string[];
  imageEquipe: string;
  descriptionEquipe: string;
  experienceEquipe: string;
  citationEquipe: string;
}

const EquipeAdmin = () => {
  // ÉTATS
  const [categorie, setCategorie] = useState<Categories[]>([]);
  const [open, setOpen] = useState<boolean>(false);
  const [edit, setEdit] = useState<boolean>(false);

  // Image affichée dans la prévisualisation
  const [imageHeader, setImageHeader] = useState<string>("");

  // Vrai fichier sélectionné par l'utilisateur
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Référence vers le input file caché
  const refImage = useRef<HTMLInputElement | null>(null);

  // FORMULAIRE
  const [dataForm, setDataForm] = useState<Categories>({
    id: Date.now(),
    nameEquipe: "",
    categoriesEquipe: [],
    imageEquipe: "",
    descriptionEquipe: "",
    experienceEquipe: "",
    citationEquipe: "",
  });

  // Pour le champ texte des catégories (saisie utilisateur)
  const [categoriesInput, setCategoriesInput] = useState<string>("");

  // COMPTEURS
  const [lengthCategorie, setLengthCategorie] = useState<number>(0);
  const [lengthDescribe, setLengthDescribe] = useState<number>(0);
  const [lengthCitation, setLengthCitation] = useState<number>(0);
  const [lengthExperience, setLengthExperience] = useState<number>(0);
  const [lengthName, setLengthName] = useState<number>(0);

  // RÉCUPÉRER L'ÉQUIPE DEPUIS LE BACKEND
  const fetchEquipe = async () => {
    try {
      const res = await connect.get("/api/team");

      const adapte: Categories[] = res.data.map((m: any) => ({
        id: m.id,
        nameEquipe: m.nom,
        categoriesEquipe: m.categories || [],
        imageEquipe: m.photo ? `http://localhost:5000${m.photo}` : "",
        descriptionEquipe: m.description,
        experienceEquipe: m.experience,
        citationEquipe: m.citation,
      }));

      setCategorie(adapte);
    } catch (error) {
      console.error("Erreur récupération équipe :", error);
      toast.error("Impossible de récupérer les membres de l'équipe.");
    }
  };

  useEffect(() => {
    fetchEquipe();
  }, []);

  // MODIFICATION DES CHAMPS
  const handleChange = (
    e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
  ) => {
    const { name, value } = e.target;

    // Gestion spéciale pour les catégories (champ texte)
    if (name === "categoriesEquipe") {
      setCategoriesInput(value);
      setLengthCategorie(value.length);

      // Conversion en tableau pour l'interface
      const categoriesArray = value
        .split(",")
        .map((cat) => cat.trim())
        .filter(Boolean);

      setDataForm((prev) => ({
        ...prev,
        categoriesEquipe: categoriesArray,
      }));
      return;
    }

    setDataForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Compteurs
    if (name === "descriptionEquipe") {
      setLengthDescribe(value.length);
    }
    if (name === "nameEquipe") {
      setLengthName(value.length);
    }
    if (name === "experienceEquipe") {
      setLengthExperience(value.length);
    }
    if (name === "citationEquipe") {
      setLengthCitation(value.length);
    }
  };

  // GESTION DE L'IMAGE
  const handleChangeImage = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    // Vérification du type
    if (!file.type.startsWith("image/")) {
      toast.error("Veuillez sélectionner une image.");
      return;
    }

    // Vérification de la taille : 5 Mo maximum
    if (file.size > 5 * 1024 * 1024) {
      toast.error("L'image ne doit pas dépasser 5 Mo.");
      return;
    }

    // On conserve le vrai fichier
    setSelectedFile(file);

    // FileReader uniquement pour afficher une prévisualisation
    const reader = new FileReader();

    reader.onloadend = () => {
      const image = reader.result as string;
      setImageHeader(image);
      setDataForm((prev) => ({
        ...prev,
        imageEquipe: image,
      }));
    };

    reader.readAsDataURL(file);
  };

  // VALIDATION DU FORMULAIRE
  const handlesubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (
      dataForm.categoriesEquipe.length === 0 ||
      dataForm.descriptionEquipe.trim() === "" ||
      dataForm.experienceEquipe.trim() === "" ||
      dataForm.citationEquipe.trim() === "" ||
      dataForm.nameEquipe.trim() === ""
    ) {
      toast.error("Veuillez remplir tous les champs du formulaire.");
      return;
    }

    // Pour une création, l'image est obligatoire.
    if (!edit && !selectedFile) {
      toast.error("Veuillez ajouter une image.");
      return;
    }

    const formData = new FormData();

    formData.append("nom", dataForm.nameEquipe);
    formData.append("prenom", "");
    formData.append("titre", dataForm.categoriesEquipe[0] || "");
    formData.append("categories", JSON.stringify(dataForm.categoriesEquipe));
    formData.append("description", dataForm.descriptionEquipe);
    formData.append("experience", dataForm.experienceEquipe);
    formData.append("citation", dataForm.citationEquipe);

    if (selectedFile) {
      formData.append("photo", selectedFile);
    }

    try {
      if (edit) {
        await connect.put(`/api/team/${dataForm.id}`, formData);
        toast.success("Équipier modifié avec succès.");
      } else {
        await connect.post("/api/team", formData);
        toast.success("Équipier créé avec succès.");
      }

      await fetchEquipe();
      resetForm();
    } catch (error: any) {
      console.error("Erreur création/modification équipier :", error);
      toast.error(error?.response?.data?.error || "Une erreur s'est produite.");
    }
  };

  const resetForm = () => {
    setDataForm({
      id: Date.now(),
      nameEquipe: "",
      categoriesEquipe: [],
      imageEquipe: "",
      descriptionEquipe: "",
      experienceEquipe: "",
      citationEquipe: "",
    });
    setCategoriesInput("");
    setImageHeader("");
    setSelectedFile(null);
    setLengthCategorie(0);
    setLengthDescribe(0);
    setLengthName(0);
    setLengthExperience(0);
    setLengthCitation(0);
    setEdit(false);
    setOpen(false);

    if (refImage.current) {
      refImage.current.value = "";
    }
  };

  const handleclose = () => {
    resetForm();
  };

  const handleOpen = (p: Categories) => {
    setOpen(true);
    setEdit(true);

    setDataForm({
      id: p.id,
      nameEquipe: p.nameEquipe,
      categoriesEquipe: p.categoriesEquipe,
      imageEquipe: p.imageEquipe,
      descriptionEquipe: p.descriptionEquipe,
      experienceEquipe: p.experienceEquipe,
      citationEquipe: p.citationEquipe,
    });

    // Convertir le tableau en texte pour l'affichage
    setCategoriesInput(p.categoriesEquipe.join(", "));

    // Afficher l'image existante
    setImageHeader(p.imageEquipe);
    setSelectedFile(null);

    // Compteurs
    setLengthCategorie(p.categoriesEquipe.join(", ").length);
    setLengthDescribe(p.descriptionEquipe.length);
    setLengthName(p.nameEquipe.length);
    setLengthExperience(p.experienceEquipe.length);
    setLengthCitation(p.citationEquipe.length);
  };

  const handledelete = async (id: number) => {
    try {
      await connect.delete(`/api/team/${id}`);
      toast.success("Équipier supprimé.");
      resetForm();
      await fetchEquipe();
    } catch (error: any) {
      console.error("Erreur suppression :", error);
      toast.error(
        error?.response?.data?.error || "Impossible de supprimer cet équipier.",
      );
    }
  };

  const handleOpens = () => {
    setOpen(true);
    setEdit(false);
    setDataForm({
      id: Date.now(),
      nameEquipe: "",
      categoriesEquipe: [],
      imageEquipe: "",
      descriptionEquipe: "",
      experienceEquipe: "",
      citationEquipe: "",
    });
    setCategoriesInput("");
    setImageHeader("");
    setSelectedFile(null);
    setLengthCategorie(0);
    setLengthDescribe(0);
    setLengthName(0);
    setLengthExperience(0);
    setLengthCitation(0);

    if (refImage.current) {
      refImage.current.value = "";
    }
  };

  const format = [
    ...new Set(categorie.flatMap((personne) => personne.categoriesEquipe)),
  ];

  const filter = format.map((titre) => ({
    titre,
    menber: categorie.filter((personne) =>
      personne.categoriesEquipe.includes(titre),
    ),
  }));

  return (
    <div className="AccueilHeaderAdmin">
      <div className="AccueilHome">
        <SiderbarAdmin />
      </div>

      <div className="AccueilPrestations">
        <div className="AccueilPrestationsTitle">
          <h2>Notre équipe</h2>
        </div>

        <div className="prestationAdd">
          <Button className="glow" onClick={handleOpens}>
            Ajouter un(e) équipier(e)
          </Button>
        </div>

        {categorie.length > 0 ? (
          <div>
            {/* ✅ UNIQUEMENT LE NOUVEAU SYSTÈME DE FILTRE */}
            {filter.map(({ titre, menber }) => (
              <div
                key={titre}
                style={{
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div className="CatHeader">
                  <p
                    style={{
                      textAlign: "center",
                      fontWeight: "700",
                      fontSize: "24px",
                      margin: "0",
                      fontFamily: "var(--police1)",
                    }}
                  >
                    {titre.toUpperCase()}
                  </p>
                </div>

                <div className="AccueilPrestationsCards">
                  {menber.map((p) => (
                    <div
                      className="AccueilPrestationsCardLists"
                      key={p.id}
                      onClick={() => handleOpen(p)}
                      style={{
                        cursor: "pointer",
                      }}
                    >
                      <GlowCard
                        padding="20px 0px"
                        customSize
                        width="100%"
                        height="100%"
                        className="w-full"
                      >
                        <img src={p.imageEquipe} alt={p.nameEquipe} />
                        <p id="TeamCardMenberStyle">{p.nameEquipe}</p>
                        <p id="TeamCardMenberStyle">{p.descriptionEquipe}</p>
                        <p id="TeamCardMenberStyle">{p.experienceEquipe}</p>
                        <p id="TeamCardMenberStyle">{p.citationEquipe}</p>
                        <Button className="glow">Choisir l'équipier(e)</Button>
                      </GlowCard>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="NoCategorie">
            <p>Aucun équipier pour le moment !</p>
          </div>
        )}
      </div>

      {open && (
        <Dialog
          open={open}
          onClose={handleclose}
          className="custom-dialog"
          maxWidth="md"
          fullWidth
        >
          <DialogContent>
            <div className="categoriesFormHeader">
              <form onSubmit={handlesubmit}>
                {/* IMAGE */}
                <div className="categoriesFormHeaderCard">
                  <p>Ajouter une image :</p>

                  <div className="categoriesFormHeaderCardImage">
                    <div className="categoriesFormHeaderCardImageSelect">
                      {imageHeader && (
                        <img
                          src={imageHeader}
                          alt="Prévisualisation"
                          id="categoriesFormHeaderCardImageSelect"
                        />
                      )}

                      <span>
                        <img
                          src={pen}
                          alt="Modifier l'image"
                          onClick={() => refImage.current?.click()}
                        />
                      </span>
                    </div>

                    <input
                      type="file"
                      name="imageEquipe"
                      style={{
                        display: "none",
                      }}
                      onChange={handleChangeImage}
                      accept="image/*"
                      ref={refImage}
                    />
                  </div>
                </div>

                {/* CATÉGORIES */}
                <div className="categoriesFormHeaderCard">
                  <p>Saisir les catégories (séparées par des virgules) :</p>

                  <div className="categoriesFormHeaderCardCompteur">
                    <input
                      maxLength={50}
                      name="categoriesEquipe"
                      type="text"
                      spellCheck
                      placeholder="ex: coupe, barbe, coloration"
                      value={categoriesInput}
                      onChange={handleChange}
                    />

                    <span>{lengthCategorie}/50</span>
                  </div>
                  {dataForm.categoriesEquipe.length > 0 && (
                    <small style={{ color: "#666", marginTop: "5px" }}>
                      Catégories: {dataForm.categoriesEquipe.join(", ")}
                    </small>
                  )}
                </div>

                {/* NOM */}
                <div className="categoriesFormHeaderCard">
                  <p>Saisir un nom :</p>

                  <div className="categoriesFormHeaderCardCompteur">
                    <input
                      maxLength={25}
                      name="nameEquipe"
                      type="text"
                      spellCheck
                      value={dataForm.nameEquipe}
                      onChange={handleChange}
                    />

                    <span>{lengthName}/25</span>
                  </div>
                </div>

                {/* DESCRIPTION */}
                <div className="categoriesFormHeaderCard">
                  <p>Saisir une description de votre équipier(e) :</p>

                  <div className="categoriesFormTextAreaCompteur">
                    <textarea
                      name="descriptionEquipe"
                      spellCheck
                      value={dataForm.descriptionEquipe}
                      onChange={handleChange}
                      maxLength={150}
                    />

                    <span>{lengthDescribe}/150</span>
                  </div>
                </div>

                {/* CITATION */}
                <div className="categoriesFormHeaderCard">
                  <p>Saisir une citation de votre équipier(e) :</p>

                  <div className="categoriesFormTextAreaCompteur">
                    <textarea
                      name="citationEquipe"
                      spellCheck
                      value={dataForm.citationEquipe}
                      onChange={handleChange}
                      maxLength={150}
                    />

                    <span>{lengthCitation}/150</span>
                  </div>
                </div>

                {/* EXPÉRIENCE */}
                <div className="categoriesFormHeaderCard">
                  <p>Saisir une expérience de votre équipier(e) :</p>

                  <div className="categoriesFormTextAreaCompteur">
                    <textarea
                      name="experienceEquipe"
                      spellCheck
                      value={dataForm.experienceEquipe}
                      onChange={handleChange}
                      maxLength={150}
                    />

                    <span>{lengthExperience}/150</span>
                  </div>
                </div>

                {/* BOUTONS */}
                <div className="categoriesButton">
                  <Button
                    type="button"
                    className="warning"
                    onClick={handleclose}
                  >
                    Fermer
                  </Button>

                  {edit && (
                    <Button
                      type="button"
                      className="error"
                      onClick={() => handledelete(dataForm.id)}
                    >
                      Supprimer
                    </Button>
                  )}

                  <Button type="submit" className="succes">
                    Valider
                  </Button>
                </div>
              </form>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default EquipeAdmin;
