import { IUserRepository } from '../../domain/interfaces/user-repository.interface'
import { IUserDocument } from '../../domain/models/user.model'
import { UserModel } from '../database/schemas/user.schema'

export class UserRepository implements IUserRepository {
  async create(data: {
    username: string
    email: string
    password: string
  }): Promise<IUserDocument> {
    const user = await UserModel.create(data)
    return user
  }

  async findById(id: string): Promise<IUserDocument | null> {
    return await UserModel.findById(id).select('+password +passwordChangedAt')
  }

  async findByEmail(email: string): Promise<IUserDocument | null> {
    return await UserModel.findOne({ email }).select('+password')
  }

  async findByUsername(username: string): Promise<IUserDocument | null> {
    return await UserModel.findOne({ username }).select('+password')
  }

  async existsByEmail(email: string): Promise<boolean> {
    const count = await UserModel.countDocuments({ email })
    return count > 0
  }

  async existsByUsername(username: string): Promise<boolean> {
    const count = await UserModel.countDocuments({ username })
    return count > 0
  }
}
