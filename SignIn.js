import { Button } from "@mui/material";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/firebase";

export default function GoogleSignIn() {
  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      console.log("User signed in successfully with Google");
    } catch (error) {
      console.error("Error signing in with Google:", error);
    }
  };

  return (
    <Button variant="contained" onClick={handleGoogleSignIn}>
      Sign in with Google
    </Button>
  );
}
