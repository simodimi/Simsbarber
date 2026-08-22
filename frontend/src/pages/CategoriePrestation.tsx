import Siderbar from "../components/Siderbar";
import Button from "../ui/Button";
import { GlowCard } from "../ui/Card";

import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import connect from "../services/Util";
import { useEffect, useState } from "react";

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
  slug: string;
}

const CategoriePrestation = () => {
  const [categorie, setcategorie] = useState<sousCategories[]>([]);
  const { categoryId } = useParams<{ categoryId: string }>();
  const fetchCategories = async () => {
    try {
      // Récupérer toutes les prestations
      const [prestationsRes, categoriesRes] = await Promise.all([
        connect.get("/api/prestations"),
        connect.get("/api/categories"),
      ]);

      // Trouver la catégorie par son nom (ou ID)
      const category = categoriesRes.data.find(
        (c: any) =>
          c.id === parseInt(categoryId || "0") ||
          c.nom.toLowerCase() === categoryId?.toLowerCase(),
      );

      if (!category) {
        toast.error("Catégorie non trouvée");
        return;
      }

      // Filtrer les prestations
      const filtered = prestationsRes.data.filter(
        (p: any) => p.categoryId === category.id,
      );
      const adapte = filtered.map((p: any) => ({
        id: p.idprestation || p.id,
        nom: p.nom,
        image: p.image,
        descriptionCourte: p.descriptionCourte,
        prix: p.prix,
        slug: p.slug,
      }));

      setcategorie(adapte);
    } catch (error) {
      toast.error("Impossible de charger les prestations");
      console.error(error);
    }
  };
  useEffect(() => {
    fetchCategories();
  }, []);

  const navigate = useNavigate();
  return (
    <div className="AccueilHeader">
      <div className="AccueilHome">
        <Siderbar />
      </div>
      <div className="btnRetour">
        {" "}
        <Button className="succes" onClick={() => navigate(-1)}>
          Retour
        </Button>
      </div>

      <div className="AccueilPrestations">
        <div className="AccueilPrestationsTitle">
          <h2>Nos prestations en {categoryId}</h2>
        </div>
        <div className="AccueilPrestationsCards">
          {categorie.map((p) => (
            <Link to={`/prestation/${categoryId}/${p.slug}`} key={p.id}>
              <div className="AccueilPrestationsCardLists">
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
                  <Button className="glow">Choisir cette prestation</Button>
                </GlowCard>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoriePrestation;
