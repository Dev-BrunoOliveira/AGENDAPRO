import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import { supabase } from "../supabaseClient";
import { toast } from "./Toast";
import { Settings, Calendar } from "lucide-react";

interface Appointment {
  id: string;
  service: string;
  date: string;
  time: string;
  status: string;
  client_id: string;
  profiles?: { full_name: string };
}

export function BusinessDashboard({ userId }: { userId: string }) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [fetching, setFetching] = useState(true);
  const [loadingActionId, setLoadingActionId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"agenda" | "config">("agenda");
  const [businessName, setBusinessName] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  const fetchAppointments = async () => {
    const { data, error } = await supabase
      .from("appointments")
      .select(`*, profiles!appointments_client_id_fkey(full_name)`)
      .eq("business_id", userId)
      .order("date", { ascending: true })
      .order("time", { ascending: true });

    if (!error && data) {
      setAppointments(data);
    }
    setFetching(false);
  };

  const fetchProfile = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", userId)
      .single();
    if (!error && data) {
      setBusinessName(data.full_name);
    }
  };

  useEffect(() => {
    fetchAppointments();
    fetchProfile();
  }, [userId]);

  const handleUpdateStatus = async (id: string, status: string) => {
    setLoadingActionId(id);
    const { error } = await supabase
      .from("appointments")
      .update({ status })
      .eq("id", id);

    if (error) {
      toast("Erro ao atualizar: " + error.message, "error");
    } else {
      toast(`Agendamento ${status === "confirmed" ? "confirmado" : "cancelado"}.`, "success");
      fetchAppointments();
    }
    setLoadingActionId(null);
  };

  const handleCopyLink = () => {
    const link = `${window.location.origin}/?b=${userId}`;
    navigator.clipboard.writeText(link);
    toast("Link copiado! Envie para seus clientes.", "success");
  };

  const handleUpdateProfile = async (e: FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    const { error } = await supabase
      .from("profiles")
      .upsert({ id: userId, full_name: businessName, role: "BUSINESS" });

    if (error) {
      toast("Erro ao atualizar perfil: " + error.message, "error");
    } else {
      toast("Perfil atualizado com sucesso!", "success");
    }
    setSavingProfile(false);
  };

  return (
    <div className="dash-container">
      <header className="dash-header glass">
        <h2>Painel Administrativo</h2>
        <div className="header-actions">
          <div className="stats-quick glass">
            Total Hoje:{" "}
            {
              appointments.filter(
                (a) =>
                  a.date === new Date().toISOString().split("T")[0] &&
                  a.status !== "cancelled"
              ).length
            }{" "}
            Agendamentos
          </div>
          <button
            className="btn-primary"
            onClick={handleCopyLink}
            style={{ padding: "0.5rem 1rem", fontSize: "0.9rem", display: "flex", alignItems: "center", gap: "0.5rem" }}
          >
            Copiar Meu Link
          </button>
          <button
            className="btn-logout"
            onClick={() => supabase.auth.signOut()}
          >
            Sair
          </button>
        </div>
      </header>
      <div className="admin-grid">
        <aside className="sidebar glass">
          <nav style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <button 
              className={activeTab === "agenda" ? "active" : ""} 
              onClick={() => setActiveTab("agenda")}
              style={{ display: "flex", alignItems: "center", gap: "8px", justifyContent: "flex-start" }}
            >
              <Calendar size={18} /> Agenda
            </button>
            <button 
              className={activeTab === "config" ? "active" : ""} 
              onClick={() => setActiveTab("config")}
              style={{ display: "flex", alignItems: "center", gap: "8px", justifyContent: "flex-start" }}
            >
              <Settings size={18} /> Configurações
            </button>
          </nav>
        </aside>
        <main className="agenda-view">
          {activeTab === "agenda" && (
            <>
              <h3>Agenda do Dia</h3>
              <table className="agenda-table glass">
            <thead>
              <tr>
                <th>Data</th>
                <th>Horário</th>
                <th>Cliente</th>
                <th>Serviço</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {fetching ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center" }}>
                    Carregando agendamentos...
                  </td>
                </tr>
              ) : appointments.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center" }}>
                    Nenhum agendamento encontrado.
                  </td>
                </tr>
              ) : (
                appointments.map((app) => (
                  <tr key={app.id}>
                    <td>{new Date(app.date).toLocaleDateString("pt-BR")}</td>
                    <td>{app.time}</td>
                    <td>{app.profiles?.full_name || "Cliente"}</td>
                    <td>{app.service}</td>
                    <td>
                      <span className={`status ${app.status}`}>{app.status}</span>
                    </td>
                    <td>
                      {app.status === "pending" && (
                        <>
                          <button
                            onClick={() =>
                              handleUpdateStatus(app.id, "confirmed")
                            }
                            disabled={loadingActionId === app.id}
                            style={{
                              marginRight: 8,
                              color: loadingActionId === app.id ? "#aaa" : "#00c2cb",
                              cursor: loadingActionId === app.id ? "not-allowed" : "pointer",
                              background: "none",
                              border: "none",
                              fontWeight: "bold",
                            }}
                          >
                            Confirmar
                          </button>
                          <button
                            onClick={() =>
                              handleUpdateStatus(app.id, "cancelled")
                            }
                            disabled={loadingActionId === app.id}
                            style={{
                              color: loadingActionId === app.id ? "#aaa" : "#ef4444",
                              cursor: loadingActionId === app.id ? "not-allowed" : "pointer",
                              background: "none",
                              border: "none",
                              fontWeight: "bold",
                            }}
                          >
                            Cancelar
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          </>
          )}

          {activeTab === "config" && (
            <div className="config-section glass" style={{ padding: "2rem", borderRadius: "24px" }}>
              <h3>Configurações do Estabelecimento</h3>
              <form className="auth-form" onSubmit={handleUpdateProfile} style={{ marginTop: "1.5rem", maxWidth: "400px" }}>
                <label style={{ display: "block", marginBottom: "0.5rem", color: "#ccc", fontSize: "0.9rem" }}>
                  Nome do Estabelecimento (Exibido para os clientes)
                </label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  required
                  disabled={savingProfile}
                />
                <button type="submit" className="btn-submit" disabled={savingProfile}>
                  {savingProfile ? "Salvando..." : "Salvar Alterações"}
                </button>
              </form>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
