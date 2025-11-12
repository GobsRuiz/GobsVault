/**
 * Quest Seeder
 * Populates the database with initial fixed quests
 */

import { QuestModel } from '../schemas/quest.schema';
import { Quest } from '../../../domain/types/quest.types';

const initialQuests: Omit<Quest, 'id'>[] = [
  {
    title: 'Primeiro Trade',
    description: 'Execute seu primeiro trade e comece sua jornada como trader',
    requirement: {
      type: 'TOTAL_TRADES',
      value: 1
    },
    reward: {
      xp: 50
    }
  },
  {
    title: 'Trader Ativo',
    description: 'Execute 5 trades e mostre que está ativo no mercado',
    requirement: {
      type: 'TOTAL_TRADES',
      value: 5
    },
    reward: {
      xp: 100
    }
  },
  {
    title: 'Trader Experiente',
    description: 'Execute 10 trades e demonstre experiência no mercado',
    requirement: {
      type: 'TOTAL_TRADES',
      value: 10
    },
    reward: {
      xp: 200
    }
  },
  {
    title: 'Trader Dedicado',
    description: 'Execute 25 trades e prove sua dedicação',
    requirement: {
      type: 'TOTAL_TRADES',
      value: 25
    },
    reward: {
      xp: 350
    }
  },
  {
    title: 'Trader Veterano',
    description: 'Execute 50 trades e alcance o status de veterano',
    requirement: {
      type: 'TOTAL_TRADES',
      value: 50
    },
    reward: {
      xp: 500
    }
  },
  {
    title: 'Trader Mestre',
    description: 'Execute 100 trades e torne-se um mestre do trading',
    requirement: {
      type: 'TOTAL_TRADES',
      value: 100
    },
    reward: {
      xp: 1000
    }
  },
  {
    title: 'Portfolio Diversificado',
    description: 'Possua 3 criptomoedas diferentes no seu portfolio',
    requirement: {
      type: 'PORTFOLIO_DIVERSITY',
      value: 3
    },
    reward: {
      xp: 150
    }
  },
  {
    title: 'Colecionador de Criptos',
    description: 'Possua todas as 5 criptomoedas disponíveis',
    requirement: {
      type: 'PORTFOLIO_DIVERSITY',
      value: 5
    },
    reward: {
      xp: 300
    }
  },
  {
    title: 'Investidor Sério',
    description: 'Alcance um patrimônio total de $15.000',
    requirement: {
      type: 'NET_WORTH',
      value: 15000
    },
    reward: {
      xp: 300
    }
  },
  {
    title: 'Investidor Próspero',
    description: 'Alcance um patrimônio total de $25.000',
    requirement: {
      type: 'NET_WORTH',
      value: 25000
    },
    reward: {
      xp: 600
    }
  },
  {
    title: 'Investidor Rico',
    description: 'Alcance um patrimônio total de $50.000',
    requirement: {
      type: 'NET_WORTH',
      value: 50000
    },
    reward: {
      xp: 1000
    }
  },
  {
    title: 'Investidor Milionário',
    description: 'Alcance um patrimônio total de $100.000',
    requirement: {
      type: 'NET_WORTH',
      value: 100000
    },
    reward: {
      xp: 2000
    }
  }
];

export async function seedQuests(): Promise<void> {
  console.log('🌱 Iniciando seed de quests...');

  try {
    let created = 0;
    let updated = 0;

    for (const quest of initialQuests) {
      const existingQuest = await QuestModel.findOne({ title: quest.title });

      if (existingQuest) {
        // Update existing quest
        existingQuest.description = quest.description;
        existingQuest.requirement = quest.requirement;
        existingQuest.reward = quest.reward;
        await existingQuest.save();
        updated++;
        console.log(`  ✏️  Quest atualizada: "${quest.title}"`);
      } else {
        // Create new quest
        await QuestModel.create(quest);
        created++;
        console.log(`  ✅ Quest criada: "${quest.title}"`);
      }
    }

    console.log(`\n✨ Seed de quests concluído!`);
    console.log(`   ${created} quests criadas`);
    console.log(`   ${updated} quests atualizadas`);
    console.log(`   Total: ${created + updated} quests no banco\n`);
  } catch (error) {
    console.error('❌ Erro ao executar seed de quests:', error);
    throw error;
  }
}
