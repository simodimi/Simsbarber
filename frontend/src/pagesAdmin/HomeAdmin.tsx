import SiderbarAdmin from "../components/SiderbarAdmin";
import "../styles/prestation.css";
import { useEffect, useRef, useState, type ChangeEvent } from "react";
import ia from "../assets/icone/iachat.png";
import close from "../assets/icone/cancel.png";
import send from "../assets/icone/env.png";
import load from "../assets/icone/statut.png";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useMemo } from "react";
import dayjs from "dayjs";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import Button from "../ui/Button";
import connect from "../services/Util";
import { connectSocket } from "../services/socket";

export interface SalonOrder {
  id: string;
  order_date: string;
  names: string;
  category: string;
  quantity: number;
  price: number;
  total_revenue: number;
}

const HEURE_OUVERTURE = 9;
const HEURE_FERMETURE = 19;

function getTotalRevenue(orders: SalonOrder[]): number {
  return parseFloat(
    orders.reduce((sum, o) => sum + o.total_revenue, 0).toFixed(2),
  );
}
function getTodayRevenue(orders: SalonOrder[]): number {
  const today = dayjs();
  return parseFloat(
    orders
      .filter((o) => dayjs(o.order_date).isSame(today, "day"))
      .reduce((sum, o) => sum + o.total_revenue, 0)
      .toFixed(2),
  );
}

function getWeekRevenue(orders: SalonOrder[]): number {
  const startOfWeek = dayjs().startOf("week");
  return parseFloat(
    orders
      .filter((o) => dayjs(o.order_date).isAfter(startOfWeek))
      .reduce((sum, o) => sum + o.total_revenue, 0)
      .toFixed(2),
  );
}

function getMonthRevenue(orders: SalonOrder[]): number {
  const startOfMonth = dayjs().startOf("month");
  return parseFloat(
    orders
      .filter((o) => dayjs(o.order_date).isAfter(startOfMonth))
      .reduce((sum, o) => sum + o.total_revenue, 0)
      .toFixed(2),
  );
}

function getRevenueByPrestation(
  orders: SalonOrder[],
): { names: string; count: number; revenue: number }[] {
  const map: Record<string, { count: number; revenue: number }> = {};

  orders.forEach((o) => {
    if (!map[o.names]) map[o.names] = { count: 0, revenue: 0 };
    map[o.names].count += o.quantity;
    map[o.names].revenue += o.total_revenue;
  });

  return Object.entries(map)
    .map(([names, val]) => ({
      names,
      count: val.count,
      revenue: parseFloat(val.revenue.toFixed(2)),
    }))
    .sort((a, b) => b.revenue - a.revenue);
}

function getRevenueByMonth(
  orders: SalonOrder[],
  nbMonths = 6,
): { month: string; count: number; revenue: number }[] {
  const result: { month: string; count: number; revenue: number }[] = [];

  for (let i = nbMonths - 1; i >= 0; i--) {
    const target = dayjs().subtract(i, "month");
    const monthOrders = orders.filter((o) =>
      dayjs(o.order_date).isSame(target, "month"),
    );
    result.push({
      month: target.format("MMM YYYY"),
      count: monthOrders.reduce((sum, o) => sum + o.quantity, 0),
      revenue: parseFloat(
        monthOrders.reduce((sum, o) => sum + o.total_revenue, 0).toFixed(2),
      ),
    });
  }

  return result;
}

function getRevenueByDayOfCurrentMonth(
  orders: SalonOrder[],
): { day: string; count: number; revenue: number }[] {
  const today = dayjs();
  const startOfMonth = today.startOf("month");
  const nbDays = today.date();

  const result: { day: string; count: number; revenue: number }[] = [];

  for (let d = 0; d < nbDays; d++) {
    const target = startOfMonth.add(d, "day");
    const dayOrders = orders.filter((o) =>
      dayjs(o.order_date).isSame(target, "day"),
    );
    result.push({
      day: target.format("DD/MM"),
      count: dayOrders.reduce((sum, o) => sum + o.quantity, 0),
      revenue: parseFloat(
        dayOrders.reduce((sum, o) => sum + o.total_revenue, 0).toFixed(2),
      ),
    });
  }

  return result;
}

