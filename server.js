'use strict';

import path from 'path';
import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5173;

app.use(cors());
app.use(express.json());

// Health and meta endpoints - handy for E2E harnesses later
app.get('/health', (req, res) => {
	res.json({ status: 'ok' });
});

app.get('/version', (req, res) => {
	res.json({ name: 'todo-training-app', version: '0.1.0' });
});

// Serve static frontend
const publicDir = path.join(__dirname, 'public');
app.use(express.static(publicDir, { extensions: ['html'] }));

// Fallback to index.html for root
app.get('/', (req, res) => {
	res.sendFile(path.join(publicDir, 'index.html'));
});

app.listen(PORT, () => {
	// eslint-disable-next-line no-console
	console.log(`Server listening on http://localhost:${PORT}`);
});


