import Siderbar from "../components/Siderbar";
import Button from "../ui/Button";

import { useNavigate, useParams } from "react-router-dom";
import "../styles/accueil.css";
import { useEffect, useState } from "react";
import people from "../assets/icone/A18.jpg";
import audios from "../assets/video/swipe.mp3";
import { toast } from "react-toastify";
import connect from "../services/Util";
interface Avis {
  id: number;
  photos: string;
  name: string;
  rating: number;
  message: string;
}
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
const CategoriePrestationSelect = () => {
  const { itemId, categoryId } = useParams<{
    itemId: string;
    categoryId: string;
  }>();
  const [prestations, setPrestations] = useState<sousCategories[]>([]);
  const navigate = useNavigate();
  const [storeImage, setStoreImage] = useState("");
  const [avisindex, setavisindex] = useState(0);
  const [avisPrestation, setAvisPrestation] = useState<Avis[]>([]);
  const fetchPrestations = async () => {
    try {
      // Récupérer toutes les catégories
      const categoriesRes = await connect.get("/api/categories");
      const category = categoriesRes.data.find(
        (c: any) =>
          c.nom.toLowerCase().trim() === categoryId?.toLowerCase().trim(),
      );
      console.log(`la categorie est:`, category);

      if (!category) {
        toast.error("Catégorie non trouvée");
        return;
      }
      // Récupérer toutes les prestations
      const response = await connect.get("/api/prestations");
      const data = response.data;

      // Filtrer par categoryId
      const filtered = data.filter((p: any) => p.categoryId === category.id);
      // Adapter les donnéess
      const adaptedData: sousCategories[] = filtered.map((p: any) => ({
        id: p.idprestation || p.id,
        //categorie: category.nom,
        nom: p.nom,
        slug: p.slug,
        descriptionCourte: p.descriptionCourte || p.description || "",
        descriptionComplete: p.descriptionComplete || p.description || "",
        image: p.image ? `http://localhost:5000${p.image}` : "",
        galerie: Array.isArray(p.galerie)
          ? p.galerie.map((g: string) => `http://localhost:5000${g}`)
          : [],
        duree: p.duree || 0,
        prix: p.prix || 0,
        ancienPrix: p.ancienPrix || 0,
        produitsUtilises: p.produitsUtilises || "",
      }));

      setPrestations(adaptedData);
    } catch (error) {
      console.error("Error fetching prestations:", error);
      toast.error("Impossible de charger les prestations");
    }
  };

  useEffect(() => {
    fetchPrestations();
  }, []);
  const prestation = prestations.find(
    (p) => p.slug === itemId?.toLowerCase().trim(),
  );
  // Mettre à jour l'image principale
  useEffect(() => {
    if (prestation?.galerie?.length) {
      setStoreImage(prestation.galerie[0]);
    } else if (prestation?.image) {
      setStoreImage(prestation.image);
    }
  }, [prestation]);
  //avis
  // Récupérer les avis dès que la prestation est chargée
  useEffect(() => {
    const fetchAvis = async () => {
      if (!prestation?.id) return;
      try {
        const response = await connect.get(
          `/api/reviews/by-prestation/${prestation.id}?minNote=4`,
        );
        const mapped = response.data.map((item: any) => ({
          id: item.id,
          photos: item.user?.photoUser || people,
          name: item.user?.nameUser || "Anonyme",
          rating: item.note,
          message: item.commentaire || "Aucun commentaire",
        }));
        setAvisPrestation(mapped);
        // Réinitialiser l'index des avis
        setavisindex(0);
      } catch (error) {
        console.error("Erreur chargement avis pour la prestation", error);
      }
    };
    fetchAvis();
  }, [prestation?.id]);
  //prenons 3 avis par 3 avis
  const audio = new Audio(audios);
  audio.volume = 0.2;
  const newavis = avisPrestation.slice(avisindex, avisindex + 3);
  const handleNextAvis = () => {
    setavisindex((prev) => {
      const next = prev + 3;
      return next >= avisPrestation.length ? 0 : next;
    });
    audio.pause();
    audio.currentTime = 0;
    audio.play();
  };
  const handlePreviousAvis = () => {
    setavisindex((prev) => {
      const next = prev - 3;
      //return next >= avisPrestation.length ? 0 : next;
      return next < 0 ? Math.max(0, avisPrestation.length - 3) : next;
    });
    audio.pause();
    audio.currentTime = 0;
    audio.play();
  };
  //reservation
  const handleReservation = () => {
    navigate("/calendrier", { state: { prestation } });
    toast("veuillez choisir un jour du calendrier");
  };
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
          <h2>
            Nos prestations de {categoryId} en {prestation?.nom}
          </h2>
        </div>
        <div className="PrestastionCard">
          <div className="PrestastionImage">
            <div className="PrestastionImageMain">
              {storeImage && <img src={storeImage} alt={prestation?.nom} />}
            </div>
            {prestation?.galerie && prestation?.galerie?.length > 0 && (
              <div className="PrestastionImageSecond">
                {prestation?.galerie.map((p, index) => (
                  <div
                    className="PrestastionImageSecondList"
                    key={index}
                    onClick={() => setStoreImage(p)}
                    style={{ cursor: "pointer" }}
                  >
                    <img src={p} alt={`${prestation.nom} - ${index + 1}`} />
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="PrestastionDescribe">
            <h2>{prestation?.nom}</h2>
            <div className="PrestastionDescribeCard">
              <p id="PrestastionDescribeTitle">Description :</p>
              <p>{prestation?.descriptionComplete}</p>
              <div className="PrestastionDescribePrice">
                <p id="PrestastionDescribeTitle">
                  Prix de la séance : <span>{prestation?.prix}</span> €
                </p>
                {prestation &&
                  prestation.ancienPrix != null &&
                  prestation.ancienPrix > 0 && (
                    <p id="PrestastionDescribeTitle">
                      Ancien prix :{" "}
                      <span
                        style={{
                          textDecoration: "line-through",
                          textDecorationColor: "red",
                          color: "black",
                        }}
                      >
                        {prestation?.ancienPrix} €
                      </span>
                    </p>
                  )}
              </div>
              <p id="PrestastionDescribeTitle">
                Durée de la séance : <span>{prestation?.duree} minutes</span>.
              </p>
              {prestation?.produitsUtilises && (
                <p id="PrestastionDescribeTitle">
                  Produits utilisés :{" "}
                  <span>{prestation?.produitsUtilises}</span>.
                </p>
              )}
            </div>
            <Button className="glow" onClick={handleReservation}>
              Réservation
            </Button>
          </div>
        </div>
        {avisPrestation.length > 0 && (
          <div className="AvisClientCoupe">
            <div className="AccueilPrestationsTitle">
              <h2>
                Avis des clients sur {/*{categoryId}s en*/} {prestation?.nom}
              </h2>
            </div>
            <div className="AvisCard">
              <div className="AvisCardHeader">
                {newavis.map((p) => (
                  <div className="AvisCardHeaderList" key={p.id}>
                    <img src={p.photos} alt="" />
                    <p>{p.name}</p>
                    <p>{p.message}</p>
                    <p>{"⭐".repeat(p.rating)}</p>
                  </div>
                ))}
              </div>
              <div className="AvisCardFunction">
                {avisindex > 0 && (
                  <Button className="error" onClick={handlePreviousAvis}>
                    Précedent
                  </Button>
                )}

                {avisindex + 3 < avisPrestation.length && (
                  <Button className="succes" onClick={handleNextAvis}>
                    Suivant
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoriePrestationSelect;
