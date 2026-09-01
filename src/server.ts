import dotenv from 'dotenv';
import createApp from './config/app';
import { testConnection } from './database/connection';

dotenv.config();

const app = createApp();
const PORT = process.env.PORT || 3000;

export default app;

if (require.main === module) {
  testConnection();

  app.listen(PORT, () => {
    console.log(`Servidor atendendo em http://localhost:${PORT}`);
  });
}
