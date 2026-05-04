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
    origin: "http://localhost:5180", 
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
    returnTo: 'http://localhost:5180/profile',
    authorizationParams: { screen_hint: 'signup' },
  })
);

app.get('/login', (req, res) =>
  res.oidc.login({
    returnTo: 'http://localhost:5180/profile',
  })
);

app.get('/', (req, res) => {
  if (req.oidc.isAuthenticated()) {
    return res.redirect('http://localhost:5180/profile');
  }

  res.type('html').send(`
    <p>Please log in via the frontend at http://localhost:5180</p>
    <a href="/login">Or Login here</a>
  `);
});

app.get("/books", (req, res) => {
  res.json([
    { id: 1, title: "The Great Gatsby", author: "F. Scott Fitzgerald" },
    { id: 2, title: "1984", author: "George Orwell" },
    { id: 3, title: "To Kill a Mockingbird", author: "Harper Lee" }
  ]);
});

app.get("/profile", requiresAuth(), (req, res) => {
  res.json(req.oidc.user);
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on http://localhost:${port}`));