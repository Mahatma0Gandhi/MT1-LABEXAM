import express from 'express';

const app = express();
const PORT = 4000;

app.use(express.json());

let foods = [
  { id: 1, foodName: 'Pizza', category: 'Fast Food', price: 250, availability: true },
  { id: 2, foodName: 'Burger', category: 'Fast Food', price: 150, availability: true },
  { id: 3, foodName: 'Cold Coffee', category: 'Beverage', price: 120, availability: true }
];

const parsePositiveIntId = (value) => {
  if (!/^\d+$/.test(value)) return null;
  const num = Number(value);
  return Number.isSafeInteger(num) && num > 0 ? num : null;
};

app.get('/foods', (req, res) => {
  res.status(200).json(foods);
});

app.get('/foods/:id', (req, res) => {
  const id = parsePositiveIntId(req.params.id);
  if (!id) {
    return res.status(400).json({ error: 'Invalid food ID' });
  }

  const food = foods.find((item) => item.id === id);
  if (!food) {
    return res.status(404).json({ error: 'Food item not found' });
  }

  res.status(200).json(food);
});

app.post('/foods', (req, res) => {
  if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
    return res.status(400).json({ error: 'Invalid request body' });
  }

  const { id, foodName, category, price, availability } = req.body;

  if (
    typeof id !== 'number' ||
    !Number.isInteger(id) ||
    id <= 0 ||
    typeof foodName !== 'string' ||
    foodName.trim() === '' ||
    typeof category !== 'string' ||
    category.trim() === '' ||
    typeof price !== 'number' ||
    Number.isNaN(price) ||
    price <= 0 ||
    typeof availability !== 'boolean'
  ) {
    return res.status(400).json({
      error: 'Required fields missing or invalid (price must be a positive number)'
    });
  }

  if (foods.some((item) => item.id === id)) {
    return res.status(400).json({ error: `Food item with id ${id} already exists` });
  }

  const newFood = {
    id,
    foodName: foodName.trim(),
    category: category.trim(),
    price,
    availability
  };

  foods.push(newFood);
  res.status(201).json({
    message: 'Food item added successfully',
    food: newFood
  });
});

app.put('/foods/:id', (req, res) => {
  const id = parsePositiveIntId(req.params.id);
  if (!id) {
    return res.status(400).json({ error: 'Invalid food ID' });
  }

  const food = foods.find((item) => item.id === id);
  if (!food) {
    return res.status(404).json({ error: 'Food item not found' });
  }

  if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
    return res.status(400).json({ error: 'Invalid request body' });
  }

  const { foodName, category, price, availability } = req.body;

  if (
    foodName === undefined &&
    category === undefined &&
    price === undefined &&
    availability === undefined
  ) {
    return res.status(400).json({ error: 'At least one field must be provided to update' });
  }

  if (foodName !== undefined && (typeof foodName !== 'string' || foodName.trim() === '')) {
    return res.status(400).json({ error: 'foodName must be a non-empty string' });
  }

  if (category !== undefined && (typeof category !== 'string' || category.trim() === '')) {
    return res.status(400).json({ error: 'category must be a non-empty string' });
  }

  if (price !== undefined && (typeof price !== 'number' || Number.isNaN(price) || price <= 0)) {
    return res.status(400).json({ error: 'price must be a positive number' });
  }

  if (availability !== undefined && typeof availability !== 'boolean') {
    return res.status(400).json({ error: 'availability must be a boolean' });
  }

  if (foodName !== undefined) food.foodName = foodName.trim();
  if (category !== undefined) food.category = category.trim();
  if (price !== undefined) food.price = price;
  if (availability !== undefined) food.availability = availability;

  res.status(200).json({
    message: 'Food item updated successfully',
    food
  });
});

app.delete('/foods/:id', (req, res) => {
  const id = parsePositiveIntId(req.params.id);
  if (!id) {
    return res.status(400).json({ error: 'Invalid food ID' });
  }

  const index = foods.findIndex((item) => item.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Food item not found' });
  }

  const [deletedFood] = foods.splice(index, 1);
  res.status(200).json({
    message: 'Food item deleted successfully',
    food: deletedFood
  });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Express Server running at http://localhost:${PORT}`);
});