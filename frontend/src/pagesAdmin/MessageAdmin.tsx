import { useEffect, useRef, useState, type ChangeEvent } from "react";
import img from "../assets/icone/iachat.png";
import img2 from "../assets/icone/person.png";
import send from "../assets/icone/env.png";
import emoji from "../assets/icone/grinning.png";
import file from "../assets/icone/file.png";
import "../styles/prestation.css";
import Emoji from "../ui/Emoji";
import { toast } from "react-toastify";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import Button from "../ui/Button";
import SiderbarAdmin from "../components/SiderbarAdmin";
import connect from "../services/Util";
import { connectSocket } from "../services/socket";
import { useNotification } from "../services/NotificationContext";
interface bgprops {
  visualsms: null | number;
  avissms: null | number;
}

const MessageAdmin = ({ visualsms, avissms }: bgprops) => {
  interface nameuser {
    id: number;
    nom: string;
    photo: string;
    unread: number;
    lastMessageAt: number | null;
    lastMessageContent: string | null;
    lastMessageHasImage: boolean;
  }

  interface dataSms {
    id: string;
    message: string;
    hour: string;
    image?: string;
    sender: "home" | "away";
    timestamp: number;
  }

  // État pour les utilisateurs
  const [allUsers, setAllUsers] = useState<nameuser[]>([]);
  const [filterUser, setfilterUser] = useState<nameuser[]>([]);
  const [searchfilter, setsearchfilter] = useState<string>("");
  const [userSelect, setuserSelect] = useState<number | null>(null);
  const [visualuser, setvisualuser] = useState<nameuser | null>(null);
  const [conversation, setconversation] = useState<Record<number, dataSms[]>>(
    {},
  );

  // État pour l'écriture
  const [writeSms, setwriteSms] = useState<string>("");
  const [showEmoji, setshowEmoji] = useState<boolean>(false);
  const emojiref = useRef<HTMLDivElement | null>(null);
  const slideblock = useRef<HTMLDivElement | null>(null);
  const refphoto = useRef<HTMLInputElement | null>(null);

  // Dialog pour les images
  const [open, setopen] = useState(false);
  const [imageDialog, setimageDialog] = useState<dataSms | null>(null);
  const { refreshUnread } = useNotification();
  // Gestion des emojis
  useEffect(() => {
    const emoji = (e: MouseEvent) => {
      if (emojiref.current && !emojiref.current.contains(e.target as Node)) {
        setshowEmoji(false);
      }
    };
    document.addEventListener("mousedown", emoji);
    return () => {
      document.removeEventListener("mousedown", emoji);
    };
  }, []);
  useEffect(() => {
    const socket = connectSocket();
    const sync = () => fetchConversations();
    socket.on("message:new", sync);
    socket.on("message:broadcast", sync);
    return () => {
      socket.off("message:new", sync);
      socket.off("message:broadcast", sync);
    };
  }, []);
  // Récupération des conversations
  const fetchConversations = async () => {
    try {
      const [conversationsRes, broadcastsRes] = await Promise.all([
        connect.get("/api/messages/admin/conversations"),
        connect.get("/api/messages/admin/broadcast"),
      ]);

      const reels = conversationsRes.data.map((c: any) => ({
        id: c.userId,
        nom: c.nameUser,
        photo: c.photoUser
          ? c.photoUser.startsWith("http")
            ? c.photoUser
            : `http://localhost:5000${c.photoUser}`
          : img2,
        unread: c.unreadCount,
        lastMessageAt: c.lastMessageAt
          ? new Date(c.lastMessageAt).getTime()
          : null,
        lastMessageContent: c.lastMessageContent,
        lastMessageHasImage: c.lastMessageHasImage,
      }));

      // Récupération du dernier message envoyé à tous
      const broadcasts = broadcastsRes.data || [];

      const lastBroadcast =
        broadcasts.length > 0 ? broadcasts[broadcasts.length - 1] : null;

      const usersWithAll = [
        {
          id: -1,
          nom: "📢 Tous les utilisateurs",
          photo: img,
          unread: 0,

          lastMessageAt: lastBroadcast
            ? new Date(lastBroadcast.createdAt).getTime()
            : null,

          lastMessageContent: lastBroadcast?.content || null,

          lastMessageHasImage: !!lastBroadcast?.imageUrl,
        },

        ...reels,
      ];

      setAllUsers(usersWithAll);
      setfilterUser(usersWithAll);
    } catch (error) {
      console.error("Erreur lors du chargement des conversations:", error);

      toast.error("Erreur lors du chargement des contacts");
    }
  };
  useEffect(() => {
    fetchConversations();
  }, []);

  // Récupération des messages d'un utilisateur
  useEffect(() => {
    if (userSelect === null) return; // on retire l'exclusion de -1

    const fetchMessages = async () => {
      try {
        const url =
          userSelect === -1
            ? "/api/messages/admin/broadcast"
            : `/api/messages/admin/${userSelect}`;
        const res = await connect.get(url);
        const adapte = res.data.map((m: any) => ({
          id: String(m.id),
          message: m.content || "",
          hour: new Date(m.createdAt).toLocaleTimeString("fr-FR", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          image: m.imageUrl ? `http://localhost:5000${m.imageUrl}` : undefined, // sans le / en trop
          sender: m.senderType === "ADMIN" ? "home" : "away",
          timestamp: new Date(m.createdAt).getTime(),
        }));
        setconversation((prev) => ({ ...prev, [userSelect]: adapte }));

        if (userSelect !== -1) {
          setfilterUser((prev) =>
            prev.map((u) => (u.id === userSelect ? { ...u, unread: 0 } : u)),
          );
          refreshUnread();
        }
      } catch (error) {
        console.error("Erreur lors du chargement des messages:", error);
        toast.error("Erreur lors du chargement des messages");
      }
    };
    fetchMessages();
  }, [userSelect]);

  // Filtrage des utilisateurs
  const handlefilter = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setsearchfilter(value);

    if (value.trim() === "") {
      setfilterUser(allUsers);
    } else {
      const filtered = allUsers.filter((p) =>
        p.nom.toLowerCase().includes(value.toLowerCase()),
      );
      setfilterUser(filtered);
    }
  };

  // Changement de message
  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setwriteSms(e.target.value);
  };

  // Sélection d'emoji
  const handleEmojiSelect = (e: { emoji: string }) => {
    setwriteSms((prev) => prev + e.emoji);
  };

  // Envoi de message
  const handlesend = async () => {
    if (writeSms.trim() === "") {
      toast.error(
        "Message vide, veuillez saisir votre message avant d'envoyer",
      );
      return;
    }
    if (userSelect === null) {
      toast.error("Veuillez sélectionner un contact");
      return;
    }

    const formData = new FormData();
    formData.append("content", writeSms);

    try {
      if (userSelect === -1) {
        // Broadcast à tous
        await connect.post("/api/messages/admin/broadcast", formData);
        toast.success("📢 Message envoyé à tous les clients");

        // Rafraîchir la liste des conversations
        await fetchConversations();
      } else {
        /* // Envoi à un utilisateur spécifique
        await connect.post(`/api/messages/admin/${userSelect}`, formData);

        // Récupérer les messages mis à jour
        const res = await connect.get(`/api/messages/admin/${userSelect}`);
        const adapte = res.data.map((m: any) => ({
          id: String(m.id),
          message: m.content || "",
          hour: new Date(m.createdAt).toLocaleTimeString("fr-FR", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          image: m.imageUrl ? `http://localhost:5000${m.imageUrl}` : undefined,
          sender: m.senderType === "ADMIN" ? "home" : "away",
          timestamp: new Date(m.createdAt).getTime(),
        }));
        setconversation((prev) => ({ ...prev, [userSelect]: adapte }));*/
        const url =
          userSelect === -1
            ? "/api/messages/admin/broadcast"
            : `/api/messages/admin/${userSelect}`;

        await connect.post(url, formData);

        const res = await connect.get(url); // même URL pour relire, y compris broadcast
        const adapte = res.data.map((m: any) => ({
          id: String(m.id),
          message: m.content || "",
          hour: new Date(m.createdAt).toLocaleTimeString("fr-FR", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          image: m.imageUrl ? `http://localhost:5000${m.imageUrl}` : undefined,
          sender: m.senderType === "ADMIN" ? "home" : "away",
          timestamp: new Date(m.createdAt).getTime(),
        }));
        setconversation((prev) => ({ ...prev, [userSelect]: adapte }));

        await fetchConversations();
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi:", error);
      toast.error("Erreur lors de l'envoi du message");
    }

    setwriteSms("");
  };

  // Envoi de photo
  const handleChangePicture = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || userSelect === null) return;

    const formData = new FormData();
    formData.append("image", file);

    try {
      const url =
        userSelect === -1
          ? "/api/messages/admin/broadcast"
          : `/api/messages/admin/${userSelect}`;

      await connect.post(url, formData);

      if (userSelect !== -1) {
        const res = await connect.get(`/api/messages/admin/${userSelect}`);
        const adapte = res.data.map((m: any) => ({
          id: String(m.id),
          message: m.content || "",
          hour: new Date(m.createdAt).toLocaleTimeString("fr-FR", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          image: m.imageUrl ? `http://localhost:5000${m.imageUrl}` : undefined,
          sender: m.senderType === "ADMIN" ? "home" : "away",
          timestamp: new Date(m.createdAt).getTime(),
        }));
        setconversation((prev) => ({ ...prev, [userSelect]: adapte }));
        await fetchConversations();
      } else {
        toast.success("📷 Image envoyée à tous les clients");
        await fetchConversations();
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi de l'image:", error);
      toast.error("Erreur lors de l'envoi de l'image");
    }

    // Réinitialiser l'input file
    if (refphoto.current) {
      refphoto.current.value = "";
    }
  };

  // Socket pour les nouveaux messages
  /* useEffect(() => {
    const socket = connectSocket();
    socket.on("message:new", () => {
      fetchConversations();
      if (userSelect !== null && userSelect !== -1) {
        // Recharger les messages de l'utilisateur sélectionné
        connect.get(`/api/messages/admin/${userSelect}`).then((res) => {
          const adapte = res.data.map((m: any) => ({
            id: String(m.id),
            message: m.content || "",
            hour: new Date(m.createdAt).toLocaleTimeString("fr-FR", {
              hour: "2-digit",
              minute: "2-digit",
            }),
            image: m.imageUrl
              ? `http://localhost:5000${m.imageUrl}`
              : undefined,
            sender: m.senderType === "ADMIN" ? "home" : "away",
            timestamp: new Date(m.createdAt).getTime(),
          }));
          setconversation((prev) => ({ ...prev, [userSelect]: adapte }));
        });
      }
    });

    return () => {
      socket.off("message:new");
    };
  }, [userSelect]);*/
  useEffect(() => {
    const socket = connectSocket();

    const syncSelected = () => {
      if (userSelect === null) return;
      const url =
        userSelect === -1
          ? "/api/messages/admin/broadcast"
          : `/api/messages/admin/${userSelect}`;
      connect.get(url).then((res) => {
        const adapte = res.data.map((m: any) => ({
          id: String(m.id),
          message: m.content || "",
          hour: new Date(m.createdAt).toLocaleTimeString("fr-FR", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          image: m.imageUrl ? `http://localhost:5000${m.imageUrl}` : undefined,
          sender: m.senderType === "ADMIN" ? "home" : "away",
          timestamp: new Date(m.createdAt).getTime(),
        }));
        setconversation((prev) => ({ ...prev, [userSelect]: adapte }));
        refreshUnread();
      });
    };

    const onEvent = () => {
      fetchConversations();
      syncSelected();
    };

    socket.on("connect", onEvent);
    socket.on("message:new", onEvent);
    socket.on("message:broadcast", onEvent);

    return () => {
      socket.off("connect", onEvent);
      socket.off("message:new", onEvent);
      socket.off("message:broadcast", onEvent);
    };
  }, [userSelect]);
  // Navigation depuis les notifications
  useEffect(() => {
    const id = visualsms ?? avissms;
    if (id === null) return;
    const user = allUsers.find((p) => p.id === id);
    if (user) {
      setuserSelect(id);
      setvisualuser(user);
    }
  }, [visualsms, avissms, allUsers]);

  // Scroll automatique
  useEffect(() => {
    if (slideblock.current && conversation[userSelect || 0]?.length > 0) {
      slideblock.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [conversation, userSelect]);

  // Utilitaires pour les dates
  const formatDateLabel = (timestamp: number) => {
    const date = new Date(timestamp);
    const label = date.toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    return label.charAt(0).toUpperCase() + label.slice(1);
  };

  const isSameDay = (t1: number, t2: number) => {
    const d1 = new Date(t1);
    const d2 = new Date(t2);
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };

  // Données actuelles
  const messageCurrent = userSelect ? conversation[userSelect] || [] : [];
  /*const userOrder = [...filterUser].sort((a, b) => {
    const A = conversation[a.id]?.[conversation[a.id].length - 1];
    const B = conversation[b.id]?.[conversation[b.id].length - 1];
    const LastA = A ? A.timestamp : 0;
    const LastB = B ? B.timestamp : 0;
    return LastB - LastA;
  });*/

  return (
    <div className="AccueilHeaderAdmin">
      <div className="AccueilHome">
        <SiderbarAdmin />
      </div>

      <div className="ProfilMessageAdmin">
        <div className="ProfilMessageContact">
          <div className="ProfilMessageContacttitle">
            <h1 style={{ color: "white" }}>Mes Contacts</h1>
            <input
              type="search"
              name=""
              value={searchfilter}
              id=""
              placeholder="🔍 Saisir un nom"
              onChange={handlefilter}
            />
          </div>
          {filterUser.length > 0 ? (
            /* <div className="ProfilMessageContactCard">
              {userOrder.map((p) => {
                const Last =
                  conversation[p.id]?.[conversation[p.id].length - 1];
                return (
                  <div
                    className={`ProfilMessageContactCardPerson ${userSelect === p.id ? "active" : ""}`}
                    onClick={() => {
                      setuserSelect(p.id);
                      setvisualuser(p);
                    }}
                    key={p.id}
                  >
                    <img src={p.photo} alt="" />
                    {p.unread > 0 && (
                      <span className="unread-badge">{p.unread}</span>
                    )}
                    <div className="PrfilName">
                      <p>{p.nom}</p>
                      <p style={{ fontSize: "10px" }}>
                        {!Last
                          ? "Aucun message..."
                          : Last.image
                            ? "📷 Média"
                            : Last.message.length > 20
                              ? Last.message.slice(0, 20) + "..."
                              : Last.message}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>*/
            <div className="ProfilMessageContactCard">
              {filterUser.map((p) => {
                return (
                  <div
                    className={`ProfilMessageContactCardPerson ${userSelect === p.id ? "active" : ""}`}
                    onClick={() => {
                      setuserSelect(p.id);
                      setvisualuser(p);
                    }}
                    key={p.id}
                  >
                    <img src={p.photo} alt="" />
                    {p.unread > 0 && (
                      <span
                        style={{
                          position: "absolute",
                          top: "5px",
                          right: "5px",
                          backgroundColor: "green",
                          color: "white",
                          borderRadius: "50%",
                          padding: "2px 6px",
                          fontSize: "12px",
                          fontWeight: "bold",
                        }}
                      >
                        {p.unread}
                      </span>
                    )}
                    <div className="PrfilName">
                      <p>{p.nom}</p>
                      <p style={{ fontSize: "10px" }}>
                        {!p.lastMessageAt
                          ? "Aucun message..."
                          : p.lastMessageHasImage
                            ? "📷 Média"
                            : (p.lastMessageContent?.length ?? 0) > 20
                              ? p.lastMessageContent!.slice(0, 20) + "..."
                              : p.lastMessageContent}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="NoUser">
              <p>Aucun utilisateur trouvé</p>
            </div>
          )}
        </div>

        {userSelect ? (
          <div className="ProfilMessageContent">
            {visualuser && (
              <div className="ProfilMessageContentPerson">
                <img src={visualuser.photo} alt="" />
                <p>{visualuser.nom}</p>
                {visualuser.id === -1 && (
                  <span
                    style={{
                      fontSize: "12px",
                      color: "#666",
                      marginLeft: "10px",
                    }}
                  >
                    📢 Diffusion à tous
                  </span>
                )}
              </div>
            )}
            <div
              className="ProfilMessageContentSms"
              style={{
                backgroundRepeat: "no-repeat",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              {messageCurrent.map((p, index) => {
                const previous = messageCurrent[index - 1];
                const showDateBanner =
                  index === 0 || !isSameDay(p.timestamp, previous.timestamp);
                return (
                  <div className="" key={p.id}>
                    {showDateBanner && (
                      <div className="ProfilMessageContentSmsHour">
                        <p>{formatDateLabel(p.timestamp)}</p>
                      </div>
                    )}
                    {p.sender === "home" ? (
                      <div className="ProfilMessageContentSmsHome">
                        <p>{p.message}</p>
                        {p.image && (
                          <img
                            src={p.image}
                            alt="media envoyé"
                            className="message-image"
                            onClick={() => {
                              setimageDialog(p);
                              setopen(true);
                            }}
                          />
                        )}
                        <span> {p.hour}</span>
                      </div>
                    ) : (
                      <div className="ProfilMessageContentSmsAway">
                        <p> {p.message}</p>
                        {p.image && (
                          <img
                            src={p.image}
                            alt="media envoyé"
                            className="message-image"
                            onClick={() => {
                              setimageDialog(p);
                              setopen(true);
                            }}
                          />
                        )}
                        <span> {p.hour}</span>
                      </div>
                    )}
                  </div>
                );
              })}
              <div className="" ref={slideblock}></div>
            </div>
            <div className="ProfilMessageContentButton">
              <div className="ProfilMessageContentButtonOption">
                <div className="ProfilMessageContentBtn">
                  <img
                    src={emoji}
                    alt=""
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      setshowEmoji((prev) => !prev);
                    }}
                  />
                  <p>Emoji</p>
                </div>
                <div className="ProfilMessageContentBtn">
                  <img
                    src={file}
                    alt=""
                    onClick={() => refphoto.current?.click()}
                  />
                  <p>Photos</p>
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    ref={refphoto}
                    name="dataphoto"
                    onChange={handleChangePicture}
                  />
                </div>
              </div>
              <div className="ProfilMessageContentButtonArea">
                <textarea
                  name=""
                  id=""
                  spellCheck
                  value={writeSms}
                  onChange={handleChange}
                  placeholder="Saisir votre message et envoyer"
                />
              </div>
              <div
                className="ProfilMessageContentButtonSend"
                onClick={handlesend}
              >
                <img src={send} alt="" />
              </div>
              {showEmoji && (
                <div className="emoji" ref={emojiref}>
                  <Emoji handleEmojiSelect={handleEmojiSelect} />
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="ProfilMessageContents">
            <h1>
              👋 Veuillez choisir un utilisateur pour débuter la conversation.
            </h1>
          </div>
        )}

        {open && (
          <Dialog
            open={open}
            onClose={() => setopen(false)}
            className="custom-dialog"
            maxWidth="md"
            fullWidth
          >
            <DialogContent>
              {imageDialog && (
                <div className="dialog-media-wrapper">
                  <img
                    src={imageDialog.image}
                    alt="média envoyé"
                    className="dialog-image"
                  />
                  <a
                    href={imageDialog.image}
                    download={`media-${imageDialog.id}.png`}
                    className="dialog-download-btn"
                  >
                    <Button className="succes">Télécharger</Button>
                  </a>
                </div>
              )}
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
};

export default MessageAdmin;
