import { useState, useEffect } from "react";
import Button from "../ui/Button";
import { useLocation, useNavigate } from "react-router-dom";
import { Calendar, dateFnsLocalizer, type View } from "react-big-calendar";
import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import isSameDay from "date-fns/isSameDay";
import isBefore from "date-fns/isBefore";
import subHours from "date-fns/subHours";
import fr from "date-fns/locale/fr";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "../styles/calendar.css";
//modal
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import * as React from "react";
import { toast } from "react-toastify";
import connect from "../services/Util";
import { connectSocket } from "../services/socket";

const CONTACT_TELEPHONE = "0751255097";
const CONTACT_EMAIL = "simodimitri08@gmail.com";

const MAX_RESERVATIONS_PAR_JOUR = 2;
const DELAI_ANNULATION_HEURES = 24;

interface ServiceItem {
  id: number;
  nom: string;
  categorie: string;
  prix: number;
  duree: number;
  descriptionComplete: string;
}

interface Calendarevent {
  id: string;
  description?: string;
  picture?: string;
  start: Date;
  end: Date;
  starttime: string;
  color: string;
  prix: string;
  duree: string;
  nom: string;
  slug: string;
  descriptionComplete: string;
  categories: string[];
  servicesSelectionnes: ServiceItem[];
  status?: "CONFIRME" | "ANNULE" | "TERMINE";
}

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales: { fr },
});

const combineDateAndTime = (date: Date, time: string): Date => {
  const [hours, minutes] = time.split(":").map(Number);
  const combined = new Date(date);
  combined.setHours(hours || 0, minutes || 0, 0, 0);
  return combined;
};

const COLORS = [
  { value: "#3174ad", label: "Bleu" },
  { value: "#e6194b", label: "Rouge" },
  { value: "#3cb44b", label: "Vert" },
  { value: "#ffe119", label: "Jaune" },
  { value: "#911eb4", label: "Violet" },
  { value: "#f58231", label: "Orange" },
];

const getColorForCategorie = (categorie: string): string => {
  if (!categorie) return COLORS[0].value;
  let hash = 0;
  for (let i = 0; i < categorie.length; i++) {
    hash = categorie.charCodeAt(i) + ((hash << 5) - hash);
  }
  return COLORS[Math.abs(hash) % COLORS.length].value;
};

