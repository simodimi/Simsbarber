import SiderbarAdmin from "../components/SiderbarAdmin";
import { useEffect, useState } from "react";
import Button from "../ui/Button";
import { useLocation, useNavigate } from "react-router-dom";
import { Calendar, dateFnsLocalizer, type View } from "react-big-calendar";
import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import isSameDay from "date-fns/isSameDay";
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

const API_BASE = "http://localhost:5000";

interface ServiceItem {
  id: number;
  nom: string;
  categorie: string;
  prix: number;
  duree: number;
  descriptionComplete: string;
}

//evenements calendrier
interface Calendarevent {
  id: string;
  userName?: string;
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
  userId?: number;
}
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }), // 1 = Lundi
  getDay,
  locales: { fr },
});
//combine une date (jour/mois/année) avec une heure "HH:mm" en un seul objet Date
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
const Planning = () => {
  const [events, setEvents] = useState<Calendarevent[]>([]);
  const navigate = useNavigate();
  const location = useLocation();
  //permet de naviguer entre les mois,semaines,jours
  const [currentDate, setCurrentDate] = useState(new Date());
  //permet de changer le mode d'affichage (mois/semaine/jour/agenda)
  const [currentView, setCurrentView] = useState<View>("month");
  //modal
  const [open, setOpen] = useState<boolean>(false);
  const [open1, setOpen1] = useState<boolean>(false);
  const [selectedslot, setselectedslot] = useState<{
    start: Date;
    end: Date;
  } | null>(null);
  //suppresion (en réalité : annulation, voir handleDeletes)
  const [deleteEvent, setedeleteEvent] = useState<Calendarevent | null>(null);
  //édition
  const [editingEvent, seteditingEvent] = useState<Calendarevent | null>(null);
  const [initialSnapshot, setInitialSnapshot] = useState<string | null>(null);

  const buildSignature = (data: {
    description?: string;
    starttime: string;
    start: Date;
    servicesIds: number[];
    picture?: string;
  }) =>
    JSON.stringify({
      description: data.description || "",
      starttime: data.starttime,
      start: format(data.start, "yyyy-MM-dd"),
      services: [...data.servicesIds].sort((a, b) => a - b),
      picture: data.picture || "",
    });
  // ── Prestations réelles (remplace l'import statique "services" de Bdd) ──
  const [servicesData, setservicesData] = useState<ServiceItem[]>([]);
  const fetchPrestations = async () => {
    const res = await connect.get("/api/prestations");
    setservicesData(
      res.data.map((p: any) => ({
        id: p.id,
        nom: p.nom,
        categorie: p.category?.nom || "",
        prix: p.prix,
        duree: p.duree,
        descriptionComplete: p.descriptionComplete,
      })),
    );
  };

  // ── Clients réels, pour la liste déroulante de création ──
  const [clients, setclients] = useState<
    { id: number; nameUser: string; mailUser: string }[]
  >([]);
  const [selectedUserId, setselectedUserId] = useState<number | null>(null);
  const fetchClients = async () => {
    const res = await connect.get("/api/clients");
    setclients(res.data);
  };

  // ── Filtre "réservations d'un seul client", arrivé depuis Client.tsx ──
  const [filterUserId, setfilterUserId] = useState<number | null>(
    (location.state as any)?.filterUserId ?? null,
  );
  const filterUserName = (location.state as any)?.filterUserName;

  // ── Chargement + adaptation des vraies réservations ──
  const fetchReservations = async () => {
    const res = await connect.get("/api/reservations", {
      params: filterUserId ? { userId: filterUserId } : {},
    });
    const adapte: Calendarevent[] = res.data.map((r: any) => ({
      id: String(r.id),
      userName: r.user?.nameUser || "Client inconnu",
      description: r.description || "",
      picture: r.pictureUrl ? `${API_BASE}${r.pictureUrl}` : "",
      start: new Date(r.start),
      end: new Date(r.end),
      starttime: new Date(r.start).toTimeString().slice(0, 5),
      // rouge forcé si annulé, peu importe la couleur choisie à la création
      color:
        r.status === "ANNULE"
          ? "#e6194b"
          : r.color || getColorForCategorie(r.titre?.split(" ")[0] || ""),
      prix: String(r.prixTotal),
      duree: String(r.dureeTotal),
      nom: r.titre,
      slug: "",
      descriptionComplete: r.descriptionComplete,
      categories: (r.prestations || []).map((p: any) => p.category?.nom || ""),
      servicesSelectionnes: (r.prestations || []).map((p: any) => ({
        id: p.id,
        nom: p.nom,
        categorie: p.category?.nom || "",
        prix: p.ReservationPrestation?.prixSnapshot ?? p.prix,
        duree: p.duree,
        descriptionComplete: p.descriptionComplete,
      })),
      status: r.status,
      userId: r.userId,
    }));
    setEvents(adapte);
  };

  useEffect(() => {
    fetchPrestations();
    fetchClients();
  }, []);

  useEffect(() => {
    fetchReservations();
  }, [filterUserId]);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterUserId]);

  const [formData, setformData] = useState<Calendarevent>({
    id: `${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    description: "",
    picture: "",
    start: new Date(),
    end: new Date(),
    starttime: "",
    color: "",
    prix: "",
    duree: "",
    nom: "",
    slug: "",
    descriptionComplete: "",
    categories: [],
    servicesSelectionnes: [],
  });
  const handleClose = () => {
    setOpen(false);
  };

  //gestionnaire de clic
  const handleSelectCase = (p: { start: Date; end: Date }) => {
    setselectedslot(p);
    seteditingEvent(null);
    setCategorieSelect([]);
    setSelectedServices([]);
    setcolorSelect("Bleu");
    setselectedUserId(null);
    setselectedPictureFile(null);
    setformData({
      id: `${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      description: "",
      picture: "",
      start: p.start,
      end: p.end,
      starttime: "",
      color: "#3174ad",
      prix: "",
      duree: "",
      nom: "",
      slug: "",
      descriptionComplete: "",
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
    const value = e.target.value; // "yyyy-MM-dd"
    if (!value) return;
    setformData((prev) => ({
      ...prev,
      start: parse(value, "yyyy-MM-dd", new Date()),
    }));
  };

  // Le VRAI fichier est gardé à part (selectedPictureFile), l'aperçu
  // base64 (formData.picture) ne sert plus qu'à l'affichage.
  const [selectedPictureFile, setselectedPictureFile] = useState<File | null>(
    null,
  );
  const handlechangePicture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setselectedPictureFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setformData((prev) => ({
        ...prev,
        picture: reader.result as string,
      }));
    };
    reader.readAsDataURL(file);
  };
  const [colorSelect, setcolorSelect] = useState("Bleu");

  const handleSelectColor = (p: string) => {
    setcolorSelect(p);
  };
  const handleClickColor = (p: string) => {
    setformData((prev) => ({ ...prev, color: p }));
  };

  const handlesubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    //reserver apres la date actuelle
    const aujourdhui = new Date();
    aujourdhui.setHours(0, 0, 0, 0);
    const today = new Date(formData.start);
    today.setHours(0, 0, 0, 0);
    if (aujourdhui > today) {
      const date = new Date().toLocaleDateString();
      toast.error(
        `Vous ne pouvez pas sélectionner une date inférieur au ${date}`,
      );
      return;
    }
    if (!formData.starttime) {
      toast.error("Veuillez remplir tous les champs avec *");
      return;
    }
    if (selectedServices.length === 0 && !editingEvent) {
      toast.error(
        "Veuillez choisir au moins une catégorie et une sous-catégorie.",
      );
      return;
    }
    if (!editingEvent && !selectedUserId) {
      toast.error("Veuillez choisir un client");
      return;
    }

    //durée finale de la prestation (en minutes)
    const dureeFinale = selectedServices.length
      ? totalDuree
      : Number(formData.duree || 30);

    const finalStart = combineDateAndTime(formData.start, formData.starttime);
    const finalEnd = new Date(finalStart.getTime() + dureeFinale * 60000);

    //horaires d'ouverture
    const openingTime = combineDateAndTime(formData.start, "08:30");
    const closingTime = combineDateAndTime(formData.start, "17:00");
    if (finalStart < openingTime || finalEnd > closingTime) {
      toast.error(
        `Veuillez choisir une heure entre 08:30 et 17:00 (la séance dure ${dureeFinale} min et doit se terminer avant 17:00).`,
      );
      return;
    }

    //tous les évenements du même jour, en excluant l'évenement en cours d'édition
    //(contrôle instantané côté front — le backend revalide de toute façon
    //la même règle avant d'enregistrer réellement)
    const evenementsDuJour = events.filter(
      (p) =>
        p.id !== editingEvent?.id && isSameDay(new Date(p.start), finalStart),
    );

    if (evenementsDuJour.length >= 2) {
      toast.error("Vous ne pouvez pas réserver plus de 2 créneaux par jour.");
      return;
    }

    const chevauchement = evenementsDuJour.find((p) => {
      const debutExistant = new Date(p.start);
      const finExistante = new Date(p.end);
      return finalStart < finExistante && finalEnd > debutExistant;
    });
    if (chevauchement) {
      toast.error(
        `Ce créneau chevauche une réservation existante (${chevauchement.nom}). Veuillez choisir une heure à partir de ${format(new Date(chevauchement.end), "HH:mm")}.`,
      );
      return;
    }

    const formPayload = new FormData();
    if (selectedUserId) formPayload.append("userId", String(selectedUserId));
    formPayload.append("start", finalStart.toISOString());
    selectedServices.forEach((s) =>
      formPayload.append("prestationIds", String(s.id)),
    );
    formPayload.append("description", formData.description || "");
    if (selectedPictureFile) formPayload.append("picture", selectedPictureFile);
    if (formData.color) formPayload.append("color", formData.color);
    try {
      if (editingEvent) {
        await connect.put(`/api/reservations/${editingEvent.id}`, formPayload);
        toast.success("Réservation modifiée avec succès");
      } else {
        await connect.post("/api/reservations/admin", formPayload);
        toast.success("Réservation créée avec succès");
      }
      await fetchReservations();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Une erreur s'est produite.");
      return;
    }

    setOpen(false);
    seteditingEvent(null);
    setselectedslot(null);
    setCategorieSelect([]);
    setSelectedServices([]);
    setcolorSelect("Bleu");
    setselectedUserId(null);
    setselectedPictureFile(null);
  };
  const handleSelectEvent = (p: Calendarevent) => {
    seteditingEvent(p);
    setselectedslot({ start: p.start, end: p.end });
    setCategorieSelect(p.categories);
    setSelectedServices(p.servicesSelectionnes);
    setselectedUserId(p.userId ?? null);
    setselectedPictureFile(null);
    const matchingColor = COLORS.find((c) => c.value === p.color);
    setcolorSelect(matchingColor ? matchingColor.label : "Bleu");
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
    setInitialSnapshot(
      buildSignature({
        description: p.description,
        starttime: p.starttime,
        start: p.start,
        servicesIds: p.servicesSelectionnes.map((s) => s.id),
        picture: p.picture,
      }),
    );
    setOpen(true);
    console.log(selectedslot);
  };

  //annulation (pas suppression définitive) — voir handleDeletes
  const handleDelete = (p: Calendarevent) => {
    setedeleteEvent(p);
    setOpen1(true);
  };
  const handleDeletes = async () => {
    if (deleteEvent) {
      try {
        await connect.patch(`/api/reservations/${deleteEvent.id}/cancel`);
        toast.success(`Réservation de ${deleteEvent.nom} annulée`);
        await fetchReservations();
      } catch (err: any) {
        toast.error(err.response?.data?.error || "Une erreur s'est produite.");
      }
    }
    seteditingEvent(null);
    setedeleteEvent(null);
    setselectedslot(null);
    setOpen1(false);
    setOpen(false);
  };
  //plager des heures
  const mintime = new Date();
  mintime.setHours(8, 30, 0, 0);
  const maxtime = new Date();
  maxtime.setHours(17, 0, 0, 0);
  //griser les weekends
  const isWeekend = (date: Date) => {
    const day = date.getDay();
    return day === 0;
  };
  const dayPropGetter = (date: Date) => {
    if (isWeekend(date)) {
      return {
        style: {
          backgroundColor: "#e0e0e0",
          pointerEvents: "none" as const,
        },
      };
    }
    return {};
  };
  //selection des catégories
  const [CategorieSelect, setCategorieSelect] = useState<string[]>([]);
  const [selectedServices, setSelectedServices] = useState<ServiceItem[]>([]);

  //eviter les doublons dans un tableau d'objet
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
  const totalPrix = selectedServices.reduce(
    (sum, p) => sum + Number(p.prix || 0),
    0,
  );
  const totalDuree = selectedServices.reduce(
    (sum, p) => sum + Number(p.duree || 0),
    0,
  );
  const titreCombine = selectedServices.map((p) => p.nom).join(" + ");
  const descriptionCombine = selectedServices
    .map((p) => p.descriptionComplete)
    .filter(Boolean)
    .join(" | ");

  //valeurs affichées dans le récapitulatif : priorité aux nouvelles
  //sélections, puis à l'évenement en cours d'édition (formData)
  const affichageNom = titreCombine || formData.nom;
  const affichageDescription =
    descriptionCombine || formData.descriptionComplete;
  const affichagePrix = selectedServices.length ? totalPrix : formData.prix;
  const affichageDuree = selectedServices.length ? totalDuree : formData.duree;

  const hasChanges =
    !editingEvent ||
    initialSnapshot !==
      buildSignature({
        description: formData.description,
        starttime: formData.starttime,
        start: formData.start,
        servicesIds: selectedServices.map((s) => s.id),
        picture: formData.picture,
      });
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100vh",
      }}
    >
      <SiderbarAdmin />
      <div className="btnRetour">
        <Button className="succes" onClick={() => navigate(-1)}>
          Retour
        </Button>
      </div>
      {filterUserId && (
        <div className="FilterClientHeaderBtns" style={{ margin: "10px 0" }}>
          <p>
            Réservations de : <strong>{filterUserName}</strong>
          </p>
          <Button className="warning" onClick={() => setfilterUserId(null)}>
            Voir toutes les réservations
          </Button>
        </div>
      )}
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

            dayRangeHeaderFormat: ({
              start,
              end,
            }: {
              start: Date;
              end: Date;
            }) =>
              `${format(start, "d MMM", { locale: fr })} – ${format(end, "d MMM yyyy", { locale: fr })}`,

            weekdayFormat: (date: Date) => format(date, "EEEE", { locale: fr }),

            dayFormat: (date: Date) => format(date, "dd EEE", { locale: fr }),

            timeGutterFormat: (date: Date) =>
              format(date, "HH:mm", { locale: fr }),

            eventTimeRangeFormat: ({
              start,
              end,
            }: {
              start: Date;
              end: Date;
            }) =>
              `${format(start, "HH:mm", { locale: fr })} – ${format(end, "HH:mm", { locale: fr })}`,

            agendaDateFormat: (date: Date) =>
              format(date, "EEE d MMM", { locale: fr }),

            agendaTimeFormat: (date: Date) =>
              format(date, "HH:mm", { locale: fr }),

            agendaTimeRangeFormat: ({
              start,
              end,
            }: {
              start: Date;
              end: Date;
            }) =>
              `${format(start, "HH:mm", { locale: fr })} – ${format(end, "HH:mm", { locale: fr })}`,
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
                className=""
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "10px",
                  fontFamily: "var(--police1)",
                  fontSize: "12px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <strong>{event.nom}</strong>
                  <span style={{ fontSize: "10px" }}>{event.userName}</span>
                </div>
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
                ? "✏️ Modifier un évenement"
                : "➕ Ajouter un évenement"}
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
                  {!editingEvent && (
                    <div className="">
                      <p>
                        Client <span style={{ color: "red" }}>*</span>
                      </p>
                      <select
                        value={selectedUserId ?? ""}
                        onChange={(e) =>
                          setselectedUserId(Number(e.target.value))
                        }
                      >
                        <option value="">-- Choisir un client --</option>
                        {clients.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.nameUser} ({c.mailUser})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
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
                          className={`CalendarFormCardSelectEvent ${CategorieSelect.includes(p.categorie) ? "active" : ""}`}
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
                                className={`CalendarFormCardSelectEvent ${selectedServices.some((s) => s.id === p.id) ? "active" : ""}`}
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
                  <div className="">
                    <p>
                      Couleur de l'évenement : <span>{colorSelect}</span>
                    </p>
                    <div className="CouleurCard">
                      {COLORS.map((p) => (
                        <div className="CouleurEvent" key={p.value}>
                          <p
                            style={{
                              backgroundColor: p.value,
                            }}
                            className={`borderCard ${colorSelect === p.label ? "active" : ""}`}
                            onClick={() => {
                              handleSelectColor(p.label);
                              handleClickColor(p.value);
                            }}
                          ></p>
                          <span>{p.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="ButonClendars">
                    <Button className="error" onClick={() => setOpen(false)}>
                      Annuler
                    </Button>
                    {editingEvent && (
                      <Button
                        className="warning"
                        type="button"
                        onClick={() => handleDelete(editingEvent)}
                      >
                        Annuler la réservation
                      </Button>
                    )}
                    {editingEvent && editingEvent.status !== "TERMINE" && (
                      <Button
                        className="succes"
                        type="button"
                        onClick={async () => {
                          await connect.patch(
                            `/api/reservations/${editingEvent.id}/complete`,
                          );
                          toast.success("Prestation marquée comme terminée");
                          await fetchReservations();
                          setOpen(false);
                        }}
                      >
                        Marquer comme terminé
                      </Button>
                    )}
                    {editingEvent && editingEvent.status === "TERMINE" && (
                      <Button
                        className="warning"
                        type="button"
                        onClick={async () => {
                          await connect.patch(
                            `/api/reservations/${editingEvent.id}/reopen`,
                          );
                          toast.success('Statut remis à "confirmé"');
                          await fetchReservations();
                          setOpen(false);
                        }}
                      >
                        Annuler la validation
                      </Button>
                    )}
                    {(!editingEvent || hasChanges) && (
                      <Button className="succes" type="submit">
                        Confirmer
                      </Button>
                    )}
                  </div>
                </form>
              </div>
            </DialogContent>
          </div>
        </Dialog>
      )}
      {open1 && deleteEvent && (
        <Dialog
          open={open1}
          onClose={() => setOpen1(false)}
          className="custom-dialog"
          maxWidth="md"
          fullWidth
        >
          <div className="customCalendar">
            <DialogTitle id="alert-dialog-title">
              Voulez vous annuler cette réservation?
            </DialogTitle>
            <DialogContent>
              <DialogContentText
                id="alert-dialog-title"
                style={{ color: "white" }}
              >
                {deleteEvent.nom}
              </DialogContentText>
              <div className="CalendarForm">
                <div className="ButonClendar">
                  <Button className="error" onClick={handleDeletes}>
                    OUI
                  </Button>

                  <Button
                    className="succes"
                    onClick={() => {
                      setOpen(true);
                      setOpen1(false);
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
    </div>
  );
};

export default Planning;
