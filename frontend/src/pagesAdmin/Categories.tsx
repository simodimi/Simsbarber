import { useEffect } from "react";
import Button from "../ui/Button";
import DialogContent from "@mui/material/DialogContent";
import Dialog from "@mui/material/Dialog";
import SiderbarAdmin from "../components/SiderbarAdmin";
import { GlowCard } from "../ui/Card";
import "../styles/prestation.css";
import { useRef, useState, type ChangeEvent, type SyntheticEvent } from "react";
import pen from "../assets/icone/crayon.png";
import { toast } from "react-toastify";
import connect from "../services/Util";
interface sousCategories {
  id: number;
  categorie: string;
  nom: string;
  descriptionCourte: string;
  descriptionComplete: string;
  image: string;
  galerie: string[];
  duree: number;
  prix: number;
  ancienPrix: number;
  produitsUtilises: string;
}
interface AxiosError {
  response?: { data?: { error?: string } };
}
const Categories = () => {
  const [categorie, setcategorie] = useState<sousCategories[]>([]);
  const [categorieHead, setcategorieHead] = useState<sousCategories[]>([]);
  const [open, setopen] = useState<boolean>(false);
  const [edit, setedit] = useState<boolean>(false);
  const [textHeader, settextHeader] = useState<string>("");
  const [imageHeader, setimageHeader] = useState<string>("");
  const [selectedImageFile, setselectedImageFile] = useState<File | null>(null);
  const [selectedGalerieFiles, setselectedGalerieFiles] = useState<{
    photo1: File | null;
    photo2: File | null;
    photo3: File | null;
  }>({ photo1: null, photo2: null, photo3: null });
  const [photo, setphoto] = useState<{
    photo1: string;
    photo2: string;
    photo3: string;
  }>({
    photo1: "",
    photo2: "",
    photo3: "",
  });
  const refimage = useRef<HTMLInputElement | null>(null);
  const refphoto1 = useRef<HTMLInputElement | null>(null);
  const refphoto2 = useRef<HTMLInputElement | null>(null);
  const refphoto3 = useRef<HTMLInputElement | null>(null);
  const [lengthcategorie, setlengthcategorie] = useState<number>(0);
  const [lengthdescribe, setlengthdescribe] = useState<number>(0);
  const [removeImage, setRemoveImage] = useState(false);
  const [removeGalerie, setRemoveGalerie] = useState({
    photo1: false,
    photo2: false,
    photo3: false,
  });
  const [lengthdescriptionComplete, setlengthdescriptionComplete] =
    useState<number>(0);
  const [dataForm, setdataForm] = useState<sousCategories>({
    id: Date.now(),
    categorie: "",
    image: "",
    nom: "",
    descriptionCourte: "",
    descriptionComplete: "",
    galerie: ["", "", ""],
    duree: 0,
    prix: 0,
    ancienPrix: 0,
    produitsUtilises: "",
  });
  const fetchCategories = async () => {
    try {
      const data = await connect.get("/api/categories");
      const adapte = data.data.map(
        (c: {
          id: number;
          nom: string;
          image: string;
          description: string;
        }) => ({
          id: c.id,
          categorie: c.nom,
          image: c.image,
          description: c.description,
        }),
      );
      setcategorie(adapte);
    } catch (error) {
      toast.error("Impossible de charger les catégories");
    }
  };
  const fetchPrestations = async () => {
    try {
      const res = await connect.get("/api/prestations");
      const adapte = res.data.map(
        (p: {
          id: number;
          nom: string;
          descriptionCourte: string;
          descriptionComplete: string;
          image: string;
          galerie: string[] | null;
          duree: number;
          prix: number;
          ancienPrix: number | null;
          produitsUtilises: string | "";
          category?: { nom: string };
        }) => ({
          id: p.id,
          categorie: p.category?.nom || "",
          nom: p.nom,
          descriptionCourte: p.descriptionCourte,
          descriptionComplete: p.descriptionComplete,
          image: p.image,
          galerie: p.galerie || ["", "", ""],
          duree: p.duree,
          prix: p.prix,
          ancienPrix: p.ancienPrix || 0,
          produitsUtilises: p.produitsUtilises,
        }),
      );
      setcategorieHead(adapte);
    } catch (error) {
      toast.error("Impossible de charger les prestations");
    }
  };
  useEffect(() => {
    fetchCategories();
    fetchPrestations();
  }, []);
  const format = [...new Set(categorie.flatMap((p) => p.categorie))];
  const filter = format.map((p) => ({
    categories: p,
    menber: categorieHead.filter((cap) => cap.categorie.includes(p)),
  }));

  const handleOpen = (p: string) => {
    setopen(true);
    settextHeader(p);
  };
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setdataForm({ ...dataForm, [name]: value });
    if (name === "nom") {
      setlengthcategorie(value.length);
    }
    if (name === "descriptionCourte") {
      setlengthdescribe(value.length);
    }
    if (name === "descriptionComplete") {
      setlengthdescriptionComplete(value.length);
    }
  };
  const handleChangePicture = (e: ChangeEvent<HTMLInputElement>) => {
    const { name } = e.target;

    const file = e.target.files?.[0];
    if (!file) {
      return;
    }
    const reader = new FileReader();
    if (name === "image") {
      setselectedImageFile(file);
      reader.onloadend = () => setimageHeader(reader.result as string);
      reader.readAsDataURL(file);
      setRemoveImage(false);
    }
    // pour photo1 :
    if (name === "photo1") {
      setselectedGalerieFiles((prev) => ({ ...prev, photo1: file }));
      reader.onloadend = () =>
        setphoto((prev) => ({ ...prev, photo1: reader.result as string }));
      reader.readAsDataURL(file);
      setRemoveGalerie((prev) => ({ ...prev, photo1: false }));
    }
    // pour photo2 :
    if (name === "photo2") {
      setselectedGalerieFiles((prev) => ({ ...prev, photo2: file }));
      reader.onloadend = () =>
        setphoto((prev) => ({ ...prev, photo2: reader.result as string }));
      reader.readAsDataURL(file);
      setRemoveGalerie((prev) => ({ ...prev, photo2: false }));
    }
    // pour photo3 :
    if (name === "photo3") {
      setselectedGalerieFiles((prev) => ({ ...prev, photo3: file }));
      reader.onloadend = () =>
        setphoto((prev) => ({ ...prev, photo3: reader.result as string }));
      reader.readAsDataURL(file);
      setRemoveGalerie((prev) => ({ ...prev, photo3: false }));
    }
  };
  const resetForm = () => {
    setdataForm({
      id: 0,
      categorie: "",
      image: "",
      nom: "",
      descriptionCourte: "",
      descriptionComplete: "",
      galerie: ["", "", ""],
      duree: 0,
      prix: 0,
      ancienPrix: 0,
      produitsUtilises: "",
    });
    setimageHeader("");
    setphoto({ photo1: "", photo2: "", photo3: "" });
    setselectedImageFile(null);
    setselectedGalerieFiles({ photo1: null, photo2: null, photo3: null });
    setlengthcategorie(0);
    setlengthdescribe(0);
    setlengthdescriptionComplete(0);
    setRemoveImage(false);
    setRemoveGalerie({ photo1: false, photo2: false, photo3: false });
  };
  const handlesubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (
      dataForm.nom.trim() === "" ||
      dataForm.descriptionCourte.trim() === "" ||
      !dataForm.prix ||
      (!edit && !selectedImageFile) ||
      dataForm.descriptionComplete.trim() === ""
    ) {
      toast.error("veuillez remplir tous les champs");
      return;
    }
    const categoryMatch = categorie.find((c) => c.categorie === textHeader);
    if (!categoryMatch) {
      toast.error("Catégorie introuvable, veuillez rafraîchir la page");
      return;
    }

    const formData = new FormData();
    formData.append("categoryId", String(categoryMatch.id));
    formData.append("nom", dataForm.nom);
    formData.append("descriptionCourte", dataForm.descriptionCourte);
    formData.append("descriptionComplete", dataForm.descriptionComplete);
    formData.append("duree", String(dataForm.duree));
    formData.append("prix", String(dataForm.prix));
    formData.append("ancienPrix", String(dataForm.ancienPrix || 0));
    formData.append("produitsUtilises", dataForm.produitsUtilises);
    if (selectedImageFile) formData.append("image", selectedImageFile);

    if (selectedGalerieFiles.photo1)
      formData.append("galerie1", selectedGalerieFiles.photo1);
    if (selectedGalerieFiles.photo2)
      formData.append("galerie2", selectedGalerieFiles.photo2);
    if (selectedGalerieFiles.photo3)
      formData.append("galerie3", selectedGalerieFiles.photo3);

    if (removeImage && !selectedImageFile)
      formData.append("removeImage", "true");
    if (removeGalerie.photo1 && !selectedGalerieFiles.photo1)
      formData.append("removeGalerie1", "true");
    if (removeGalerie.photo2 && !selectedGalerieFiles.photo2)
      formData.append("removeGalerie2", "true");
    if (removeGalerie.photo3 && !selectedGalerieFiles.photo3)
      formData.append("removeGalerie3", "true");
    try {
      if (edit) {
        await connect.put(`/api/prestations/${dataForm.id}`, formData);
        toast.success(`Prestation "${dataForm.nom}" modifiée avec succès`);
      } else {
        await connect.post("/api/prestations", formData);
        toast.success(`Prestation "${dataForm.nom}" créée avec succès`);
      }
      await fetchPrestations();
    } catch (error) {
      const err = error as AxiosError;
      toast.error(err.response?.data?.error || "Une erreur s'est produite.");
      return;
    }

    setedit(false);
    resetForm();
    setopen(false);
  };
  const handleclose = () => {
    if (edit === false) {
      resetForm();
    }
    setopen(false);
  };
  const handleopen = (p: sousCategories) => {
    setRemoveImage(false);
    setRemoveGalerie({ photo1: false, photo2: false, photo3: false });
    setopen(true);
    settextHeader(p.categorie);
    setdataForm({
      ...dataForm,
      id: p.id,
      nom: p.nom,
      descriptionCourte: p.descriptionCourte,
      prix: p.prix,
      categorie: p.categorie,
      descriptionComplete: p.descriptionComplete,
      galerie: p.galerie,
      duree: p.duree,
      ancienPrix: p.ancienPrix,
      produitsUtilises: p.produitsUtilises,
    });
    const imageUrl = p.image ? `http://localhost:5000${p.image}` : "";
    setimageHeader(imageUrl);
    setphoto({
      photo1: p.galerie[0] ? `http://localhost:5000${p.galerie[0]}` : "",
      photo2: p.galerie[1] ? `http://localhost:5000${p.galerie[1]}` : "",
      photo3: p.galerie[2] ? `http://localhost:5000${p.galerie[2]}` : "",
    });
    setselectedImageFile(null);
    setselectedGalerieFiles({ photo1: null, photo2: null, photo3: null });
    setlengthcategorie(p.nom.length);
    setlengthdescribe(p.descriptionCourte.length);
    setlengthdescriptionComplete(p.descriptionComplete.length);
    setedit(true);
  };
  const handledelete = async (id: number) => {
    try {
      await connect.delete(`/api/prestations/${id}`);
      toast.success("Prestation supprimée");
      await fetchPrestations();
    } catch (error) {
      const err = error as AxiosError;
      toast.error(err.response?.data?.error || "Une erreur s'est produite.");
      return;
    }
    setopen(false);
    setedit(false);
    resetForm();
  };
  return (
    <div className="AccueilHeader">
      <div className="AccueilHome">
        <SiderbarAdmin />
      </div>
      <div className="AccueilPrestations">
        <div className="AccueilPrestationsTitle">
          <h2>Nos catégories</h2>
        </div>

        {categorie.length > 0 ? (
          <div className="">
            {filter.map(({ categories, menber }) => (
              <div
                className=""
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "40px",
                }}
              >
                <div className="CatHeader">
                  <p>
                    Catégorie :{" "}
                    <span
                      style={{ color: "#e8c97e", textTransform: "capitalize" }}
                    >
                      {categories}
                    </span>{" "}
                  </p>
                  <Button
                    className="glow"
                    onClick={() => handleOpen(categories)}
                  >
                    Ajouter une catégorie
                  </Button>
                </div>
                <div className="AccueilPrestationsCards">
                  {menber.map((p) => (
                    <div
                      className="AccueilPrestationsCardLists"
                      key={p.id}
                      style={{ cursor: "pointer" }}
                      onClick={() => handleopen(p)}
                    >
                      <GlowCard
                        padding="20px 0px"
                        customSize
                        width="100%"
                        height="100%"
                        className="w-full"
                      >
                        <img src={`http://localhost:5000${p.image}`} alt="" />
                        <p id="CategorieTitle">{p.nom}</p>
                        <div className="" id="CategorieDescription">
                          <p>{p.descriptionCourte}</p>
                          <p>{p.prix} €</p>
                        </div>

                        <Button className="glow">
                          Choisir cette prestation
                        </Button>
                      </GlowCard>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="NoCategorie">
            <p>Aucune catégorie pour le moment!</p>
          </div>
        )}
      </div>
      {open && (
        <Dialog
          open={open}
          onClose={() => setopen(false)}
          className="custom-dialog"
          maxWidth="md"
          fullWidth
        >
          <DialogContent>
            <div className="categoriesFormHeader">
              <form onSubmit={handlesubmit}>
                <h3>{textHeader}</h3>
                <div className="categoriesFormHeaderCard">
                  <p>Ajouter une image :</p>
                  <div className="categoriesFormHeaderCardImage">
                    <div className="categoriesFormHeaderCardImageSelect">
                      {imageHeader && (
                        <img
                          src={imageHeader}
                          alt=""
                          id="categoriesFormHeaderCardImageSelect"
                        />
                      )}
                      <span>
                        <img
                          src={pen}
                          alt=""
                          onClick={() => refimage.current?.click()}
                        />
                      </span>
                    </div>
                    <input
                      type="file"
                      name="image"
                      id=""
                      style={{ display: "none" }}
                      accept="image/*"
                      ref={refimage}
                      onChange={handleChangePicture}
                    />
                  </div>
                </div>
                <div className="categoriesFormHeaderCard">
                  <p>Saisir un nom de {textHeader} :</p>
                  <div className="categoriesFormHeaderCardCompteur">
                    <input
                      name="nom"
                      type="text"
                      spellCheck
                      value={dataForm.nom}
                      onChange={handleChange}
                      maxLength={25}
                    />
                    <span>{lengthcategorie}/25</span>
                  </div>
                </div>
                <div className="categoriesFormHeaderCard">
                  <p>Saisir une courte description :</p>
                  <div className="categoriesFormTextAreaCompteur">
                    <textarea
                      name="descriptionCourte"
                      id=""
                      spellCheck
                      value={dataForm.descriptionCourte}
                      onChange={handleChange}
                      maxLength={150}
                    />
                    <span>{lengthdescribe}/150</span>
                  </div>
                </div>
                <div className="categoriesFormHeaderCard">
                  <p>Saisir un prix :</p>
                  <div className="categoriesFormHeaderCardCompteur">
                    <input
                      name="prix"
                      type="number"
                      value={dataForm.prix}
                      onChange={handleChange}
                      min={1}
                    />
                  </div>
                </div>
                <div className="categoriesFormHeaderCard">
                  <p>Saisir la durée en minutes :</p>
                  <div className="categoriesFormHeaderCardCompteur">
                    <input
                      name="duree"
                      type="number"
                      value={dataForm.duree}
                      onChange={handleChange}
                      min={1}
                    />
                  </div>
                </div>
                <div className="categoriesFormHeaderCard">
                  <p>Saisir l'ancien prix :</p>
                  <div className="categoriesFormHeaderCardCompteur">
                    <input
                      name="ancienPrix"
                      type="number"
                      value={dataForm.ancienPrix}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="categoriesFormHeaderCard">
                  <p>Saisir une description :</p>
                  <div className="categoriesFormTextAreaCompteur">
                    <textarea
                      name="descriptionComplete"
                      id=""
                      spellCheck
                      value={dataForm.descriptionComplete}
                      onChange={handleChange}
                      maxLength={250}
                    />
                    <span>{lengthdescriptionComplete}/250</span>
                  </div>
                </div>
                <div className="categoriesFormHeaderCard">
                  <p>Saisir les produits utilisés :</p>
                  <div className="categoriesFormHeaderCardCompteur">
                    <input
                      name="produitsUtilises"
                      type="text"
                      value={dataForm.produitsUtilises}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="categoriesFormHeaderCard">
                  <p>Ajouter d'autres images (facultatif) :</p>
                  <div className="" style={{ display: "flex" }}>
                    <div className="categoriesFormHeaderCardImage">
                      <div className="categoriesFormHeaderCardImageSelect">
                        {photo.photo1 && (
                          <img
                            src={photo.photo1}
                            alt=""
                            id="categoriesFormHeaderCardImageSelect"
                          />
                        )}
                        <span>
                          <img
                            src={pen}
                            alt=""
                            onClick={() => refphoto1.current?.click()}
                          />
                        </span>
                        {photo.photo1 && (
                          <p
                            style={{
                              cursor: "pointer",
                              fontSize: "30px",
                              color: "red",
                              fontWeight: "bold",
                              position: "absolute",
                              margin: 0,
                              top: "5px",
                              right: "30px",
                            }}
                            onClick={() => {
                              setphoto((prev) => ({ ...prev, photo1: "" }));
                              setselectedGalerieFiles((prev) => ({
                                ...prev,
                                photo1: null,
                              }));
                              setRemoveGalerie((prev) => ({
                                ...prev,
                                photo1: true,
                              }));
                            }}
                          >
                            ❌
                          </p>
                        )}
                      </div>
                      <input
                        type="file"
                        name="photo1"
                        id=""
                        style={{ display: "none" }}
                        accept="image/*"
                        ref={refphoto1}
                        onChange={handleChangePicture}
                      />
                    </div>
                    <div className="categoriesFormHeaderCardImage">
                      <div className="categoriesFormHeaderCardImageSelect">
                        {photo.photo2 && (
                          <img
                            src={photo.photo2}
                            alt=""
                            id="categoriesFormHeaderCardImageSelect"
                          />
                        )}
                        <span>
                          <img
                            src={pen}
                            alt=""
                            onClick={() => refphoto2.current?.click()}
                          />
                        </span>
                        {photo.photo2 && (
                          <p
                            style={{
                              cursor: "pointer",
                              fontSize: "30px",
                              color: "red",
                              fontWeight: "bold",
                              position: "absolute",
                              margin: 0,
                              top: "5px",
                              right: "30px",
                            }}
                            onClick={() => {
                              setphoto((prev) => ({ ...prev, photo2: "" }));
                              setselectedGalerieFiles((prev) => ({
                                ...prev,
                                photo2: null,
                              }));
                              setRemoveGalerie((prev) => ({
                                ...prev,
                                photo2: true,
                              }));
                            }}
                          >
                            ❌
                          </p>
                        )}
                      </div>
                      <input
                        type="file"
                        name="photo2"
                        id=""
                        style={{ display: "none" }}
                        accept="image/*"
                        ref={refphoto2}
                        onChange={handleChangePicture}
                      />
                    </div>
                    <div className="categoriesFormHeaderCardImage">
                      <div className="categoriesFormHeaderCardImageSelect">
                        {photo.photo3 && (
                          <img
                            src={photo.photo3}
                            alt=""
                            id="categoriesFormHeaderCardImageSelect"
                          />
                        )}
                        <span>
                          <img
                            src={pen}
                            alt=""
                            onClick={() => refphoto3.current?.click()}
                          />
                        </span>
                        {photo.photo3 && (
                          <p
                            style={{
                              cursor: "pointer",
                              fontSize: "30px",
                              color: "red",
                              fontWeight: "bold",
                              position: "absolute",
                              margin: 0,
                              top: "5px",
                              right: "30px",
                            }}
                            onClick={() => {
                              setphoto((prev) => ({ ...prev, photo3: "" }));
                              setselectedGalerieFiles((prev) => ({
                                ...prev,
                                photo3: null,
                              }));
                              setRemoveGalerie((prev) => ({
                                ...prev,
                                photo3: true,
                              }));
                            }}
                          >
                            ❌
                          </p>
                        )}
                      </div>
                      <input
                        type="file"
                        name="photo3"
                        id=""
                        style={{ display: "none" }}
                        accept="image/*"
                        ref={refphoto3}
                        onChange={handleChangePicture}
                      />
                    </div>
                  </div>
                </div>

                <div className="categoriesButton">
                  <Button className="warning" onClick={handleclose}>
                    Fermer
                  </Button>

                  {edit && (
                    <Button
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

export default Categories;