const Calendrier = () => {
  const [events, setEvents] = useState<Calendarevent[]>([]);
  const navigate = useNavigate();
  const location = useLocation();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState<View>("month");
  const [open, setOpen] = useState<boolean>(false);
  const [openCancel, setOpenCancel] = useState<boolean>(false);
  const [openRestricted, setOpenRestricted] = useState<boolean>(false);
  const [selectedslot, setselectedslot] = useState<{
    start: Date;
    end: Date;
  } | null>(null);
  const [cancelEvent, setCancelEvent] = useState<Calendarevent | null>(null);
  const [restrictedEvent, setRestrictedEvent] = useState<Calendarevent | null>(
    null,
  );
  const [editingEvent, seteditingEvent] = useState<Calendarevent | null>(null);
  const [saveData, setSaveData] = useState(() => {
    return location.state?.prestation || null;
  });
  const [formData, setformData] = useState<Calendarevent>({
    id: `${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    description: "",
    picture: "",
    start: new Date(),
    end: new Date(),
    starttime: "",
    color: "",
    prix: saveData?.prix || "",
    duree: saveData?.duree || "",
    nom: saveData?.nom || "",
    slug: saveData?.slug || "",
    descriptionComplete: saveData?.descriptionComplete || "",
    categories: [],
    servicesSelectionnes: [],
  });

  // État pour les prestations réelles
  const [servicesData, setServicesData] = useState<ServiceItem[]>([]);
  const [CategorieSelect, setCategorieSelect] = useState<string[]>([]);
  const [selectedServices, setSelectedServices] = useState<ServiceItem[]>([]);

  // Chargement des prestations
  const fetchPrestations = async () => {
    try {
      const res = await connect.get("/api/prestations");
      setServicesData(
        res.data.map((p: any) => ({
          id: p.id,
          nom: p.nom,
          categorie: p.category?.nom || "",
          prix: p.prix,
          duree: p.duree,
          descriptionComplete: p.descriptionComplete,
        })),
      );
    } catch (error) {
      console.error("Erreur chargement prestations", error);
    }
  };

  // Chargement des réservations de l'utilisateur
  const fetchReservations = async () => {
    try {
      const res = await connect.get("/api/reservations/me", {
        params: { itemsParPage: 999 },
      });
      const all = [...res.data.passees, ...res.data.aVenir];
      const adapte: Calendarevent[] = all.map((r: any) => ({
        id: String(r.id),
        description: r.description || "",
        picture: r.pictureUrl ? `http://localhost:5000${r.pictureUrl}` : "",
        start: new Date(r.start),
        end: new Date(r.end),
        starttime: new Date(r.start).toTimeString().slice(0, 5),
        color: r.color || getColorForCategorie(r.titre?.split(" ")[0] || ""),
        prix: String(r.prixTotal),
        duree: String(r.dureeTotal),
        nom: r.titre,
        slug: "",
        descriptionComplete: r.descriptionComplete || "",
        categories: r.categoriesSelectionnees || [],
        servicesSelectionnes: (r.prestations || []).map((p: any) => ({
          id: p.id,
          nom: p.nom,
          categorie: p.category?.nom || "",
          prix: p.ReservationPrestation?.prixSnapshot ?? p.prix,
          duree: p.duree,
          descriptionComplete: p.descriptionComplete,
        })),
        status: r.status,
      }));
      setEvents(adapte);
    } catch (error) {
      toast.error("Impossible de charger vos réservations");
    }
  };

  useEffect(() => {
    fetchPrestations();
    fetchReservations();
  }, []);

  // Socket
  useEffect(() => {
    const socket = connectSocket();
    socket.on("reservation:created", fetchReservations);
    socket.on("reservation:updated", fetchReservations);
    socket.on("reservation:cancelled", fetchReservations);
    return () => {
      socket.off("reservation:created", fetchReservations);
      socket.off("reservation:updated", fetchReservations);
      socket.off("reservation:cancelled", fetchReservations);
    };
  }, []);

  const nombreReservationsDuJour = (date: Date, excludeId?: string | null) =>
    events.filter(
      (p) => p.id !== excludeId && isSameDay(new Date(p.start), date),
    ).length;

  const handleClose = () => setOpen(false);

  const handleSelectCase = (p: { start: Date; end: Date }) => {
    if (nombreReservationsDuJour(p.start) >= MAX_RESERVATIONS_PAR_JOUR) {
      toast.error(
        `Vous avez déjà ${MAX_RESERVATIONS_PAR_JOUR} réservations ce jour-là.`,
      );
      return;
    }
    setselectedslot(p);
    seteditingEvent(null);
    setCategorieSelect([]);
    setSelectedServices([]);
    setformData({
      id: `${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      description: "",
      picture: "",
      start: p.start,
      end: p.end,
      starttime: "",
      color: "",
      prix: saveData?.prix || "",
      duree: saveData?.duree || "",
      nom: saveData?.nom || "",
      slug: saveData?.slug || "",
      descriptionComplete: saveData?.descriptionComplete || "",
      categories: [],
      servicesSelectionnes: [],
    });
    setOpen(true);
  };

  const handlechange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setformData({ ...formData, [name]: value });
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (!value) return;
    setformData((prev) => ({
      ...prev,
      start: parse(value, "yyyy-MM-dd", new Date()),
    }));
  };

  const handlechangePicture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setformData((prev) => ({
        ...prev,
        picture: reader.result as string,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handlesubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();

    const aujourdhui = new Date();
    aujourdhui.setHours(0, 0, 0, 0);
    const today = new Date(formData.start);
    today.setHours(0, 0, 0, 0);
    if (aujourdhui > today) {
      toast.error(
        `Vous ne pouvez pas sélectionner une date antérieure à aujourd'hui.`,
      );
      return;
    }
    if (!formData.starttime) {
      toast.error("Veuillez choisir une heure.");
      return;
    }

    // Récupérer les IDs des prestations
    let prestationIds: number[] = [];
    if (selectedServices.length) {
      prestationIds = selectedServices.map((s) => s.id);
    } else if (saveData?.id) {
      prestationIds = [saveData.id];
    }

    if (prestationIds.length === 0 && !editingEvent) {
      toast.error("Veuillez choisir au moins une prestation.");
      return;
    }

    const dureeFinale = selectedServices.length
      ? totalDuree(selectedServices)
      : Number(saveData?.duree || formData.duree || 30);

    const finalStart = combineDateAndTime(formData.start, formData.starttime);
    const finalEnd = new Date(finalStart.getTime() + dureeFinale * 60000);

    const openingTime = combineDateAndTime(formData.start, "08:30");
    const closingTime = combineDateAndTime(formData.start, "17:00");
    if (finalStart < openingTime || finalEnd > closingTime) {
      toast.error(
        `Veuillez choisir une heure entre 08:30 et 17:00 (la séance dure ${dureeFinale} min).`,
      );
      return;
    }

    const evenementsDuJour = events.filter(
      (p) =>
        p.id !== editingEvent?.id && isSameDay(new Date(p.start), finalStart),
    );
    if (evenementsDuJour.length >= MAX_RESERVATIONS_PAR_JOUR) {
      toast.error(
        `Vous ne pouvez pas réserver plus de ${MAX_RESERVATIONS_PAR_JOUR} créneaux par jour.`,
      );
      return;
    }

    const chevauchement = evenementsDuJour.find((p) => {
      const debutExistant = new Date(p.start);
      const finExistante = new Date(p.end);
      return finalStart < finExistante && finalEnd > debutExistant;
    });
    if (chevauchement) {
      toast.error(
        `Ce créneau chevauche une réservation existante (${chevauchement.nom}).`,
      );
      return;
    }

    // Construction du FormData
    const formPayload = new FormData();
    formPayload.append("start", finalStart.toISOString());
    prestationIds.forEach((id) =>
      formPayload.append("prestationIds", String(id)),
    );
    if (formData.description)
      formPayload.append("description", formData.description);

    // Gestion de l'image
    const fileInput = document.querySelector(
      'input[name="picture"]',
    ) as HTMLInputElement;
    if (fileInput?.files?.[0]) {
      formPayload.append("picture", fileInput.files[0]);
    }

    try {
      if (editingEvent) {
        await connect.put(`/api/reservations/${editingEvent.id}`, formPayload);
        toast.success("Réservation modifiée avec succès");
      } else {
        await connect.post("/api/reservations", formPayload);
        toast.success("Réservation créée avec succès");
      }
      await fetchReservations();
      setOpen(false);
      seteditingEvent(null);
      setselectedslot(null);
      setCategorieSelect([]);
      setSelectedServices([]);
      setSaveData(null);
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Une erreur s'est produite.");
    }
  };

  const handleSelectEvent = (p: Calendarevent) => {
    const limiteAnnulation = subHours(
      new Date(p.start),
      DELAI_ANNULATION_HEURES,
    );
    const modificationPossible = isBefore(new Date(), limiteAnnulation);

    if (!modificationPossible) {
      setRestrictedEvent(p);
      setOpenRestricted(true);
      return;
    }

    seteditingEvent(p);
    setselectedslot({ start: p.start, end: p.end });
    setCategorieSelect(p.categories);
    setSelectedServices(p.servicesSelectionnes);
    setformData({
      id: p.id,
      description: p.description || "",
      picture: p.picture || "",
      start: p.start,
      end: p.end,
      starttime: p.starttime,
      color: p.color,
      prix: p.prix,
      duree: p.duree,
      nom: p.nom,
      slug: p.slug,
      descriptionComplete: p.descriptionComplete,
      categories: p.categories,
      servicesSelectionnes: p.servicesSelectionnes,
    });
    setOpen(true);
  };

  const handleAnnulerClick = (p: Calendarevent) => {
    setOpen(false);
    setCancelEvent(p);
    setOpenCancel(true);
  };

  const handleAnnulerConfirm = async () => {
    if (!cancelEvent) return;

    try {
      await connect.patch(`/api/reservations/${cancelEvent.id}/cancel-mine`);
      toast.success(
        `Votre réservation "${cancelEvent.nom}" a bien été annulée.`,
      );
      await fetchReservations();
      setOpenCancel(false);
      setCancelEvent(null);
      seteditingEvent(null);
      setOpen(false);
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Erreur lors de l'annulation");
      setOpenCancel(false);
      setCancelEvent(null);
    }
  };

  // Calculs pour l'affichage
  const uniqueService = [
    ...new Map(servicesData.map((p) => [p.categorie, p])).values(),
  ];

  const handleCategorieSelect = (categorie: string) => {
    setCategorieSelect((prev) =>
      prev.includes(categorie)
        ? prev.filter((p) => p !== categorie)
        : [...prev, categorie],
    );
    setSelectedServices((prev) =>
      prev.filter((p) => p.categorie !== categorie),
    );
  };

  const handleSousCategorieSelect = (service: ServiceItem) => {
    setSelectedServices((prev) => {
      const dejaSelectionne = prev.find((p) => p.id === service.id);
      if (dejaSelectionne) {
        return prev.filter((p) => p.id !== service.id);
      }
      const sansMemeCategorie = prev.filter(
        (p) => p.categorie !== service.categorie,
      );
      return [...sansMemeCategorie, service];
    });
  };

  const uniqueSousCategorie = [
    ...new Map(servicesData.map((p) => [p.nom, p])).values(),
  ].filter((p) => CategorieSelect.includes(p.categorie));

  const sousCategorieParCategorie = CategorieSelect.map((categorie) => ({
    categorie,
    items: uniqueSousCategorie.filter((p) => p.categorie === categorie),
  }));

  const totalPrix = (selected: ServiceItem[]) =>
    selected.reduce((sum, p) => sum + Number(p.prix || 0), 0);
  const totalDuree = (selected: ServiceItem[]) =>
    selected.reduce((sum, p) => sum + Number(p.duree || 0), 0);
  const titreCombine = selectedServices.map((p) => p.nom).join(" + ");
  const descriptionCombine = selectedServices
    .map((p) => p.descriptionComplete)
    .filter(Boolean)
    .join(" | ");

  const affichageNom = titreCombine || saveData?.nom || formData.nom;
  const affichageDescription =
    descriptionCombine ||
    saveData?.descriptionComplete ||
    formData.descriptionComplete;
  const affichagePrix = selectedServices.length
    ? totalPrix(selectedServices)
    : saveData?.prix || formData.prix;
  const affichageDuree = selectedServices.length
    ? totalDuree(selectedServices)
    : saveData?.duree || formData.duree;

  const quotaJourSelectionne = nombreReservationsDuJour(
    formData.start,
    editingEvent?.id,
  );

  const mintime = new Date();
  mintime.setHours(8, 30, 0, 0);
  const maxtime = new Date();
  maxtime.setHours(17, 0, 0, 0);

  const isWeekend = (date: Date) => date.getDay() === 0;

  const dayPropGetter = (date: Date) => {
    if (isWeekend(date)) {
      return {
        style: {
          backgroundColor: "#e0e0e0",
          pointerEvents: "none" as const,
        },
      };
    }
    if (nombreReservationsDuJour(date) >= MAX_RESERVATIONS_PAR_JOUR) {
      return {
        style: {
          backgroundColor: "#fbe1e1",
        },
      };
    }
    return {};
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100vh",
      }}
    >
      <div className="btnRetour">
        <Button className="succes" onClick={() => navigate(-1)}>
          Retour
        </Button>
      </div>
      <div className="CalendarHeader">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          min={mintime}
          max={maxtime}
          messages={{
            next: "Suivant",
            previous: "Précédent",
            today: "Aujourd'hui",
            month: "Mois",
            week: "Semaine",
            day: "Jour",
            agenda: "Agenda",
            date: "Date",
            time: "Heure",
            event: "Événement",
            noEventsInRange: "Aucun événement sur cette période.",
            showMore: (total) => `+ ${total} de plus`,
          }}
          formats={{
            monthHeaderFormat: (date: Date) =>
              format(date, "MMMM yyyy", { locale: fr }),
            dayHeaderFormat: (date: Date) =>
              format(date, "EEEE d MMMM yyyy", { locale: fr }),
            dayRangeHeaderFormat: ({ start, end }) =>
              `${format(start, "d MMM", { locale: fr })} – ${format(
                end,
                "d MMM yyyy",
                { locale: fr },
              )}`,
            weekdayFormat: (date: Date) => format(date, "EEEE", { locale: fr }),
            dayFormat: (date: Date) => format(date, "dd EEE", { locale: fr }),
            timeGutterFormat: (date: Date) =>
              format(date, "HH:mm", { locale: fr }),
            eventTimeRangeFormat: ({ start, end }) =>
              `${format(start, "HH:mm", { locale: fr })} – ${format(
                end,
                "HH:mm",
                { locale: fr },
              )}`,
            agendaDateFormat: (date: Date) =>
              format(date, "EEE d MMM", { locale: fr }),
            agendaTimeFormat: (date: Date) =>
              format(date, "HH:mm", { locale: fr }),
            agendaTimeRangeFormat: ({ start, end }) =>
              `${format(start, "HH:mm", { locale: fr })} – ${format(
                end,
                "HH:mm",
                { locale: fr },
              )}`,
          }}
          onNavigate={(newDate) => setCurrentDate(newDate)}
          date={currentDate}
          view={currentView}
          onView={(newView) => setCurrentView(newView)}
          style={{ height: "100%", width: "100%" }}
          selectable
          onSelectSlot={handleSelectCase}
          onSelectEvent={handleSelectEvent}
          dayPropGetter={dayPropGetter}
          components={{
            event: ({ event }) => (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "10px",
                  fontFamily: "var(--police1)",
                  fontSize: "12px",
                }}
              >
                <strong>{event.nom}</strong>
                {event.picture && (
                  <img
                    src={event.picture}
                    width={30}
                    height={30}
                    style={{ borderRadius: "50%" }}
                    alt=""
                  />
                )}
              </div>
            ),
          }}
          eventPropGetter={(event) => ({
            style: {
              backgroundColor: event.color,
              borderRadius: "6px",
              color: "white",
              border: "none",
            },
          })}
        />
      </div>

      {/* Formulaire de création / modification */}
      {open && (
        <Dialog
          open={open}
          onClose={handleClose}
          className="custom-dialog"
          maxWidth="md"
          fullWidth
        >
          <div className="customCalendar">
            <DialogTitle id="alert-dialog-title">
              {editingEvent
                ? "✏️ Modifier mon rendez-vous"
                : "📅 Prendre rendez-vous"}
            </DialogTitle>
            <DialogContent>
              <DialogContentText
                id="alert-dialog-title"
                style={{ color: "white" }}
              >
                Veuillez remplir tout les champs
              </DialogContentText>
              <div className="CalendarForm">
                <form onSubmit={handlesubmit}>
                  <div className="">
                    <p>
                      {affichageNom
                        ? "Vous pouvez ajouter ou modifier d'autres categories "
                        : "Veuillez choisir votre categorie"}
                      : {CategorieSelect.join(" + ")}
                    </p>
                    <div className="CalendarFormCardSelect" id="">
                      {uniqueService.map((p) => (
                        <div
                          className={`CalendarFormCardSelectEvent ${
                            CategorieSelect.includes(p.categorie)
                              ? "active"
                              : ""
                          }`}
                          key={p.id}
                        >
                          <p onClick={() => handleCategorieSelect(p.categorie)}>
                            {p.categorie}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                  {CategorieSelect.length > 0 && (
                    <div className="">
                      <p>
                        Veuillez choisir votre sous-categorie : {titreCombine}
                      </p>
                      {sousCategorieParCategorie.map((groupe) => (
                        <div
                          className="CalendarFormSousCategorieGroupe"
                          key={groupe.categorie}
                        >
                          <p className="CalendarFormSousCategorieTitre">
                            {groupe.categorie}
                          </p>
                          <div className="CalendarFormCardSelect" id="">
                            {groupe.items.map((p) => (
                              <div
                                className={`CalendarFormCardSelectEvent ${
                                  selectedServices.some((s) => s.id === p.id)
                                    ? "active"
                                    : ""
                                }`}
                                key={p.id}
                              >
                                <p onClick={() => handleSousCategorieSelect(p)}>
                                  {p.nom}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {affichageNom && (
                    <>
                      <div className="CalendarFormCard">
                        <p>
                          Titre : <span> {affichageNom}</span>
                        </p>
                      </div>
                      <div className="CalendarFormCard">
                        <p>
                          Description : <span> {affichageDescription}</span>
                        </p>
                      </div>
                      <div className="CalendarFormCard">
                        <p>
                          Prix : <span> {affichagePrix} €</span>
                        </p>
                      </div>
                      <div className="CalendarFormCard">
                        <p>
                          Durée : <span> {affichageDuree} minutes</span>
                        </p>
                      </div>
                    </>
                  )}
                  <div className="">
                    <p>Description supplementaire</p>
                    <textarea
                      name="description"
                      id="CalendarFormCardArea"
                      value={formData.description}
                      placeholder="Veuillez ajouter une description supplémentaire si besoin"
                      onChange={handlechange}
                    />
                  </div>
                  <div className="">
                    <p>Jour du rendez-vous </p>
                    <input
                      type="date"
                      name="start"
                      id="CalendarFormCardHour"
                      value={format(formData.start, "yyyy-MM-dd")}
                      onChange={handleDateChange}
                    />
                    <p style={{ fontSize: "12px", opacity: 0.8 }}>
                      {quotaJourSelectionne >= MAX_RESERVATIONS_PAR_JOUR
                        ? "⚠️ Vous avez déjà atteint le maximum de réservations pour ce jour."
                        : `Réservations ce jour-là : ${quotaJourSelectionne}/${MAX_RESERVATIONS_PAR_JOUR}`}
                    </p>
                  </div>
                  <div className="">
                    <p>
                      Heure du rendez-vous{" "}
                      <span style={{ color: "red" }}>*</span>
                    </p>
                    <input
                      type="time"
                      name="starttime"
                      id="CalendarFormCardHour"
                      value={formData.starttime}
                      onChange={handlechange}
                      min="08:30"
                      max="17:00"
                    />
                  </div>
                  <div className="CalendarFormCardPicure">
                    <p>Vous voulez ajouter une photo de votre modèle?</p>
                    {formData.picture && <img src={formData.picture} alt="" />}
                    <input
                      type="file"
                      name="picture"
                      onChange={handlechangePicture}
                      accept="image/*"
                    />
                  </div>
                  <div className="ButonClendar">
                    <Button className="error" onClick={() => setOpen(false)}>
                      Annuler
                    </Button>
                    {editingEvent && (
                      <Button
                        className="warning"
                        type="button"
                        onClick={() => handleAnnulerClick(editingEvent)}
                      >
                        Annuler la réservation
                      </Button>
                    )}
                    <Button className="succes" type="submit">
                      Confirmer
                    </Button>
                  </div>
                </form>
              </div>
            </DialogContent>
          </div>
        </Dialog>
      )}

      {/* Confirmation d'annulation */}
      {openCancel && cancelEvent && (
        <Dialog
          open={openCancel}
          onClose={() => setOpenCancel(false)}
          className="custom-dialog"
          maxWidth="md"
          fullWidth
        >
          <div className="customCalendar">
            <DialogTitle id="alert-dialog-title">
              Voulez-vous annuler ce rendez-vous ?
            </DialogTitle>
            <DialogContent>
              <DialogContentText
                id="alert-dialog-title"
                style={{ color: "white" }}
              >
                {cancelEvent.nom} —{" "}
                {format(new Date(cancelEvent.start), "EEEE d MMMM 'à' HH:mm", {
                  locale: fr,
                })}
              </DialogContentText>
              <div className="CalendarForm">
                <div className="ButonClendar">
                  <Button className="error" onClick={handleAnnulerConfirm}>
                    OUI, annuler
                  </Button>
                  <Button
                    className="succes"
                    onClick={() => {
                      setOpen(true);
                      setOpenCancel(false);
                    }}
                  >
                    NON
                  </Button>
                </div>
              </div>
            </DialogContent>
          </div>
        </Dialog>
      )}

      {/* Consultation restreinte (moins de 24h) */}
      {openRestricted && restrictedEvent && (
        <Dialog
          open={openRestricted}
          onClose={() => setOpenRestricted(false)}
          className="custom-dialog"
          maxWidth="sm"
          fullWidth
        >
          <div className="customCalendar">
            <DialogTitle id="alert-dialog-title">
              Rendez-vous dans moins de {DELAI_ANNULATION_HEURES}h
            </DialogTitle>
            <DialogContent>
              <DialogContentText
                id="alert-dialog-title"
                style={{ color: "white" }}
              >
                Ce rendez-vous débute le{" "}
                {format(
                  new Date(restrictedEvent.start),
                  "EEEE d MMMM 'à' HH:mm",
                  { locale: fr },
                )}
                . Passé ce délai, seul le salon peut le modifier ou l'annuler —
                merci de le contacter directement.
              </DialogContentText>
              <div className="CalendarFormCard">
                <p>
                  Prestation : <span>{restrictedEvent.nom}</span>
                </p>
              </div>
              {restrictedEvent.description && (
                <div className="CalendarFormCard">
                  <p>
                    Description : <span>{restrictedEvent.description}</span>
                  </p>
                </div>
              )}
              <div className="CalendarFormCard">
                <p>
                  Prix : <span>{restrictedEvent.prix} €</span>
                </p>
              </div>
              <div className="ButonClendar">
                <a
                  className="succes ButtonLike"
                  href={`tel:${CONTACT_TELEPHONE}`}
                >
                  Appeler le salon
                </a>
                <a
                  className="warning ButtonLike"
                  href={`mailto:${CONTACT_EMAIL}`}
                >
                  Envoyer un email
                </a>
                <Button
                  className="error"
                  onClick={() => setOpenRestricted(false)}
                >
                  Fermer
                </Button>
              </div>
            </DialogContent>
          </div>
        </Dialog>
      )}
    </div>
  );
};

export default Calendrier;