function getRevenueByHourToday(
  orders: SalonOrder[],
): { hour: string; count: number; revenue: number }[] {
  const today = dayjs();
  const result: { hour: string; count: number; revenue: number }[] = [];

  for (let h = HEURE_OUVERTURE; h <= HEURE_FERMETURE; h++) {
    const hourOrders = orders.filter(
      (o) =>
        dayjs(o.order_date).isSame(today, "day") &&
        dayjs(o.order_date).hour() === h,
    );
    result.push({
      hour: `${h}h`,
      count: hourOrders.reduce((sum, o) => sum + o.quantity, 0),
      revenue: parseFloat(
        hourOrders.reduce((sum, o) => sum + o.total_revenue, 0).toFixed(2),
      ),
    });
  }

  return result;
}

function getRevenueByDayOfCurrentWeek(
  orders: SalonOrder[],
): { day: string; count: number; revenue: number }[] {
  const startOfWeek = dayjs().startOf("week");
  const result: { day: string; count: number; revenue: number }[] = [];

  for (let d = 0; d < 7; d++) {
    const target = startOfWeek.add(d, "day");
    const dayOrders = orders.filter((o) =>
      dayjs(o.order_date).isSame(target, "day"),
    );
    result.push({
      day: target.format("ddd DD/MM"),
      count: dayOrders.reduce((sum, o) => sum + o.quantity, 0),
      revenue: parseFloat(
        dayOrders.reduce((sum, o) => sum + o.total_revenue, 0).toFixed(2),
      ),
    });
  }

  return result;
}

