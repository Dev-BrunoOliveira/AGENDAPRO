import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import { supabase } from "../supabaseClient";
import { X, Trash2 } from "lucide-react";
import { toast } from "./Toast";

interface Appointment {
  id: string;
  service: string;
  date: string;
  time: string;
  status: string;
  business_id: string;
  profiles?: { full_name: string };
}

interface Business {
  id: string;
  full_name: string;
}

export function ClientDashboard({ userId }: { userId: string }) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const barberRef = localStorage.getItem("barberRef");
  const [preSelectedBusinessName, setPreSelectedBusinessName] = useState<string | null>(null);

  const fetchAppointments = async () => {
    const { data, error } = await supabase
      .from("appointments")
      .select(`*, profiles!appointments_business_id_fkey(full_name)`)
      .eq("client_id", userId)
      .order("date", { ascending: true })
      .order("time", { ascending: true });

    if (!error && data) {
      setAppointments(data);
    }
    setFetching(false);
  };

  const fetchBusinesses = async () => {
    if (barberRef) {
      const { data, error } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", barberRef)
        .single();
      if (!error && data) {
        setPreSelectedBusinessName(data.full_name);
      } else {
        setPreSelectedBusinessName("Barbeiro não encontrado");
      }
    } else {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name")
        .eq("role", "BUSINESS");
      if (!error && data) {
        setBusinesses(data);
      }
    }
  };

  useEffect(() => {
    fetchAppointments();
    fetchBusinesses();

    if (localStorage.getItem("autoOpenModal") === "true") {
      setIsModalOpen(true);
      localStorage.removeItem("autoOpenModal");
    }
  }, [userId, barberRef]);

  const handleNewAppointment = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target as HTMLFormElement);
    const business_id = formData.get("business_id") as string;
    const service = formData.get("service") as string;
    const date = formData.get("date") as string;
    const time = formData.get("time") as string;

    const { error } = await supabase.from("appointments").insert({
      client_id: userId,
      business_id,
      service,
      date,
      time,
      status: "pending",
    });

    if (error) {
      toast("Erro ao agendar: " + error.message, "error");
    } else {
      toast("Agendamento solicitado com sucesso!", "success");
      setIsModalOpen(false);
      fetchAppointments();
    }
    setLoading(false);
  };

  const handleCancelAppointment = async (id: string) => {
    if (!window.confirm("Deseja realmente cancelar este agendamento?")) return;

    setLoading(true);
    const { error } = await supabase
      .from("appointments")
      .update({ status: "cancelled" })
      .eq("id", id);

    if (error) {
      toast("Erro ao cancelar: " + error.message, "error");
    } else {
      toast("Agendamento cancelado.", "success");
      fetchAppointments();
    }
    setLoading(false);
  };

  const todayDate = new Date().toISOString().split("T")[0];

  return (
    <div className="dash-container">
      <header className="dash-header glass">
        <h2>Meus Agendamentos</h2>
        <button className="btn-logout" onClick={() => supabase.auth.signOut()}>
          Sair
        </button>
      </header>
      <main className="dash-content">
        <section className="next-appointments">
          <h3>Seus Próximos Agendamentos</h3>
          {fetching ? (
            <p>Carregando agendamentos...</p>
          ) : appointments.length === 0 ? (
            <p>Nenhum agendamento encontrado.</p>
          ) : (
            appointments.map((app) => (
              <div key={app.id} className="appointment-card glass">
                <div className="info">
                  <p className="service">{app.service}</p>
                  <p className="establishment">
                    {app.profiles?.full_name || "Estabelecimento"}
                  </p>
                  <p>
                    Status:{" "}
                    <span className={`status ${app.status}`}>{app.status}</span>
                  </p>
                </div>
                <div className="date-time" style={{ alignItems: "flex-end" }}>
                  <span>{new Date(app.date).toLocaleDateString("pt-BR")}</span>
                  <span>{app.time}</span>
                  {app.status === "pending" && (
                    <button
                      onClick={() => handleCancelAppointment(app.id)}
                      disabled={loading}
                      title="Cancelar Agendamento"
                      style={{
                        marginTop: 8,
                        background: "rgba(239, 68, 68, 0.15)",
                        border: "1px solid rgba(239, 68, 68, 0.3)",
                        color: "#ef4444",
                        padding: "6px 10px",
                        borderRadius: "8px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        fontSize: "0.85rem",
                        fontWeight: "600",
                      }}
                    >
                      <Trash2 size={14} /> Cancelar
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </section>
        <button
          className="btn-new-schedule"
          onClick={() => setIsModalOpen(true)}
        >
          Novo Agendamento
        </button>
      </main>

      {isModalOpen && (
        <div 
          className="modal-overlay" 
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              setIsModalOpen(false);
            }
          }}
        >
          <div className="modal-content glass">
            <button
              className="close-btn"
              onClick={() => setIsModalOpen(false)}
              disabled={loading}
            >
              <X size={24} />
            </button>
            <h2 className="modal-title">Novo Agendamento</h2>
            <form
              className="auth-form"
              onSubmit={handleNewAppointment}
              style={{ marginTop: "20px" }}
            >
              {barberRef ? (
                <>
                  <input type="hidden" name="business_id" value={barberRef} />
                  <div style={{
                    background: "rgba(255, 255, 255, 0.08)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    padding: "1rem",
                    borderRadius: "14px",
                    color: "white",
                    textAlign: "left"
                  }}>
                    <span style={{ fontSize: "0.85rem", color: "#aaa" }}>Agendando com:</span><br/>
                    <strong>{preSelectedBusinessName || "Carregando..."}</strong>
                  </div>
                </>
              ) : (
                <select
                  name="business_id"
                  required
                  className="auth-form-select"
                  disabled={loading}
                >
                  <option value="">Selecione o Estabelecimento</option>
                  {businesses.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.full_name}
                    </option>
                  ))}
                </select>
              )}
              <input
                name="service"
                type="text"
                placeholder="Serviço (ex: Corte, Barba)"
                required
                disabled={loading}
              />
              <input
                name="date"
                type="date"
                required
                min={todayDate}
                disabled={loading}
              />
              <input name="time" type="time" required disabled={loading} />

              <button type="submit" className="btn-submit" disabled={loading}>
                {loading ? "Agendando..." : "Confirmar"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
