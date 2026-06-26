import { useState } from "react";
import type { FormEvent } from "react";
import { X, ArrowLeft } from "lucide-react";
import { supabase } from "../supabaseClient";
import { toast } from "./Toast";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  userRole: "CLIENT" | "BUSINESS" | null;
  authMode: "login" | "register" | "forgot";
  setAuthMode: (mode: "login" | "register" | "forgot") => void;
}

export function AuthModal({
  isOpen,
  onClose,
  userRole,
  authMode,
  setAuthMode,
}: AuthModalProps) {
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleAuth = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target as HTMLFormElement);
    const email = formData.get("email") as string;

    if (authMode === "forgot") {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}?reset=true`,
      });
      if (error) {
        toast("Erro: " + error.message, "error");
      } else {
        toast("Link de recuperação enviado para " + email, "success");
      }
      setLoading(false);
      return;
    }

    const password = formData.get("password") as string;

    if (authMode === "login") {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) toast("Erro no login: " + error.message, "error");
      else toast("Login realizado com sucesso!", "success");
    } else if (authMode === "register") {
      const fullName = formData.get("fullName") as string;
      const phone = formData.get("phone") as string;

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone: phone,
            role: userRole,
          },
        },
      });
      if (error) {
        toast("Erro no cadastro: " + error.message, "error");
      } else {
        toast("Sucesso! Verifique seu e-mail para confirmar.", "success");
      }
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
        queryParams: { access_type: "offline", prompt: "consent" },
      },
    });
    if (error) toast("Erro no login: " + error.message, "error");
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content glass" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose} disabled={loading}>
          <X size={24} />
        </button>

        <div className="modal-header">
          {authMode !== "login" && !loading && (
            <button className="back-btn" onClick={() => setAuthMode("login")}>
              <ArrowLeft size={20} />
            </button>
          )}
          <h2 className="modal-title">
            {authMode === "login" && "Acessar Conta"}
            {authMode === "register" &&
              (userRole === "CLIENT"
                ? "Criar Conta Cliente"
                : "Cadastrar Empresa")}
            {authMode === "forgot" && "Recuperar Senha"}
          </h2>
        </div>

        {authMode !== "forgot" && (
          <>
            <button
              className="btn-google"
              onClick={handleGoogleLogin}
              disabled={loading}
            >
              <img
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                alt="Google"
              />
              {authMode === "login"
                ? "Entrar com Google"
                : "Cadastrar com Google"}
            </button>
            <div className="divider">
              <span>ou use seu e-mail</span>
            </div>
          </>
        )}

        <form className="auth-form" onSubmit={handleAuth}>
          {authMode === "register" && (
            <>
              <input
                name="fullName"
                type="text"
                placeholder="Nome Completo"
                required
                disabled={loading}
              />
              <input
                name="phone"
                type="tel"
                placeholder="Telefone: 011 952378000"
                required
                disabled={loading}
              />
            </>
          )}

          <input
            name="email"
            type="email"
            placeholder="E-mail"
            required
            disabled={loading}
          />
          {authMode !== "forgot" && (
            <input
              name="password"
              type="password"
              placeholder="Senha"
              required
              disabled={loading}
            />
          )}

          {authMode === "login" && (
            <button
              type="button"
              className="link-text"
              onClick={() => setAuthMode("forgot")}
              disabled={loading}
            >
              Esqueceu a senha?
            </button>
          )}

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? (
              "Aguarde..."
            ) : authMode === "login" ? (
              "Entrar"
            ) : authMode === "register" ? (
              "Finalizar Cadastro"
            ) : (
              "Enviar Link"
            )}
          </button>
        </form>

        <div className="modal-footer">
          <p>
            {authMode === "login" ? "Não tem conta? " : "Já possui conta? "}
            <button
              disabled={loading}
              onClick={() =>
                setAuthMode(authMode === "login" ? "register" : "login")
              }
            >
              {authMode === "login" ? "Cadastre-se" : "Fazer Login"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
