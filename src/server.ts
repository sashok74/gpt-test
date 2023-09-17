import app from './app.js';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 3333;
const SERVER = process.env.SERVER || '127.0.0.1';
app.listen(PORT, SERVER, () => console.log(`start server at IP ADDRESS:${SERVER} PORT:${PORT}`));
