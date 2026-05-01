import 'dotenv/config'; 
import express from "express";
import pkg from "express-openid-connect";
import cors from "cors";
import escape from "escape-html";

const { auth, requiresAuth } = pkg;
const app = express();

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173", 
    credentials: true, // Required for the session cookie to work with the frontend
  })
);

// Auth0 Configuration
app.use(
  auth({
    authRequired: false, 
    auth0Logout: true,
    secret: process.env.SECRET,
    baseURL: process.env.BASE_URL,
    clientID: process.env.CLIENT_ID,
    issuerBaseURL: process.env.ISSUER_BASE_URL,
  })
);

// Routes

app.get('/signup', (req, res) =>
  res.oidc.login({
    returnTo: 'http://localhost:5173/profile',
    authorizationParams: { screen_hint: 'signup' },
  })
);

app.get('/login', (req, res) =>
  res.oidc.login({
    returnTo: 'http://localhost:5173/profile',
  })
);

app.get('/', (req, res) => {
  if (req.oidc.isAuthenticated()) {
    return res.redirect('http://localhost:5173/profile');
  }

  res.type('html').send(`
    <p>Please log in via the frontend at http://localhost:5173</p>
    <a href="/login">Or Login here</a>
  `);
});

app.get("/profile", requiresAuth(), (req, res) => {
  res.json(req.oidc.user);
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on http://localhost:${port}`));