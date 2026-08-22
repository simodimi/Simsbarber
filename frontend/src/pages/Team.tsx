import { useNavigate } from "react-router-dom";
import Siderbar from "../components/Siderbar";
import Button from "../ui/Button";
import { GlowCard } from "../ui/Card";
import { teamMembers } from "../store/Bdd";
import "../styles/about.css";
import { useEffect, useState } from "react";
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
const Team = () => {
  const navigate = useNavigate();
  const [categorie, setCategorie] = useState<Categories[]>([]);
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
  //flatmap permet de regrouper en un seul element
  //...new set permet de retirer des doublons et mettre tout sous un tableau
  const regroupage = [...new Set(categorie.flatMap((p) => p.categoriesEquipe))];
  const filtre = regroupage.map((p) => ({
    categories: p,
    menber: categorie.filter((items) => items.categoriesEquipe.includes(p)),
  }));
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
          <h2>Nos spécialistes du bien être </h2>
        </div>
        <div className="TeamCard">
          {filtre.map(({ categories, menber }) => (
            <div className="" key={categories}>
              <h2 className="AccueilPrestationsTitle">{categories}</h2>
              <div className="TeamCardList">
                {menber.map((p) => (
                  <div className="TeamCardMenber">
                    <GlowCard
                      padding="20px 0px"
                      customSize
                      width="100%"
                      height="100%"
                      className="w-full"
                    >
                      <img src={p.imageEquipe} alt="" />
                      <p id="TeamCardMenberStyle">{p.nameEquipe}</p>

                      <p id="">{p.descriptionEquipe}</p>
                      <p id="TeamCardMenberStyles">{p.experienceEquipe}</p>
                      <p id="TeamCardMenberStyle">{p.citationEquipe}</p>
                    </GlowCard>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Team;
