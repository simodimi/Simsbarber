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

interface categories {
  id: number;
  categorie: string;
  image: string;
  description: string;
}
interface AxiosError {
  response?: { data?: { error?: string } };
}
const PrestationAdmin = () => {
  const [categorie, setcategorie] = useState<categories[]>([]);
  const [open, setopen] = useState<boolean>(false);
  const [edit, setedit] = useState<boolean>(false);
  const [imageHeader, setimageHeader] = useState<string>("");
  const [selectedFile, setselectedFile] = useState<File | null>(null);
  const refimage = useRef<HTMLInputElement | null>(null);

  const [dataForm, setdataForm] = useState<categories>({
    id: Date.now(),
    categorie: "",
    image: "",
    description: "",
  });
  const [lengthcategorie, setlengthcategorie] = useState<number>(0);
  const [lengthdescribe, setlengthdescribe] = useState<number>(0);

  const handleChange = (
    e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
  ) => {
    const { name, value } = e.target;
    setdataForm({ ...dataForm, [name]: value });
    if (name === "categorie") {
      setlengthcategorie(value.length);
    }
    if (name === "description") {
      setlengthdescribe(value.length);
    }
  };
  /* useEffect(() => {
    const data = Storage.getItem("categories");

    if (data) {
      setcategorie(JSON.parse(data));
    }
  }, []);*/
  const fetchCategories = async () => {
    try {
      const res = await connect.get("/api/categories");
      // Le backend renvoie { id, nom, image, description } — on adapte
      // vers votre forme locale { id, categorie, image, description }.
      const adapte = res.data.map(
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

  useEffect(() => {
    fetchCategories();
  }, []);
  const handleChangeImage = (e: ChangeEvent<HTMLInputElement>) => {
    const { name } = e.target;
    if (name === "image") {
      const file = e.target.files?.[0];
      if (!file) {
        return;
      }
      setselectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        const image = reader.result as string;
        setimageHeader(image);
        setdataForm((prev) => ({
          ...prev,
          image: image,
        }));
      };
      reader.readAsDataURL(file);
    }
  };
  /* const handlesubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (
      dataForm.categorie.trim() === "" ||
      dataForm.description.trim() === "" ||
      dataForm.image === ""
    ) {
      toast.error("Veuillez remplir tous les champs du formulaire");
      return;
    }
    const formData = new FormData();
    formData.append("nom", dataForm.categorie);
    formData.append("description", dataForm.description);
    if (selectedFile) {
      formData.append("image", selectedFile);
    }
    // if (edit) {
  
        const update = categorie.map((p) =>
          p.id === dataForm.id
            ? {
                ...p,
                categorie: dataForm.categorie,
                image: dataForm.image,
                description: dataForm.description,
              }
            : p,
        );
    
    } else {
      const newdata: categories = {
        id: Date.now(),
        categorie: dataForm.categorie,
        image: dataForm.image,
        description: dataForm.description,
      };
      const update = [...categorie, newdata];
      setcategorie(update);
      localStorage.setItem("categories", JSON.stringify(update));
    }//
    try {
      if (edit) {
        await connect.put(`/api/categories/${dataForm.id}`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        toast.success(`Catégorie "${dataForm.categorie}" modifiée avec succès`);
      } else {
        await connect.post("/api/categories", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        toast.success(`Catégorie "${dataForm.categorie}" créée avec succès`);
      }
      await fetchCategories();
    } catch (error) {
      const err = error as AxiosError;
      toast.error(err.response?.data?.error || "Une erreur s'est produite.");
      return;
    }

    setedit(false);
    setdataForm({ id: 0, categorie: "", image: "", description: "" });
    setimageHeader("");
    setselectedFile(null);
    setlengthcategorie(0);
    setlengthdescribe(0);
    setopen(false);
  };*/
  const handlesubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();

    // On supprime les espaces au début et à la fin
    const categorieNettoyee = dataForm.categorie.trim();
    const descriptionNettoyee = dataForm.description.trim();

    // Vérification après nettoyage
    if (
      categorieNettoyee === "" ||
      descriptionNettoyee === "" ||
      dataForm.image === ""
    ) {
      toast.error("Veuillez remplir tous les champs du formulaire");
      return;
    }

    const formData = new FormData();

    // On envoie les valeurs nettoyées au backend
    formData.append("nom", categorieNettoyee);
    formData.append("description", descriptionNettoyee);

    if (selectedFile) {
      formData.append("image", selectedFile);
    }

    try {
      if (edit) {
        await connect.put(`/api/categories/${dataForm.id}`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        toast.success(`Catégorie "${categorieNettoyee}" modifiée avec succès`);
      } else {
        await connect.post("/api/categories", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        toast.success(`Catégorie "${categorieNettoyee}" créée avec succès`);
      }

      await fetchCategories();
    } catch (error) {
      const err = error as AxiosError;

      toast.error(err.response?.data?.error || "Une erreur s'est produite.");

      return;
    }

    setedit(false);
    setdataForm({
      id: 0,
      categorie: "",
      image: "",
      description: "",
    });
    setimageHeader("");
    setselectedFile(null);
    setlengthcategorie(0);
    setlengthdescribe(0);
    setopen(false);
  };
  const handleclose = () => {
    if (edit === false) {
      setdataForm({
        ...dataForm,
        categorie: "",
        image: "",
        description: "",
      });
      setimageHeader("");
      setselectedFile(null);
      setlengthcategorie(0);
      setlengthdescribe(0);
    }
    setopen(false);
  };
  const handleOpen = (p: categories) => {
    setopen(true);
    setdataForm({
      ...dataForm,
      id: p.id,
      categorie: p.categorie,
      image: p.image,
      description: p.description,
    });
    const imageUrl = p.image ? `http://localhost:5000${p.image}` : "";
    setimageHeader(imageUrl);
    setselectedFile(null);
    setlengthcategorie(p.categorie.length);
    setlengthdescribe(p.description.length);
    setedit(true);
  };
  const handledelete = async (id: number) => {
    /*const data = categorie.filter((p) => p.id !== ids);
    setcategorie([...data]);*/
    try {
      await connect.delete(`/api/categories/${id}`);
      toast.success("Catégorie supprimée");
      await fetchCategories();
    } catch (error) {
      const err = error as AxiosError;
      toast.error(err.response?.data?.error || "Une erreur s'est produite.");
      return;
    }
    setopen(false);
    setedit(false);
    setimageHeader("");
    setselectedFile(null);
    setlengthcategorie(0);
    setlengthdescribe(0);
    setdataForm({ id: 0, categorie: "", image: "", description: "" });
  };
  return (
    <div className="AccueilHeader">
      <div className="AccueilHome">
        <SiderbarAdmin />
      </div>
      <div className="AccueilPrestations">
        <div className="AccueilPrestationsTitle">
          <h2>Nos prestations</h2>
        </div>
        <div className="prestationAdd">
          {" "}
          <Button className="glow" onClick={() => setopen(true)}>
            Ajouter une prestation
          </Button>
        </div>
        {categorie.length > 0 ? (
          <div className="AccueilPrestationsCards">
            {categorie.map((p) => (
              <div
                className="AccueilPrestationsCardLists"
                key={p.id}
                onClick={() => {
                  handleOpen(p);
                }}
                style={{ cursor: "pointer" }}
              >
                <GlowCard
                  padding="20px 0px"
                  customSize
                  width="100%"
                  height="100%"
                  className="w-full"
                >
                  <img src={`http://localhost:5000${p.image}`} alt="" />
                  <p
                    id="CategorieTitle"
                    style={{ textTransform: "capitalize" }}
                  >
                    {p.categorie}
                  </p>
                  <p id="CategorieDescription">{p.description}</p>
                  <Button className="glow">Choisir cette prestation</Button>
                </GlowCard>
              </div>
            ))}
          </div>
        ) : (
          <div className="NoCategorie">
            <p>Aucune prestation pour le moment!</p>
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
                      onChange={handleChangeImage}
                      accept="image/*"
                      ref={refimage}
                    />
                  </div>
                </div>
                <div className="categoriesFormHeaderCard">
                  <p>Saisir une catégorie :</p>
                  <div className="categoriesFormHeaderCardCompteur">
                    <input
                      maxLength={25}
                      name="categorie"
                      type="text"
                      spellCheck
                      value={dataForm.categorie}
                      onChange={handleChange}
                    />
                    <span>{lengthcategorie}/25</span>
                  </div>
                </div>
                <div className="categoriesFormHeaderCard">
                  <p>Saisir une description de votre catégorie :</p>
                  <div className="categoriesFormTextAreaCompteur">
                    <textarea
                      name="description"
                      id=""
                      spellCheck
                      value={dataForm.description}
                      onChange={handleChange}
                      maxLength={150}
                    />
                    <span>{lengthdescribe}/150</span>
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

export default PrestationAdmin;
