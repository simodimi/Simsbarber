import {
  useEffect,
  useRef,
  type ChangeEvent,
  type Dispatch,
  type SetStateAction,
} from "react";
import SiderbarAdmin from "../components/SiderbarAdmin";
import img from "../assets/avatar/A1.jpg";
import { useState } from "react";
import Button from "../ui/Button";
import { toast } from "react-toastify";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import { useNavigate } from "react-router-dom";
import connect from "../services/Util";

interface Client {
  id: number;
  photoUser: string;
  nameUser: string;
  mailUser: string;
  statusReservationUser: "Activer" | "Bloquer";
}

interface bgprops {
  setvisualsms: Dispatch<SetStateAction<number | null>>;
  setvisualconsult: Dispatch<SetStateAction<Client | null>>;
}

const Client = ({ setvisualsms, setvisualconsult }: bgprops) => {
  const navigate = useNavigate();
  const [ClientTable, setClientTable] = useState<Client[]>([]);
  const [clientDelete, setclientDelete] = useState<Client | null>(null);
  const [open, setopen] = useState<boolean>(false);
  const [openfilter, setopenfilter] = useState<boolean>(false);

  //filtre du tableau
  const [search, setsearch] = useState<{ filter1: string; filter2: string }>({
    filter1: "",
    filter2: "",
  });

  //  Récupération des clients depuis l'API avec filtrage
  const fetchClients = async () => {
    try {
      const res = await connect.get("/api/clients", {
        params: {
          email: search.filter1 || undefined,
          nom: search.filter2 || undefined,
        },
      });
      const adapte = res.data.map((u: any) => ({
        id: u.id,
        photoUser: u.photoUser
          ? u.photoUser.startsWith("http")
            ? u.photoUser
            : `http://localhost:5000${u.photoUser}`
          : img,
        nameUser: u.nameUser,
        mailUser: u.mailUser,
        statusReservationUser: u.status === "ACTIF" ? "Activer" : "Bloquer",
      }));
      setClientTable(adapte);
    } catch (error) {
      console.error("Erreur lors de la récupération des clients:", error);
      setClientTable([]);
    }
  };

  //  Un seul useEffect pour les appels API
  useEffect(() => {
    fetchClients();
  }, [search.filter1, search.filter2]);

  //  Changement de statut (version corrigée - une seule fois)
  const handlereservation = async (idx: number) => {
    try {
      await connect.patch(`/api/clients/${idx}/toggle-status`);
      toast.success("Statut mis à jour");
      fetchClients(); // Recharge la liste
    } catch (error) {
      toast.error("Erreur lors de la mise à jour du statut");
    }
  };

  //  Supprimer un client (version corrigée - une seule fois)
  const handledelete = async (idx: number) => {
    try {
      await connect.delete(`/api/clients/${idx}`);
      toast.success("Client supprimé avec succès");
      setopen(false);
      fetchClients(); // Recharge la liste
    } catch (error) {
      toast.error("Erreur lors de la suppression du client");
    }
  };

  // Ouvrir le dialogue de confirmation de suppression
  const handlechoix = (p: Client) => {
    setclientDelete(p);
    setopen(true);
  };

  // Envoyer un message
  const handlesendSMS = (idx: number) => {
    const update = ClientTable.find((p) => p.id === idx);
    if (!update) return;
    setvisualsms(update.id);
    navigate("/admin/message");
  };

  // Consulter les avis
  const handleconsult = (p: Client) => {
    setvisualconsult(p);
    navigate("/admin/avis");
  };

  // Clic en dehors du container de filtre
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

  //  Gestion du changement de filtre (version corrigée)
  const handlechange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setsearch((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="AccueilHeaderAdmin">
      <div className="AccueilHome">
        <SiderbarAdmin />
      </div>
      <div className="FilterClient">
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
            </div>
          )}
        </div>
      </div>
      <div className="ProfilMessageAdmins">
        <table>
          <thead>
            <tr>
              <th>Photos</th>
              <th>Nom</th>
              <th>Adresse mail</th>
              <th>Status de réservation</th>
              <th>Envoyer message</th>
              <th>Supprimer contact</th>
              <th>Avis du client</th>
              <th>Réservations</th>
            </tr>
          </thead>
          {ClientTable.length > 0 ? (
            <tbody>
              {ClientTable.map((p) => (
                <tr key={p.id}>
                  <td>
                    <img src={p.photoUser} alt="" />
                  </td>
                  <td>{p.nameUser}</td>
                  <td>{p.mailUser}</td>
                  <td>
                    <Button
                      onClick={() => handlereservation(p.id)}
                      className={`${p.statusReservationUser === "Activer" ? "succes" : "error"}`}
                    >
                      {p.statusReservationUser}
                    </Button>
                  </td>
                  <td>
                    <Button
                      className="succes"
                      onClick={() => handlesendSMS(p.id)}
                    >
                      Envoyer
                    </Button>
                  </td>
                  <td>
                    <Button className="warning" onClick={() => handlechoix(p)}>
                      Supprimer
                    </Button>
                  </td>
                  <td>
                    <Button className="glow" onClick={() => handleconsult(p)}>
                      Consulter
                    </Button>
                  </td>
                  <td>
                    <Button
                      className="glow"
                      onClick={() =>
                        navigate("/admin/planning", {
                          state: {
                            filterUserId: p.id,
                            filterUserName: p.nameUser,
                          },
                        })
                      }
                    >
                      Réservations
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          ) : (
            <tbody>
              <tr>
                <td
                  colSpan={7}
                  style={{
                    textAlign: "center",
                    fontWeight: "bold",
                    fontSize: "40px",
                  }}
                >
                  Aucun client trouvé
                </td>
              </tr>
            </tbody>
          )}
        </table>
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
            {clientDelete && (
              <div className="DeleteOption">
                <img src={clientDelete.photoUser} alt="" />
                <p>
                  Voulez vous vraiment supprimer le client{" "}
                  {clientDelete.nameUser} ?
                </p>
                <div className="buttonDelete">
                  <Button className="succes" onClick={() => setopen(false)}>
                    NON
                  </Button>
                  <Button
                    className="error"
                    onClick={() => handledelete(clientDelete.id)}
                  >
                    OUI
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default Client;