interface smsprofil {
  id: number;
  sms: string;
  date: string;
  sender: "bot" | "user";
}
const HomeAdmin = () => {
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
  useEffect(() => {
    if (refslider.current && conversation.length > 0) {
      refslider.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [conversation]);

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

  const [orders, setOrders] = useState<SalonOrder[]>([]);

  const fetchOrders = async () => {
    try {
      const res = await connect.get("/api/reservations");

      const adapte: SalonOrder[] = [];
      res.data.forEach((r: any) => {
        if (r.status !== "TERMINE") return;
        (r.prestations || []).forEach((p: any) => {
          const prixReel = p.ReservationPrestation?.prixSnapshot ?? p.prix;
          adapte.push({
            id: `${r.id}-${p.id}`,
            order_date: r.start,
            names: p.nom,
            category: p.category?.nom || "",
            quantity: 1,
            price: prixReel,
            total_revenue: prixReel,
          });
        });
      });
      setOrders(adapte);
    } catch {
      // silencieux
    }
  };

  useEffect(() => {
    fetchOrders();
    const socket = connectSocket();
    socket.on("reservation:created", fetchOrders);
    socket.on("reservation:updated", fetchOrders);
    socket.on("reservation:cancelled", fetchOrders);
    return () => {
      socket.off("reservation:created", fetchOrders);
      socket.off("reservation:updated", fetchOrders);
      socket.off("reservation:cancelled", fetchOrders);
    };
  }, []);

  const totalRevenue = useMemo(() => getTotalRevenue(orders), [orders]);
  const todayRevenue = useMemo(() => getTodayRevenue(orders), [orders]);
  const weekRevenue = useMemo(() => getWeekRevenue(orders), [orders]);
  const monthRevenue = useMemo(() => getMonthRevenue(orders), [orders]);

  const byPrestation = useMemo(() => getRevenueByPrestation(orders), [orders]);
  const byMonth = useMemo(() => getRevenueByMonth(orders, 6), [orders]);
  const byDayOfMonth = useMemo(
    () => getRevenueByDayOfCurrentMonth(orders),
    [orders],
  );
  const byHourToday = useMemo(() => getRevenueByHourToday(orders), [orders]);
  const byDayOfWeek = useMemo(
    () => getRevenueByDayOfCurrentWeek(orders),
    [orders],
  );
  const generatePdfReport = (
    title: string,
    rows: { label: string; count?: number; revenue: number }[],
    total: number,
    type: "prestation" | "hour" | "day" | "month" | "week" = "day",
  ) => {
    const pdfDoc = new jsPDF();
    pdfDoc.setFontSize(16);
    pdfDoc.text(`Sim'sBarber — ${title}`, 14, 18);
    pdfDoc.setFontSize(10);
    pdfDoc.text(`Généré le ${dayjs().format("DD/MM/YYYY à HH:mm")}`, 14, 25);

    let head: string[] = [];
    switch (type) {
      case "prestation":
        head = ["Prestation", "Quantité", "Chiffre d'affaires"];
        break;
      case "hour":
        head = ["Heure", "Prestations", "Chiffre d'affaires"];
        break;
      case "day":
        head = ["Date", "Prestations", "Chiffre d'affaires"];
        break;
      case "week":
        head = ["Date", "Prestations", "Chiffre d'affaires"];
        break;
      case "month":
        head = ["Mois", "Prestations", "Chiffre d'affaires"];
        break;
      default:
        head = ["Date", "Prestations", "Chiffre d'affaires"];
    }
    autoTable(pdfDoc, {
      startY: 32,
      head: [head],
      body: rows.map((r) => [
        r.label,
        r.count?.toString() ?? "-",
        `${r.revenue.toFixed(2)} €`,
      ]),
      foot: [["", "Total", `${total.toFixed(2)} €`]],
      theme: "striped",
      headStyles: { fillColor: [31, 78, 95] },
      footStyles: {
        fillColor: [230, 230, 230],
        textColor: 20,
        fontStyle: "bold",
      },
    });

    pdfDoc.save(
      `rapport-${title.toLowerCase().replace(/\s+/g, "-")}-${dayjs().format("YYYY-MM-DD")}.pdf`,
    );
  };
  return (
    <div className="AccueilHeader">
      <div className="AccueilHome">
        <SiderbarAdmin />
        <div className="CartemainGeneral">
          <div className="AccueilPrestationsTitle">
            <h2>Statistiques du salon</h2>
          </div>

          <div className="keyIndicators">
            <div
              className="keyIndicatorsCard"
              style={{ cursor: "pointer" }}
              onClick={() =>
                generatePdfReport(
                  "CA du jour",
                  [
                    {
                      label: dayjs().format("DD/MM/YYYY"),
                      revenue: todayRevenue,
                    },
                  ],
                  todayRevenue,
                  "day",
                )
              }
            >
              <p style={{ fontWeight: 700 }}>Chiffre d'affaires aujourd'hui</p>
              <h3>{todayRevenue.toFixed(2)} €</h3>
            </div>
            <div
              className="keyIndicatorsCard"
              style={{ cursor: "pointer" }}
              onClick={() =>
                generatePdfReport(
                  "CA de la semaine",
                  byDayOfWeek.map((d) => ({
                    label: d.day,
                    count: d.count,
                    revenue: d.revenue,
                  })),
                  weekRevenue,
                  "week",
                )
              }
            >
              <p style={{ fontWeight: 700 }}>
                Chiffre d'affaires cette semaine
              </p>
              <h3>{weekRevenue.toFixed(2)} €</h3>
            </div>
            <div
              className="keyIndicatorsCard"
              style={{ cursor: "pointer" }}
              onClick={() =>
                generatePdfReport(
                  "CA du mois",
                  byDayOfMonth.map((d) => ({
                    label: d.day,
                    count: d.count,
                    revenue: d.revenue,
                  })),
                  monthRevenue,
                  "day",
                )
              }
            >
              <p style={{ fontWeight: 700 }}>Chiffre d'affaires ce mois-ci</p>
              <h3>{monthRevenue.toFixed(2)} €</h3>
            </div>
            <div
              className="keyIndicatorsCard"
              style={{ cursor: "pointer" }}
              onClick={() =>
                generatePdfReport(
                  "CA total",
                  byMonth.map((m) => ({
                    label: m.month,
                    count: m.count,
                    revenue: m.revenue,
                  })),
                  totalRevenue,
                  "month",
                )
              }
            >
              <p style={{ fontWeight: 700 }}>
                Chiffre d'affaires total (période générée)
              </p>
              <h3>{totalRevenue.toFixed(2)} €</h3>
            </div>
          </div>

          <div className="keypage">
            <div className="bg-white shadow-lg rounded-2xl p-4">
              <div className="Ca-Header">
                <h2 className="text-xl font-bold mb-4">
                  Chiffre d'affaires par heure (aujourd'hui)
                </h2>
                <div className="btn-CaHeader">
                  <Button
                    className="glow"
                    onClick={() =>
                      generatePdfReport(
                        "Chiffre d'affaires par heure",
                        byHourToday.map((p) => ({
                          label: p.hour,
                          count: p.count,
                          revenue: p.revenue,
                        })),
                        byHourToday.reduce((sum, p) => sum + p.revenue, 0),
                        "hour",
                      )
                    }
                  >
                    Télécharger PDF
                  </Button>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={byHourToday}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip
                    formatter={(value, name) =>
                      name === "revenue"
                        ? [`${value} €`, "CA"]
                        : [value, "Prestations"]
                    }
                  />
                  <Legend />
                  <Bar dataKey="count" fill="#FF8042" name="Prestations" />
                  <Bar dataKey="revenue" fill="#0088FE" name="CA (€)" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white shadow-lg rounded-2xl p-4">
              <div className="Ca-Header">
                <h2 className="text-xl font-bold mb-4">
                  Évolution du CA - Jour par jour (mois en cours)
                </h2>
                <div className="btn-CaHeader">
                  <Button
                    className="glow"
                    onClick={() =>
                      generatePdfReport(
                        "Chiffre d'affaire Jour par jour (mois en cours)",
                        byDayOfMonth.map((p) => ({
                          label: p.day,
                          count: p.count,
                          revenue: p.revenue,
                        })),
                        byDayOfMonth.reduce((sum, p) => sum + p.revenue, 0),
                        "day",
                      )
                    }
                  >
                    Télécharger PDF
                  </Button>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={byDayOfMonth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value} €`, "CA"]} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#8884d8"
                    strokeWidth={2}
                    name="CA (€)"
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white shadow-lg rounded-2xl p-4">
              <div className="Ca-Header">
                <h2 className="text-xl font-bold mb-4">
                  Chiffre d'affaires par jour (semaine en cours)
                </h2>
                <div className="btn-CaHeader">
                  <Button
                    className="glow"
                    onClick={() =>
                      generatePdfReport(
                        "Chiffre d'affaire par jour (semaine en cours)",
                        byDayOfWeek.map((p) => ({
                          label: p.day,
                          count: p.count,
                          revenue: p.revenue,
                        })),

                        byDayOfWeek.reduce((sum, p) => sum + p.revenue, 0),
                        "week",
                      )
                    }
                  >
                    Télécharger PDF
                  </Button>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={byDayOfWeek}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value} €`, "CA"]} />
                  <Legend />
                  <Bar dataKey="revenue" fill="#00C49F" name="CA (€)" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white shadow-lg rounded-2xl p-4">
              <div className="Ca-Header">
                <h2 className="text-xl font-bold mb-4">
                  Évolution du CA - 6 derniers mois
                </h2>
                <div className="btn-CaHeader">
                  <Button
                    className="glow"
                    onClick={() =>
                      generatePdfReport(
                        "Chiffre d'affaire sur les 6 derniers mois",
                        byMonth.map((p) => ({
                          label: p.month,
                          count: p.count,
                          revenue: p.revenue,
                        })),
                        byMonth.reduce((sum, p) => sum + p.revenue, 0),
                        "month",
                      )
                    }
                  >
                    Télécharger PDF
                  </Button>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={byMonth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value} €`, "CA"]} />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#FFBB28"
                    fill="#FFBB28"
                    fillOpacity={0.4}
                    name="CA (€)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white shadow-lg rounded-2xl p-4">
              <div className="Ca-Header">
                <h2 className="text-xl font-bold">
                  Chiffre d'affaires par prestation
                </h2>
                <div className="btn-CaHeader">
                  <Button
                    className="glow"
                    onClick={() =>
                      generatePdfReport(
                        "Chiffre d'affaire par prestation",
                        byPrestation.map((p) => ({
                          label: p.names,
                          count: p.count,
                          revenue: p.revenue,
                        })),
                        byPrestation.reduce((sum, p) => sum + p.revenue, 0),
                        "prestation",
                      )
                    }
                  >
                    Télécharger PDF
                  </Button>
                </div>
              </div>

              <ResponsiveContainer width="100%" height={450}>
                <BarChart
                  data={byPrestation}
                  layout="vertical"
                  margin={{ left: 40 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="names" type="category" width={160} />
                  <Tooltip
                    formatter={(value, name) =>
                      name === "revenue"
                        ? [`${value} €`, "CA"]
                        : [value, "Quantité"]
                    }
                  />
                  <Legend />
                  <Bar dataKey="revenue" fill="#82ca9d" name="CA (€)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
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

export default HomeAdmin;
