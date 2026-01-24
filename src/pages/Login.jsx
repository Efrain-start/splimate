import { useDispatch } from "react-redux";
import { loginWithGoogle } from "../app/authApi";

export default function Login() {
  const dispatch = useDispatch();

  const handleLogin = async () => {
    try {
      await loginWithGoogle();
      // el listener (startAuthListener) se encarga de guardar el user en redux
    } catch (e) {
      console.error(e);
      alert("No se pudo iniciar sesión con Google");
    }
  };

  return (
    <div style={{ maxWidth: 520, margin: "40px auto" }}>
      <h1>Entrar a SplitMate</h1>
      <p>Inicia sesión para poder compartir grupos con otras personas.</p>

      <button
        onClick={handleLogin}
        style={{
          width: "100%",
          padding: 14,
          borderRadius: 12,
          fontWeight: 800,
          cursor: "pointer",
        }}
      >
        Continuar con Google
      </button>
    </div>
  );
}
