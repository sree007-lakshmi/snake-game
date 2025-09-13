const canvas = document.getElementById('snakeCanvas');
const ctx = canvas.getContext('2d');

let snake = [{ x: 150, y: 150 }];
let food = { x: 300, y: 300 };
let direction = 'RIGHT';
let gameInterval;
let enableSlipperyControls = false;
let slowFoodSpawn = false;
let gameSpeed = 100;
let foodSpawnTimer = 0;
let score = 0;

// Draw a square (snake segment or food)
function drawSquare(x, y, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, 20, 20);
}

// Spawn food at a random position on the 20x20 grid
function spawnFood() {
  food.x = Math.floor(Math.random() * 30) * 20;
  food.y = Math.floor(Math.random() * 20) * 20;
}

// Update score on screen
function updateScoreDisplay() {
  document.getElementById("scoreDisplay").innerText = "Score: " + score;
}

// Game loop update
function update() {
  let head = { ...snake[0] };

  if (direction === 'RIGHT') head.x += 20;
  else if (direction === 'LEFT') head.x -= 20;
  else if (direction === 'UP') head.y -= 20;
  else if (direction === 'DOWN') head.y += 20;

  // Wrap around canvas edges
  head.x = (head.x + canvas.width) % canvas.width;
  head.y = (head.y + canvas.height) % canvas.height;

  // Check for self-collision
  for (let segment of snake) {
    if (segment.x === head.x && segment.y === head.y) {
      clearInterval(gameInterval);
      alert('Game Over! Final Score: ' + score);
      return;
    }
  }

  snake.unshift(head);

  // ✅ Fuzzy collision with food (easier)
  if (Math.abs(head.x - food.x) < 20 && Math.abs(head.y - food.y) < 20) {
    spawnFood();
    score++;
    updateScoreDisplay();
  } else {
    snake.pop(); // remove tail if not eating
  }

  // Draw the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawSquare(food.x, food.y, 'red');
  for (let segment of snake) {
    drawSquare(segment.x, segment.y, 'green');
  }
}

// Handle keyboard controls
document.addEventListener('keydown', e => {
  if (enableSlipperyControls && Math.random() < 0.2) {
    const directions = ['UP', 'DOWN', 'LEFT', 'RIGHT'];
    direction = directions[Math.floor(Math.random() * directions.length)];
    return;
  }

  if (e.key === 'ArrowUp' && direction !== 'DOWN') direction = 'UP';
  else if (e.key === 'ArrowDown' && direction !== 'UP') direction = 'DOWN';
  else if (e.key === 'ArrowLeft' && direction !== 'RIGHT') direction = 'LEFT';
  else if (e.key === 'ArrowRight' && direction !== 'LEFT') direction = 'RIGHT';
});

// Handle Start Game button click
document.getElementById('startBtn').addEventListener('click', () => {
  const location = document.getElementById("location").value.trim();
  if (!location) return alert("Please enter a city name!");

  // OpenWeatherMap API call
  const apiKey = "YOUR_API_KEY"; // 🔑 Replace with your real OpenWeatherMap API key
  const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${apiKey}&units=metric`;

  fetch(apiUrl)
    .then(res => res.json())
    .then(data => {
      const weather = data.weather[0].description.toLowerCase();
      const city = data.name;
      const temp = data.main.temp;
      const icon = data.weather[0].icon; // weather icon id

      const weatherDisplay = document.getElementById("weatherDisplay");
      const effectDisplay = document.getElementById("gameEffectDisplay");

      // Display weather info
      weatherDisplay.innerHTML = `
        <h2>🌍 ${city}</h2>
        <p>Current Weather: <strong>${weather}</strong></p>
        <p>🌡️ Temperature: ${temp} °C</p>
        <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="weather icon">
      `;

      // Reset effects
      enableSlipperyControls = false;
      slowFoodSpawn = false;
      gameSpeed = 100;

      // Weather-based game logic
      let effectMessage = "";

      if (weather.includes("clear") || weather.includes("sunny")) {
        effectMessage = "☀ Sunny: Snake moves faster (speed boost!)";
        gameSpeed = 50;
      } else if (weather.includes("rain")) {
        effectMessage = "🌧 Rainy: Controls become slippery (reduced control)";
        enableSlipperyControls = true;
        gameSpeed = 100;
      } else if (weather.includes("snow")) {
        effectMessage = "❄ Snowy: Food spawns slower (fewer snacks!)";
        slowFoodSpawn = true;
        gameSpeed = 120;
      } else if (weather.includes("cloud")) {
        effectMessage = "☁ Cloudy: Slightly reduced speed (chill vibes)";
        gameSpeed = 110;
      } else {
        effectMessage = "🌈 Default behavior: Normal speed and control";
        gameSpeed = 100;
      }

      effectDisplay.innerHTML = `
        <p><strong>Game Effect:</strong> ${effectMessage}</p>
      `;

      startSnakeGame(gameSpeed);
    })
    .catch(err => {
      alert('Failed to get weather data. Check city name or API key.');
      console.error(err);
    });
});

// Start or restart the game
function startSnakeGame(speed) {
  clearInterval(gameInterval);

  // Reset game state
  snake = [{ x: 150, y: 150 }];
  direction = 'RIGHT';
  spawnFood();
  foodSpawnTimer = 0;
  score = 0;
  updateScoreDisplay();

  gameInterval = setInterval(() => {
    if (slowFoodSpawn) {
      foodSpawnTimer++;
      if (foodSpawnTimer > 10) {
        spawnFood();
        foodSpawnTimer = 0;
      }
    }
    update();
  }, speed);
}


