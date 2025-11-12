import { IQuestRepository } from '../../domain/interfaces/quest-repository.interface';
import { IQuestDocument } from '../../domain/models/quest.model';
import { Quest } from '../../domain/types/quest.types';
import { QuestModel } from '../database/schemas/quest.schema';

export class QuestRepository implements IQuestRepository {
  async findAll(): Promise<IQuestDocument[]> {
    return await QuestModel.find().sort({ 'requirement.value': 1 });
  }

  async findById(id: string): Promise<IQuestDocument | null> {
    return await QuestModel.findById(id);
  }

  async create(data: Omit<Quest, 'id'>): Promise<IQuestDocument> {
    const quest = await QuestModel.create(data);
    return quest;
  }

  async count(): Promise<number> {
    return await QuestModel.countDocuments();
  }
}
