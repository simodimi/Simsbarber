import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../pages/AuthContext";
import connect from "../services/Util";
import { connectSocket } from "../services/socket";
import "../styles/profil.css";
import { GlowCard } from "../ui/Card";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import Button from "../ui/Button";
import * as React from "react";
import Rating from "@mui/material/Rating";
import Box from "@mui/material/Box";
import StarIcon from "@mui/icons-material/Star";
import { toast } from "react-toastify";

// ---------- Types ----------
interface Prestation {
  id: number;
  nom: string;
  categorie: string;
  prix: number;
  duree: number;
  descriptionComplete: string;
}

interface ReservationAPI {
  id: number;
  titre: string;
  descriptionComplete: string;
  description: string | null;
  start: string; // ISO
  end: string;
  status: "CONFIRME" | "ANNULE" | "TERMINE";
  prixTotal: number;
  dureeTotal: number;
  pictureUrl: string | null;
  prestations: Prestation[];
}

interface ReviewAPI {
  id: number;
  note: number;
  commentaire: string;
  createdAt: string;
  updatedAt: string;
  user: { nameUser: string; photoUser: string };
}

interface PaginationProps {
  itemsParPage?: number;
}

const STATUS_LABELS: Record<ReservationAPI["status"], string> = {
  CONFIRME: "En attente",
  TERMINE: "Confirmée",
  ANNULE: "Annulée",
};
const STATUS_COLORS: Record<ReservationAPI["status"], string> = {
  CONFIRME: "#f0ad4e", // en attente
  TERMINE: "#28a745", // confirmée
  ANNULE: "#dc3545", // annulée
};

