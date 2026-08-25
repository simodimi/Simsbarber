import logo from "../assets/icone/logo2.png";
import { Link, useNavigate } from "react-router-dom";
import "../styles/accueil.css";
import Button from "../ui/Button";
import { useEffect, useRef, useState, type ChangeEvent } from "react";
import video1 from "../assets/video/barber1.mp4";
import video2 from "../assets/video/barber2.mp4";
import video3 from "../assets/video/barber3.mp4";
import { GlowCard } from "../ui/Card";
import home1 from "../assets/photos/home/home1.webp";
import home2 from "../assets/photos/home/home2.jpg";
import home3 from "../assets/photos/home/home 3.jpg";
import footer1 from "../assets/icone/letter.png";
import footer2 from "../assets/icone/phone.png";
import people from "../assets/icone/A18.jpg";
import ia from "../assets/icone/iachat.png";
import close from "../assets/icone/cancel.png";
import send from "../assets/icone/env.png";
import load from "../assets/icone/statut.png";
import chaise from "../assets/photos/home/chaise.png";
import Siderbar from "../components/Siderbar";
import connect from "../services/Util";
import { toast } from "react-toastify";

interface Avis {
  id: number;
  photos: string;
  name: string;
  rating: number;
  message: string;
}
interface smsprofil {
  id: number;
  sms: string;
  date: string;
  sender: "bot" | "user";
}
interface categories {
  id: number;
  categorie: string;
  image: string;
  description: string;
}
const Accueil = () => {
  const video = [video1, video2, video3];
  const [currentindex, setcurrentindex] = useState<number>(0);
  const [currentavis, setcurrentavis] = useState<number>(0);
  const [couleursActuelles, setCouleursActuelles] = useState<string[]>([]);
  const [avisAPI, setAvisAPI] = useState<Avis[]>([]);
  // Récupération des avis au montage
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        // Appel avec minNote=4 pour ne récupérer que les avis >= 4 étoiles
        const response = await connect.get("/api/reviews?minNote=4");
        // Transformer pour correspondre à l'interface Avis
        const mapped = response.data.map((item: any) => ({
          id: item.id,
          photos: item.user?.photoUser || people, // image par défaut
          name: item.user?.nameUser,
          rating: item.note,
          message: item.commentaire,
        }));
        setAvisAPI(mapped);
      } catch (error) {
        console.error("Erreur lors du chargement des avis", error);
      }
    };
    fetchReviews();
  }, []);
  const readvideo = () => {
    setcurrentindex((prev) => (prev + 1) % video.length);
  };
  //on filtre par avis au moins supérieur à 4 et on melange aléatoirement
  const filteravis = avisAPI
    .filter((p) => p.rating >= 4)
    .sort(() => Math.random() - 0.5);
  //on choisit 5 elements au départ
  const afficheAvisClient = filteravis.slice(currentavis, currentavis + 5);
  useEffect(() => {
    const visible = setInterval(() => {
      setcurrentavis((prev) => {
        const next = prev + 5;
        return next >= filteravis.length ? 0 : next;
      });
    }, 6000);

    return () => {
      clearInterval(visible);
    };
  }, [filteravis.length]);
  //mixage bg
  const bg = [
    { id: 1, color: "rgba(80, 120, 255, 0.08)" },
    { id: 2, color: "rgba(160, 90, 255, 0.08)" },
    { id: 3, color: "rgba(232, 201, 126, 0.10)" },
    { id: 4, color: "rgba(80, 200, 150, 0.08)" },
    { id: 5, color: "rgba(255, 100, 100, 0.06)" },
    { id: 6, color: "rgba(100, 200, 255, 0.08)" },
    { id: 7, color: "rgba(255, 180, 100, 0.08)" },
    { id: 8, color: "rgba(200, 200, 200, 0.06)" },
  ];
  useEffect(() => {
    //[...bg] on crée une copie du tableau
    const mixcolor = [...bg].sort(() => Math.random() - 0.5);
    setCouleursActuelles(mixcolor.slice(0, 5).map((p) => p.color));
  }, [currentavis]);
  //message
  const [showSms, setshowSms] = useState<boolean>(false);
  const handlewriteIa = () => {
    setshowSms((prev) => !prev);
  };
  const [smsvalue, setsmsvalue] = useState<string>("");
  const handleChangeSms = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setsmsvalue(e.target.value);
  };
  const [conversation, setconversation] = useState<smsprofil[]>([]);
  const [botwrite, setbotwrite] = useState<boolean>(false);
  const refslider = useRef<HTMLDivElement | null>(null);
  const handleSendSms = async () => {
    if (smsvalue.trim() === "") return;

    const newsms: smsprofil = {
      id: Date.now(),
      sms: smsvalue,
      date: `${String(new Date().getHours()).padStart(2, "0")}:${String(new Date().getMinutes()).padStart(2, "0")}`,
      sender: "user",
    };
    setconversation((prev) => [...prev, newsms]);
    const messageEnvoye = smsvalue;
    setsmsvalue("");
    setbotwrite(true);

    try {
      const res = await connect.post("/api/chatbot/ask", {
        message: messageEnvoye,
      });
      const newsmsbot: smsprofil = {
        id: Date.now() + 1,
        sms: res.data.reponse,
        date: `${String(new Date().getHours()).padStart(2, "0")}:${String(new Date().getMinutes()).padStart(2, "0")}`,
        sender: "bot",
      };
      setconversation((prev) => [...prev, newsmsbot]);
    } catch {
      const newsmsbot: smsprofil = {
        id: Date.now() + 1,
        sms: "Désolé, une erreur est survenue. Réessayez dans quelques instants.",
        date: `${String(new Date().getHours()).padStart(2, "0")}:${String(new Date().getMinutes()).padStart(2, "0")}`,
        sender: "bot",
      };
      setconversation((prev) => [...prev, newsmsbot]);
    } finally {
      setbotwrite(false);
    }
  };
  //scroller automatiquement vers le bas
  useEffect(() => {
    if (refslider.current && conversation.length > 0) {
      refslider.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [conversation]);
  const navigate = useNavigate();
  //
  const hideChatSms = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const event = (e: MouseEvent) => {
      if (
        hideChatSms.current &&
        !hideChatSms.current.contains(e.target as Node)
      ) {
        setshowSms(false);
      }
    };
    document.addEventListener("mousedown", event);
    return () => {
      document.removeEventListener("mousedown", event);
    };
  }, []);
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
        <div className="AccueilHero">
          <div className="AccueilVideo">
            <video
              key={currentindex}
              src={video[currentindex]}
              autoPlay
              muted
              onEnded={readvideo}
              preload="auto"
            />
          </div>
          <div className="AccueilTexteHeader">
            <h1>Barbershop premium • Réservation en ligne</h1>
          </div>
          <div className="AccueilTexte">
            <h2>L’art du grooming, sans attente et sans compromis.</h2>
            <p>
              Une expérience de réservation fluide pour vos coupes, tailles de
              barbe et soins premium. Choisissez votre prestation, votre barbier
              et votre créneau en quelques secondes.
            </p>
          </div>

          <div className="AccueilBtn">
            <Button className="glow" onClick={() => navigate("/calendrier")}>
              Réserver maintenant
            </Button>
            <Button className="glow" onClick={() => navigate("/prestation")}>
              Découvrir les prestations
            </Button>
          </div>
        </div>
        <div className="AccueilPrestations">
          <div className="AccueilPrestationsTitle">
            <h2>Nos prestations phares</h2>
          </div>
          <div className="AccueilPrestationsCards">
            {categorie.slice(0, 4).map((p) => (
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
        {afficheAvisClient.length > 0 && (
          <div className="AccueilClient">
            <div className="AccueilPrestationsTitle">
              <h2>Ils ont testé, ils approuvent</h2>
            </div>
            <div className="AccueilClientCard">
              {afficheAvisClient.map((p, index) => (
                <div
                  className="AccueilClientCardList"
                  key={p.id}
                  style={{
                    backgroundColor: couleursActuelles[index],
                  }}
                >
                  <img src={p.photos} alt="" />
                  <p>{p.name}</p>
                  <p>{p.message}</p>
                  <p>{"⭐".repeat(p.rating)}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="AccueilFooter">
          <div className="AccueilFooterLogo">
            <img src={logo} alt="" />
            <p>
              Le barbershop premium pensé pour les hommes qui veulent gagner du
              temps sans sacrifier le style.
            </p>
          </div>
          <div className="barberseat">
            <img src={chaise} alt="" />
          </div>
          <div className="AccueilFooterPart">
            <div className="AccueilFooterNavigation">
              <h2>navigation</h2>
              <p>
                {" "}
                <Link to={"/prestation"}>Prestations</Link>
              </p>
              <p>
                <Link to={"/team"}>équipe</Link>
              </p>
              <p>
                <Link to={"/about"}>à propos</Link>
              </p>
            </div>
            <div className="AccueilFooterInformations">
              <h2>nous conctacter</h2>
              <div className="AccueilFooterInformationsAppels">
                <img src={footer1} alt="" />
                <p>
                  <a href="mailto:simodimitri08@gmail.com">
                    simodimitri08@gmail.com
                  </a>{" "}
                </p>
              </div>
              <div className="AccueilFooterInformationsAppels">
                <img src={footer2} alt="" />
                <p>
                  <a href="tel:+330751255097">+330751255097</a>{" "}
                </p>
              </div>
            </div>
          </div>
          <p id="copyright">&copy;2026,SIMO DIMITRI </p>
        </div>
        <div className="AccueilChatbot">
          <div className="AccueilChatbotLogo">
            <img src={ia} alt="" onClick={handlewriteIa} />
            <p>Sim'sBarber chatbot</p>
          </div>
          {showSms && (
            <div className="AccueilChatBotForm" ref={hideChatSms}>
              <div className="AccueilChatMenu">
                <p>Sim'sBarber bot</p>
                <img src={close} alt="" onClick={() => setshowSms(false)} />
              </div>

              <div className="AccueilChatSms">
                {conversation.map((p) =>
                  p.sender === "bot" ? (
                    <div className="AccueilChatSmsHome" key={p.id}>
                      <div className="waitingIa">
                        <img src={ia} alt="" />
                      </div>

                      <p>
                        {p.sms}
                        <span>{p.date}</span>
                      </p>
                    </div>
                  ) : (
                    <div className="AccueilChatSmsAway" key={p.id}>
                      <p>
                        {p.sms}
                        <span>{p.date}</span>
                      </p>

                      <div className="waitingIa">
                        <img src={ia} alt="" />
                      </div>
                    </div>
                  ),
                )}

                {botwrite && (
                  <div className="AccueilChatSmsHome">
                    <div className="waitingIa">
                      <img src={ia} alt="" />
                    </div>

                    <div className="waiting">
                      <img src={load} alt="" />
                    </div>
                  </div>
                )}
                <div className="" ref={refslider}></div>
              </div>

              <div className="AccueilChatWrite">
                <div className="AccueilChatWriteText">
                  <textarea
                    value={smsvalue}
                    name=""
                    id=""
                    spellCheck
                    onChange={handleChangeSms}
                    placeholder="saisir votre message et faites un clic sur la flèche"
                  ></textarea>
                </div>

                <div className="AccueilChatWritetext">
                  <img src={send} alt="" onClick={handleSendSms} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Accueil;
