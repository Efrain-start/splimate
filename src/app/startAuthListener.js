// src/app/startAuthListener.js
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import { setUser, setReady, clearUser } from "../features/auth/authSlice";

let unsub = null;

export const startAuthListener = () => (dispatch) => {
  if (unsub) return;

  unsub = onAuthStateChanged(auth, (user) => {
    if (user) {
      dispatch(
        setUser({
          uid: user.uid,
          name: user.displayName || "Sin nombre",
          email: user.email || "",
          photoURL: user.photoURL || "",
        })
      );
    } else {
      dispatch(clearUser());
    }
    dispatch(setReady(true));
  });
};
