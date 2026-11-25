import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;

let foods = [
  { id: 1, foodName: 'Pizza', category: 'Fast Food', price: 250, availability: true },
  { id: 2, foodName: 'Burger', category: 'Fast Food', price: 150, availability: false },
  { id: 3, foodName: 'Cold Coffee', category: 'Beverage', price: 120, availability: true }
];

const sendJson = (res, statusCode, payload) => {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(payload));
};

const sendHtml = (res, statusCode, html) => {
  res.writeHead(statusCode, { 'Content-Type': 'text/html' });
  res.end(html);
};

const server = http.createServer((req, res) => {
  const method = req.method;
  const reqUrl = new URL(req.url, `http://localhost:${PORT}`).pathname;

  if (method === 'GET' && reqUrl === '/') {
    sendHtml(res, 200, '<h1>Welcome to the Online Food Ordering System</h1><p>Order fresh meals online.</p>');
  } else if (method === 'GET' && reqUrl === '/about') {
    sendHtml(res, 200, '<h1>About Our Restaurant</h1><p>Serving quality food items made fresh daily.</p>');
  } else if (method === 'GET' && reqUrl === '/foods') {
    const availableFoods = foods.filter((item) => item.availability === true);
    sendJson(res, 200, availableFoods);
  } else if (method === 'GET' && reqUrl === '/menu') {
    const menuPath = path.join(__dirname, 'public', 'menu.html');
    fs.readFile(menuPath, 'utf8', (err, content) => {
      if (err) {
        return sendHtml(res, 500, '<h1>500 - Internal Server Error</h1><p>Unable to load menu file.</p>');
      }
      sendHtml(res, 200, content);
    });
  } else if (method === 'POST' && reqUrl === '/add-food') {
    let rawBody = '';

    req.on('data', (chunk) => {
      rawBody += chunk.toString();
    });

    req.on('end', () => {
      let parsed;
      try {
        parsed = JSON.parse(rawBody);
      } catch {
        return sendJson(res, 400, { error: 'Invalid JSON in request body' });
      }

      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        return sendJson(res, 400, { error: 'Request body must be a JSON object' });
      }

      const { id, foodName, category, price, availability } = parsed;

      if (
        id === undefined ||
        typeof foodName !== 'string' ||
        foodName.trim() === '' ||
        typeof category !== 'string' ||
        category.trim() === '' ||
        typeof price !== 'number' ||
        Number.isNaN(price) ||
        price <= 0 ||
        typeof availability !== 'boolean'
      ) {
        return sendJson(res, 400, {
          error: 'Missing or invalid required fields: id, foodName, category, price, availability'
        });
      }

      if (foods.some((item) => item.id === id)) {
        return sendJson(res, 400, { error: `Food item with id ${id} already exists` });
      }

      const newFood = {
        id,
        foodName: foodName.trim(),
        category: category.trim(),
        price,
        availability
      };

      foods.push(newFood);
      sendJson(res, 201, {
        message: 'Food item added successfully',
        food: newFood
      });
    });
  } else {
    sendJson(res, 404, { error: 'Route not found' });
  }
});

server.listen(PORT, () => {
  console.log(`HTTP Server running at http://localhost:${PORT}`);
});