import Siderbar from "../components/Siderbar";
import Button from "../ui/Button";
import { GlowCard } from "../ui/Card";
import { Link } from "react-router-dom";
import connect from "../services/Util";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
interface categories {
  id: number;
  categorie: string;
  image: string;
  description: string;
}

const Prestation = () => {
  const [categorie, setcategorie] = useState<categories[]>([]);
  const fetchCategories = async () => {
    try {
      const res = await connect.get("/api/categories");
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

  return (
    <div className="AccueilHeader">
      <div className="AccueilHome">
        <Siderbar />
      </div>
      <div className="AccueilPrestations">
        <div className="AccueilPrestationsTitle">
          <h2>Nos prestations</h2>
        </div>
        <div className="AccueilPrestationsCards">
          {categorie.map((p) => (
            <Link to={`/prestation/${p.categorie}`} key={p.id}>
              <div className="AccueilPrestationsCardLists">
                <GlowCard
                  padding="20px 0px"
                  customSize
                  width="100%"
                  height="100%"
                  className="w-full"
                >
                  <img src={`http://localhost:5000${p.image}`} alt="" />
                  <p id="CategorieTitle">{p.categorie}</p>
                  <p id="CategorieDescription">{p.description}</p>
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

export default Prestation;
