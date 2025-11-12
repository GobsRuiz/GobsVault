/**
 * Main Seeder Script
 * Executes all database seeders
 */

import { mongoClient } from '../mongodb.client';
import { seedQuests } from './quest.seeder';

async function runSeeders(): Promise<void> {
  console.log('🚀 Iniciando execução dos seeders...\n');

  try {
    // Connect to MongoDB
    await mongoClient.connect();
    console.log('✅ Conectado ao MongoDB\n');

    // Run seeders
    await seedQuests();

    console.log('✅ Todos os seeders executados com sucesso!\n');
  } catch (error) {
    console.error('❌ Erro ao executar seeders:', error);
    process.exit(1);
  } finally {
    // Disconnect from MongoDB
    await mongoClient.disconnect();
    console.log('👋 Desconectado do MongoDB');
    process.exit(0);
  }
}

// Execute seeders
runSeeders();
