import {
  Auth,
  AuthError,
  onIdTokenChanged,
  ParsedToken,
  User,
  UserCredential,
} from "firebase/auth";
import { useEffect, useState } from "react";
import { useSignInWithMicrosoft } from "react-firebase-hooks/auth";

export const useSignInWithUkMicrosoft = (
  auth: Auth
): [() => Promise<void>, UserCredential | undefined, boolean, AuthError | undefined] => {
  const [signInWithMicrosoft, userCredential, loading, error] = useSignInWithMicrosoft(auth);

  const signInWithUkMicrosoft = () =>
    signInWithMicrosoft(["profile", "email", "openid", "offline_access", "User.Read"], {
      tenant: "2b30530b-69b6-4457-b818-481cb53d42ae",
      domain_hint: "uky.edu",
    });

  return [signInWithUkMicrosoft, userCredential, loading, error];
};

const updateAuthClaims = async (
  user: User,
  setAuthClaims: React.Dispatch<React.SetStateAction<ParsedToken | null>>
) => {
  if (!user) {
    setAuthClaims({});
  } else {
    const idToken = await user.getIdTokenResult();
    setAuthClaims(idToken.claims);
  }
};

/**
 * A hook that returns the current user's claims.
 * @param auth - Firebase Auth instance
 * @return Returns null if no ID token has yet been checked, otherwise returns the user's auth claims object
 */
export const useAuthClaims = (auth: Auth): ParsedToken | null => {
  const [authClaims, setAuthClaims] = useState<ParsedToken | null>(null);

  useEffect(
    () =>
      onIdTokenChanged(
        auth,
        (user) => {
          if (user) {
            void updateAuthClaims(user, setAuthClaims);
          } else {
            setAuthClaims(null);
          }
        },
        () => {
          setAuthClaims({});
        }
      ),
    [auth]
  );

  return authClaims;
};