import { IUserDocument } from '../models/user.model'

export interface IUserRepository {
  create(data: {
    username: string
    email: string
    password: string
  }): Promise<IUserDocument>

  findById(id: string): Promise<IUserDocument | null>

  findByEmail(email: string): Promise<IUserDocument | null>

  findByUsername(username: string): Promise<IUserDocument | null>

  existsByEmail(email: string): Promise<boolean>

  existsByUsername(username: string): Promise<boolean>
}
