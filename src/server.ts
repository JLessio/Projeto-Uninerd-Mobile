import dotenv from 'dotenv';
import createApp from './config/app';
import db, { testConnection } from './database/connection';
import { CancellationMessageService } from './services/CancellationMessageService';

dotenv.config();

const app = createApp();
const PORT = process.env.PORT || 3000;

export default app;

if (require.main === module) {
  const start = async () => {
    await testConnection();
    try {
      const migratedMessages = await new CancellationMessageService().backfill(db);
      if (migratedMessages > 0) console.log(`${migratedMessages} mensagem(ns) de cancelamento antiga(s) salva(s) em uploads/messages.`);
    } catch (error) {
      console.error('Erro ao salvar mensagens antigas de cancelamento:', error);
    }
    app.listen(PORT, () => {
      console.log(`Servidor atendendo em http://localhost:${PORT}`);
    });
  };
  void start();
}
