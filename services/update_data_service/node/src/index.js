import { AppServer } from "./AppServer.js";

const PORT = process.env.PORT || 3000;
const app = new AppServer();
app.start(PORT);
