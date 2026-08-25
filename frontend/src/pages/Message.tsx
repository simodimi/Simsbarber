// MessageUser.tsx
import { useEffect, useRef, useState, type ChangeEvent } from "react";
import img from "../assets/icone/iachat.png";
import send from "../assets/icone/env.png";
import emoji from "../assets/icone/grinning.png";
import file from "../assets/icone/file.png";
import "../styles/prestation.css";
import Emoji from "../ui/Emoji";
import { toast } from "react-toastify";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import Button from "../ui/Button";
import connect from "../services/Util";
import { connectSocket } from "../services/socket";
import { useNotification } from "../services/NotificationContext";
import { useAuth } from "../pages/AuthContext";
const Message = () => {
  interface dataSms {
    id: string;
    message: string;
    hour: string;
    image?: string;
    sender: "home" | "away";
    timestamp: number;
  }

  // État pour l'emoji picker
  const [showEmoji, setShowEmoji] = useState<boolean>(false);
  const emojiref = useRef<HTMLDivElement | null>(null);
  const { refreshUnread } = useNotification();
  // Gestion des événements socket
  useEffect(() => {
    const socket = connectSocket();
    const sync = () => fetchMessages();

    socket.on("connect", sync); // resync après toute (re)connexion
    socket.on("message:new", sync);
    socket.on("message:broadcast", sync);

    return () => {
      socket.off("connect", sync);
      socket.off("message:new", sync);
      socket.off("message:broadcast", sync);
    };
  }, []);

  // Fermeture de l'emoji picker au clic extérieur
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (emojiref.current && !emojiref.current.contains(e.target as Node)) {
        setShowEmoji(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // État du message en cours de saisie
  const [writeSms, setWriteSms] = useState<string>("");
  const { user } = useAuth();

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setWriteSms(e.target.value);
  };

  const handleEmojiSelect = (e: { emoji: string }) => {
    setWriteSms((prev) => prev + e.emoji);
  };

  // Envoi d'une image
  const handleChangePicture = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("image", file);
    await connect.post("/api/messages", formData);
    await fetchMessages();
  };

  // État des messages
  const [conversation, setConversation] = useState<dataSms[]>([]);

  const fetchMessages = async () => {
    const res = await connect.get("/api/messages/me");
    const adapte = res.data.map((m: any) => ({
      id: String(m.id),
      message: m.content || "",
      hour: new Date(m.createdAt).toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      image: m.imageUrl ? `http://localhost:5000${m.imageUrl}` : undefined,
      sender: m.senderType === "USER" ? "home" : "away", // USER = l'utilisateur, ADMIN = le salon
      timestamp: new Date(m.createdAt).getTime(),
    }));
    setConversation(adapte);
    refreshUnread();
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  // Envoi d'un message texte
  const handleSend = async () => {
    if (writeSms.trim() === "") {
      toast.error(
        "Message vide, veuillez saisir votre message avant d'envoyer",
      );
      return;
    }
    const formData = new FormData();
    formData.append("content", writeSms);
    try {
      await connect.post("/api/messages", formData);
      await fetchMessages();
    } catch {
      toast.error("Erreur lors de l'envoi");
    }
    setWriteSms("");
  };

  const messageCurrent = conversation;

  // Scroll automatique vers le dernier message
  const slideblock = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (slideblock.current && messageCurrent.length > 0) {
      slideblock.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messageCurrent]);

  const refphoto = useRef<HTMLInputElement | null>(null);

  // Dialog pour afficher une image en grand
  const [open, setOpen] = useState(false);
  const [imageDialog, setImageDialog] = useState<dataSms | null>(null);

  // Formatage des dates pour les séparateurs
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

  return (
    <div className="AccueilHeaderUser">
      <div className="ProfilMessageAdmin">
        <div className="ProfilMessageContent">
          <div className="ProfilMessageContentPerson">
            <img src={img} alt="Sim'sBarber" />
            <p>Sim'sBarber</p>
          </div>

          <div
            className="ProfilMessageContentSms"
            style={{
              backgroundImage: `url(${user?.chatBackgroundUrl})`,
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
                            setImageDialog(p);
                            setOpen(true);
                          }}
                        />
                      )}
                      <span> {p.hour}</span>
                    </div>
                  ) : (
                    <div className="ProfilMessageContentSmsAway">
                      <p>{p.message}</p>
                      {p.image && (
                        <img
                          src={p.image}
                          alt="media envoyé"
                          className="message-image"
                          onClick={() => {
                            setImageDialog(p);
                            setOpen(true);
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
                  alt="emoji"
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    setShowEmoji((prev) => !prev);
                  }}
                />
                <p>Emoji</p>
              </div>
              <div className="ProfilMessageContentBtn">
                <img
                  src={file}
                  alt="photo"
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
                spellCheck
                value={writeSms}
                onChange={handleChange}
                placeholder="Saisir votre message et envoyer"
              />
            </div>
            <div
              className="ProfilMessageContentButtonSend"
              onClick={handleSend}
            >
              <img src={send} alt="envoyer" />
            </div>
            {showEmoji && (
              <div className="emoji" ref={emojiref}>
                <Emoji handleEmojiSelect={handleEmojiSelect} />
              </div>
            )}
          </div>
        </div>

        {open && (
          <Dialog
            open={open}
            onClose={() => setOpen(false)}
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

export default Message;
