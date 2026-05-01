import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import express from 'express';
import { createServer } from 'node:http';
// We build a small test version of the backend here.
// Instead of using the real requiresAuth() middleware (which needs
// a real Auth0 session), we write a simple stand-in that behaves
// the same way: block the request if there is no user, allow it if there is.
const fakeRequiresAuth = (req, res, next) => {
if (!req.headers['x-test-user']) {
return res.status(401).json({ error: 'Not authenticated' });
}
req.oidc = { user: { name: 'Ada', email: 'ada@test.com' } };
next();
};
// Small test app — same routes as your real backend
const app = express();
app.use(express.json());
app.get('/profile', fakeRequiresAuth, (req, res) => {
res.json(req.oidc.user);
});
app.get('/secure-data', fakeRequiresAuth, (req, res) => {
res.json({ message: 'This is protected data', user: req.oidc.user });
});
// Start the server before tests, shut it down after
let server;
let baseUrl;
beforeAll(() => {
server = createServer(app);
server.listen(0); // port 0 = pick any free port automatically
const { port } = server.address();
baseUrl = `http://localhost:${port}`;
});
afterAll(() => server.close());
describe('GET /profile', () => {
// Test 1: no session — should be blocked
it('returns 401 when the user is not logged in', async () => {
const res = await fetch(`${baseUrl}/profile`);
expect(res.status).toBe(401);
});
// Test 2: with session — should return user data
it('returns user data when the user is logged in', async () => {
const res = await fetch(`${baseUrl}/profile`, {
headers: { 'x-test-user': 'true' },
});
const data = await res.json();
expect(res.status).toBe(200);
expect(data.email).toBe('ada@test.com');
});
});
describe('GET /secure-data', () => {
// Test 3: no session — should be blocked
it('returns 401 when the user is not logged in', async () => {
const res = await fetch(`${baseUrl}/secure-data`);
expect(res.status).toBe(401);
});
// Test 4: with session — should return protected data
it('returns protected data when the user is logged in', async () => {
const res = await fetch(`${baseUrl}/secure-data`, {
headers: { 'x-test-user': 'true' },
});
const data = await res.json();
expect(res.status).toBe(200);
expect(data.message).toMatch(/protected data/i);
});
});