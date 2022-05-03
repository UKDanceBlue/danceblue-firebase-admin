import { useEffect, useState } from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import MenuIcon from "@mui/icons-material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { useNavigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, functions } from "../firebase/firebaseApp";
import { useAuthClaims, useSignInWithUkMicrosoft } from "../customHooks";
import { signOut } from "firebase/auth";
import { httpsCallable } from "firebase/functions";
import { Drawer } from "@mui/material";

const navLinks = [
  {
    title: "Home",
    path: "/",
  },
  {
    title: "Marathon Manager",
    path: "/marathon-console",
    requiredClaims: [
      { claimKey: "dbRole", claimValues: ["committee"] },
      { claimKey: "committeeRank", claimValues: ["coordinator", "chair"] },
    ],
  },
  {
    title: "Spirit Point Manager",
    path: "/spirit-console",
    requiredClaims: [
      { claimKey: "dbRole", claimValues: ["committee"] },
      { claimKey: "committeeRank", claimValues: ["coordinator", "chair"] },
    ],
  },
  {
    title: "Morale Point Manager",
    path: "/morale-console",
    requiredClaims: [
      { claimKey: "dbRole", claimValues: ["committee"] },
      { claimKey: "committeeRank", claimValues: ["coordinator", "chair"] },
    ],
  },
  {
    title: "Notification Manager",
    path: "/notification-console",
    requiredClaims: [
      { claimKey: "dbRole", claimValues: ["committee"] },
      { claimKey: "committeeRank", claimValues: ["coordinator", "chair"] },
    ],
  },
];

const MenuBar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const authClaims = useAuthClaims(auth);

  const navigate = useNavigate();

  const [user] = useAuthState(auth);
  const [triggerLogin, userCredential] = useSignInWithUkMicrosoft(auth);

  useEffect(() => {
    if (userCredential) {
      // If there is a userCredential, then the user has just signed in and may need claims updated
      // Calling getIdTokenResult forces the client to get a new token, updating useAuthClaims
      httpsCallable(
        functions,
        "updateUserClaims"
      )("").then(userCredential.user.getIdTokenResult(true));
    }
  }, [userCredential]);

  return (
    <AppBar position="sticky">
      <Toolbar disableGutters variant="dense" sx={{ display: "flex" }}>
        <img
          style={{
            padding: "0.5em",
            height: "5em",
            width: "5em",
          }}
          alt="DanceBlue Logo"
          src="/db_app_portal_logo.png"
        />
        <Box sx={{ flex: 9, display: { xs: "flex", md: "none" } }}>
          <IconButton
            size="large"
            onClick={() => {
              setMenuOpen(true);
            }}
            color="inherit"
          >
            <MenuIcon />
          </IconButton>
          <Drawer
            variant="temporary"
            ModalProps={{
              keepMounted: true,
            }}
            anchor="left"
            open={Boolean(menuOpen)}
            onClose={() => {
              setMenuOpen(false);
            }}
          >
            {navLinks
              .filter((page) => {
                if (!page.requiredClaims) {
                  return true;
                }
                if (!authClaims) {
                  return false;
                }
                return page.requiredClaims.every((claim) =>
                  claim.claimValues.includes(authClaims[claim.claimKey])
                );
              })
              .map((page) => (
                <MenuItem key={page.path} onClick={() => navigate(page.path)}>
                  <Typography textAlign="center">{page.title}</Typography>
                </MenuItem>
              ))}
          </Drawer>
        </Box>
        <Box
          sx={{
            flex: 9,
            display: { xs: "none", md: "flex" },
          }}
        >
          {navLinks
            .filter((page) => {
              if (!page.requiredClaims) {
                return true;
              }
              if (!authClaims) {
                return false;
              }
              return page.requiredClaims.every((claim) =>
                claim.claimValues.includes(authClaims[claim.claimKey])
              );
            })
            .map((page) => (
              <MenuItem key={page.path} onClick={() => navigate(page.path)}>
                <Typography textAlign="center">{page.title}</Typography>
              </MenuItem>
            ))}
        </Box>
        {(!user || user.isAnonymous) && (
          <Box>
            <MenuItem onClick={triggerLogin}>
              <Typography textAlign="center">Login</Typography>
            </MenuItem>
          </Box>
        )}
        {user && !user.isAnonymous && (
          <Box>
            <MenuItem onClick={() => signOut(auth)}>
              <Typography textAlign="center">Log Out</Typography>
            </MenuItem>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};
export default MenuBar;