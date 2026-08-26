import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type Dispatch,
  type SetStateAction,
} from "react";
import SiderbarAdmin from "../components/SiderbarAdmin";
import Button from "../ui/Button";
import img from "../assets/avatar/A1.jpg";
import { useNavigate } from "react-router-dom";
import "../styles/prestation.css";
import Rating from "@mui/material/Rating";
import connect from "../services/Util";

interface AvisClient {
  id: number;
  userId: number;
  photoUser: string;
  nameUser: string;
  mailUser: string;
  dateAvis: string;
  note: number;
  commentaire: string;
}

interface color {
  id: number;
  note: number;
  color: string;
}

interface Client {
  id: number;
  photoUser: string;
  nameUser: string;
  mailUser: string;
  statusReservationUser: "Activer" | "Bloquer";
}
interface bgprops {
  setavissms: Dispatch<SetStateAction<number | null>>;
  visualconsult: Client | null;
}
const Avis = ({ setavissms, visualconsult }: bgprops) => {
  const Couleur: color[] = [
    { id: 1, note: 1, color: "#e74c3c" },
    { id: 2, note: 2, color: "#e67e22" },
    { id: 3, note: 3, color: "#f1c40f" },
    { id: 4, note: 4, color: "#a9d64c" },
    { id: 5, note: 5, color: "#27ae60" },
  ];
  const navigate = useNavigate();
  const [ClientTable, setClientTable] = useState<AvisClient[]>([]);
  const [ClientColor, setClientColor] = useState<number | null>(null);
  //filtre du tableau
  const [search, setsearch] = useState<{ filter1: string; filter2: string }>({
    filter1: "",
    filter2: "",
  });
  const [openfilter, setopenfilter] = useState<boolean>(false);

  //clic en dehors du container
  const refslider = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const update = (e: MouseEvent) => {
      if (refslider.current && !refslider.current.contains(e.target as Node)) {
        setopenfilter(false);
      }
    };
    document.addEventListener("mousedown", update);
    return () => {
      document.removeEventListener("mousedown", update);
    };
  }, []);
  const fetchAvis = async () => {
    const res = await connect.get("/api/reviews/admin", {
      params: { email: search.filter1, nom: search.filter2, note: ClientColor },
    });
    const adapte = res.data.map((r: any) => ({
      id: r.id,
      userId: r.user.id,
      photoUser: r.user.photoUser
        ? r.user.photoUser.startsWith("http")
          ? r.user.photoUser
          : `http://localhost:5000${r.user.photoUser}`
        : img,
      nameUser: r.user.nameUser,
      mailUser: r.user.mailUser,
      dateAvis: new Date(r.createdAt).toLocaleDateString("fr-FR"),
      note: r.note,
      commentaire: r.commentaire,
    }));
    setClientTable(adapte);
  };
  useEffect(() => {
    fetchAvis();
  }, [search, ClientColor, visualconsult]);
  const handlechange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setsearch((prev) => ({ ...prev, [name]: value }));
  };
  useEffect(() => {
    if (!visualconsult) return;
    setClientColor(null);
    setsearch({
      filter1: visualconsult.mailUser || "",
      filter2: visualconsult.nameUser || "",
    });
    // Le fetch se fera automatiquement via l'autre useEffect
  }, [visualconsult]);
  const handlesend = (idx: number) => {
    const update = ClientTable.find((p) => p.id === idx);
    if (!update) {
      return;
    }
    setavissms(update.userId);
    navigate("/admin/message");
  };
  return (
    <div className="" style={{ width: "100%", height: "100vh" }}>
      <div className="AccueilHome">
        <SiderbarAdmin />
      </div>
      <div className="FilterClient" style={{ marginBottom: "10px" }}>
        <div className="FilterClientHeader">
          <div className="FilterClientHeaderBtn">
            <Button
              className="glow"
              onMouseDown={(e) => {
                e.stopPropagation();
                setopenfilter((prev) => !prev);
              }}
            >
              filtre Client
            </Button>
          </div>
          {openfilter && (
            <div className="FilterClientCard" ref={refslider}>
              <p style={{ textAlign: "center" }}>Chercher des clients par:</p>
              <div className="FilterClientCardEl">
                <p style={{ fontWeight: "700" }}>Adresse mail :</p>
                <input
                  type="search"
                  name="filter1"
                  value={search.filter1}
                  onChange={handlechange}
                />
              </div>
              <div className="FilterClientCardEl">
                <p style={{ fontWeight: "700" }}>Nom du client :</p>
                <input
                  type="search"
                  name="filter2"
                  value={search.filter2}
                  onChange={handlechange}
                />
              </div>
              <div className="FilterClientCardEl">
                <p style={{ fontWeight: "700" }}>Notation :</p>
                <div className="FilterClientCardels">
                  {Couleur.map((p) => (
                    <div className="FilterClientCardelx" key={p.id}>
                      <span
                        onClick={() => setClientColor(p.note)}
                        className={`FilterClientCardelx ${ClientColor === p.note ? "active" : ""}`}
                      >
                        {p.note}
                      </span>
                    </div>
                  ))}
                  {ClientColor && (
                    <span
                      className="FilterClientC"
                      onClick={() => setClientColor(null)}
                    >
                      X
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      {ClientTable.length > 0 ? (
        <div className="AvisCards">
          {ClientTable.map((p) => {
            /*find renvoie un objet,on ajoute .color  */
            const bg = Couleur.find((x) => x.note === p.note)?.color;
            return (
              <div
                className="AvisHeaders"
                key={p.id}
                style={{ backgroundColor: bg }}
              >
                <div
                  className="AvisHeadersMain"
                  onClick={() => handlesend(p.id)}
                >
                  <img src={p.photoUser} alt="AvisHeadersCard" />
                  <p>{p.nameUser}</p>
                  <p>{p.mailUser}</p>
                </div>
                <div className="AvisHeadersCardList">
                  <p>{p.commentaire}</p>
                  <span>
                    {" "}
                    <Rating
                      value={p.note}
                      readOnly
                      precision={1}
                      sx={{
                        "& .MuiRating-iconFilled": {
                          color: "#FFD700", // Or jaune
                        },
                        "& .MuiRating-iconHover": {
                          color: "#FFD700",
                        },

                        "& .MuiRating-iconEmpty": {
                          color: "#FFD700", // Gris
                        },
                        "& .MuiRating-iconDecimal": {
                          color: "#FFD700", // Demi-étoile
                        },
                      }}
                    />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div
          className="AvisCards"
          style={{
            fontWeight: "700",
            fontFamily: "var(--police1)",
            textAlign: "center",
          }}
        >
          <p>Aucun avis trouvé</p>
        </div>
      )}
    </div>
  );
};

export default Avis;
