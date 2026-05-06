import "dotenv/config";
import app from "./app.js";

const PORT = process.env.PORT || 3000;

const start = () => {
  try {
    app.listen(PORT, () => {
      console.log(`Сервер запустився на порту ${PORT}`);
    });
  } catch (error) {
    console.error("Помилка запуску сервера: ", error);
  }
};

start();