const StatusBadge = ({ status }: { status: ReservationAPI["status"] }) => (
  <span
    style={{
      backgroundColor: STATUS_COLORS[status],
      color: "white",
      padding: "2px 10px",
      borderRadius: "12px",
      fontSize: "12px",
      fontWeight: 600,
    }}
  >
    {STATUS_LABELS[status]}
  </span>
);
const Reservation = ({ itemsParPage = 3 }: PaginationProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  // États pour les listes
  const [pastReservations, setPastReservations] = useState<ReservationAPI[]>(
    [],
  );
  const [upcomingReservations, setUpcomingReservations] = useState<
    ReservationAPI[]
  >([]);
  const [totalPast, setTotalPast] = useState(0);
  const [totalUpcoming, setTotalUpcoming] = useState(0);

  // Pagination
  const [currentPagePast, setCurrentPagePast] = useState(1);
  const [currentPageUpcoming, setCurrentPageUpcoming] = useState(1);

  // Menu actif (1 = passées, 2 = à venir)
  const [activeTab, setActiveTab] = useState<1 | 2>(1);

  // Dialogue de détail
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedReservation, setSelectedReservation] =
    useState<ReservationAPI | null>(null);

  // Avis
  const [existingReview, setExistingReview] = useState<ReviewAPI | null>(null);
  const [reviewForm, setReviewForm] = useState({ note: 5, commentaire: "" });
  const [hover, setHover] = React.useState(-1);
  const [editMode, setEditMode] = useState(false); // true = modification

  // ---------- Fonctions de chargement ----------
  const fetchReservations = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Récupérer les passées
      const pastRes = await connect.get("/api/reservations/me", {
        params: { type: "past", page: currentPagePast, itemsParPage },
      });
      setPastReservations(pastRes.data.data || []);
      setTotalPast(pastRes.data.total || 0);

      // Récupérer les à venir
      const upcomingRes = await connect.get("/api/reservations/me", {
        params: { type: "upcoming", page: currentPageUpcoming, itemsParPage },
      });
      setUpcomingReservations(upcomingRes.data.data || []);
      setTotalUpcoming(upcomingRes.data.total || 0);
    } catch (error: any) {
      toast.error("Erreur lors du chargement des réservations");
    } finally {
      setLoading(false);
    }
  }, [user, currentPagePast, currentPageUpcoming, itemsParPage]);

  // Chargement initial
  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  // ---------- Socket ----------
  useEffect(() => {
    const socket = connectSocket();
    const handleUpdate = () => fetchReservations();
    socket.on("reservation:updated", handleUpdate);
    socket.on("reservation:cancelled", handleUpdate);
    return () => {
      socket.off("reservation:updated", handleUpdate);
      socket.off("reservation:cancelled", handleUpdate);
    };
  }, [fetchReservations]);

  // ---------- Gestion du dialogue ----------
  const handleOpenDialog = (reservation: ReservationAPI) => {
    setSelectedReservation(reservation);
    setOpenDialog(true);
    setExistingReview(null);
    setReviewForm({ note: 5, commentaire: "" });
    setEditMode(false);
    // Charger l'avis existant
    loadReview(reservation.id);
  };

  const loadReview = async (reservationId: number) => {
    try {
      const res = await connect.get(
        `/api/reviews/by-reservation/${reservationId}`,
      );
      setExistingReview(res.data);
      setReviewForm({
        note: res.data.note,
        commentaire: res.data.commentaire || "",
      });
      setEditMode(true); // puisque l'avis existe, on passe en mode édition
    } catch (error: any) {
      if (error.response?.status === 404) {
        // Pas d'avis, on reste en création
        setExistingReview(null);
        setEditMode(false);
      } else {
        toast.error("Erreur lors du chargement de l'avis");
      }
    }
  };

  // ---------- Soumission de l'avis ----------
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReservation) return;
    if (!reviewForm.commentaire.trim()) {
      toast.error("Veuillez rédiger un commentaire");
      return;
    }

    try {
      if (editMode && existingReview) {
        // Mise à jour
        await connect.put(`/api/reviews/${existingReview.id}`, {
          note: reviewForm.note,
          commentaire: reviewForm.commentaire,
        });
        toast.success("Avis modifié avec succès");
        setExistingReview({
          ...existingReview,
          note: reviewForm.note,
          commentaire: reviewForm.commentaire,
        });
      } else {
        // Création
        const res = await connect.post("/api/reviews", {
          note: reviewForm.note,
          commentaire: reviewForm.commentaire,
          reservationId: selectedReservation.id,
        });
        toast.success("Avis envoyé, merci !");
        setExistingReview(res.data);
        setEditMode(true);
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Erreur lors de l'envoi de l'avis",
      );
    }
  };

  const handleDeleteReview = async () => {
    if (!existingReview) return;
    try {
      await connect.delete(`/api/reviews/${existingReview.id}`);
      toast.success("Avis supprimé");
      setExistingReview(null);
      setEditMode(false);
      setReviewForm({ note: 5, commentaire: "" });
    } catch (error: any) {
      toast.error("Erreur lors de la suppression");
    }
  };

  // ---------- Rendu ----------
  const renderReservationCard = (reservation: ReservationAPI) => (
    <div
      className="ReservationCardElement"
      key={reservation.id}
      onClick={() => handleOpenDialog(reservation)}
    >
      <GlowCard
        padding="20px 0px"
        customSize
        width="100%"
        height="100%"
        className="glowReservtion"
      >
        {reservation.pictureUrl && (
          <img
            src={`http://localhost:5000${reservation.pictureUrl}`}
            alt="prestation"
          />
        )}
        <p>
          Moyen de réservation: <span>site web</span>
        </p>
        <p>
          Prestation: <span>{reservation.titre}</span>
        </p>
        <p>
          Statut:{" "}
          <span>
            <StatusBadge status={reservation.status} />
          </span>
        </p>
        <p>
          Date: <span>{new Date(reservation.start).toLocaleDateString()}</span>
        </p>
      </GlowCard>
    </div>
  );

  const totalPagesPast = Math.ceil(totalPast / itemsParPage);
  const totalPagesUpcoming = Math.ceil(totalUpcoming / itemsParPage);

  // Affichage des réservations actuelles selon l'onglet
  const currentList = activeTab === 1 ? pastReservations : upcomingReservations;
  const currentPage = activeTab === 1 ? currentPagePast : currentPageUpcoming;
  const setCurrentPage =
    activeTab === 1 ? setCurrentPagePast : setCurrentPageUpcoming;
  const totalPages = activeTab === 1 ? totalPagesPast : totalPagesUpcoming;

  return (
    <div className="ProfilMessage">
      <div className="ProfilMessageContact">
        <div className="ProfilParaContacttitle">
          <h1 style={{ color: "white" }}>Mes Réservations</h1>
        </div>
        <div className="ProfilResContactCard">
          <div
            className={`ProfilResContactCardPerson ${activeTab === 1 ? "active" : ""}`}
            onClick={() => setActiveTab(1)}
          >
            <p>Mes réservations passées</p>
          </div>
          <div
            className={`ProfilResContactCardPerson ${activeTab === 2 ? "active" : ""}`}
            onClick={() => setActiveTab(2)}
          >
            <p>Mes réservations en cours</p>
          </div>
        </div>
      </div>

      <div className="ProfilMessageContent">
        <div className="ProfilParaContentPerson">
          <p>
            {activeTab === 1
              ? "Mes réservations passées"
              : "Mes réservations en cours"}
          </p>
        </div>
        <div className="ProfilParaContentCard">
          <div className="ReservationHeader">
            <div className="ResevationCard">
              {loading ? (
                <p>Chargement...</p>
              ) : currentList.length === 0 ? (
                <p
                  style={{
                    color: "white",
                    fontWeight: "bold",
                    textAlign: "center",
                    fontSize: "20px",
                  }}
                >
                  Aucune réservation à afficher
                </p>
              ) : (
                currentList.map(renderReservationCard)
              )}
            </div>
            {totalPages > 1 && (
              <div className="pagination">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (p) => (
                    <div
                      key={p}
                      className={`paginationheader ${p === currentPage ? "active" : ""}`}
                      onClick={() => setCurrentPage(p)}
                    >
                      {p}
                    </div>
                  ),
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dialogue de détail */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        className="custom-dialog"
        maxWidth="md"
        fullWidth
      >
        <DialogContent>
          {selectedReservation && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                width: "100%",
              }}
            >
              {selectedReservation.pictureUrl && (
                <img
                  src={`http://localhost:5000${selectedReservation.pictureUrl}`}
                  alt="prestation"
                  style={{
                    maxWidth: "100%",
                    maxHeight: "200px",
                    objectFit: "cover",
                  }}
                />
              )}
              <p>
                Durée : <span>{selectedReservation.dureeTotal}</span> min
              </p>
              <p>
                Status :{" "}
                <span>
                  <StatusBadge status={selectedReservation.status} />
                </span>
              </p>
              <p>
                Prix : <span>{selectedReservation.prixTotal}</span> €
              </p>
              <p>
                Prestations : <span>{selectedReservation.titre}</span>
              </p>

              {/* Gestion de l'avis */}
              {selectedReservation.status !== "TERMINE" ? (
                <p style={{ color: "black" }}>
                  Vous pourrez laisser un avis une fois la prestation confirmée
                  par le salon.
                </p>
              ) : existingReview && editMode ? (
                <div>
                  <p
                    style={{
                      display: "flex",
                      gap: "10px",
                      alignItems: "center",
                    }}
                  >
                    Mon commentaire :
                    <Button
                      className="warning"
                      onClick={() => setEditMode(false)}
                    >
                      Modifier
                    </Button>
                    <Button className="error" onClick={handleDeleteReview}>
                      Supprimer
                    </Button>
                  </p>
                  <div className="CommentUser">
                    <p>{existingReview.commentaire}</p>
                    <Rating
                      value={existingReview.note}
                      readOnly
                      precision={1}
                    />
                  </div>
                </div>
              ) : (
                <div className="AvisUser">
                  <form onSubmit={handleSubmitReview}>
                    <p>Laissez un avis :</p>
                    <textarea
                      name="commentaire"
                      value={reviewForm.commentaire}
                      onChange={(e) =>
                        setReviewForm((prev) => ({
                          ...prev,
                          commentaire: e.target.value,
                        }))
                      }
                      spellCheck
                    />
                    <div className="Rating">
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          marginTop: "10px",
                        }}
                      >
                        <Rating
                          name="hover-feedback"
                          value={reviewForm.note}
                          precision={1}
                          onChange={(_, newValue) => {
                            setReviewForm((prev) => ({
                              ...prev,
                              note: newValue ?? 0,
                            }));
                          }}
                          onChangeActive={(_, newHover) => setHover(newHover)}
                          emptyIcon={
                            <StarIcon
                              style={{ opacity: 0.55 }}
                              fontSize="inherit"
                            />
                          }
                          sx={{
                            "& .MuiRating-iconFilled": { color: "#FFD700" },
                            "& .MuiRating-iconHover": { color: "#FFD700" },
                          }}
                        />
                        {reviewForm.note !== null && (
                          <Box sx={{ ml: 2 }}>
                            {hover !== -1
                              ? getLabelText(hover)
                              : getLabelText(reviewForm.note)}
                          </Box>
                        )}
                      </Box>
                      <Button type="submit" className="succes">
                        {editMode ? "Modifier" : "Envoyer"}
                      </Button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Helper pour les labels des étoiles
const labels: { [index: number]: string } = {
  0.5: "Très mauvais",
  1: "Mauvais",
  1.5: "Assez mauvais",
  2: "Médiocre",
  2.5: "Passable",
  3: "Correct",
  3.5: "Bien",
  4: "Très bien",
  4.5: "Excellent",
  5: "Exceptionnel",
};

function getLabelText(value: number) {
  return `${value} Star${value !== 1 ? "s" : ""}, ${labels[value]}`;
}

export default Reservation;
