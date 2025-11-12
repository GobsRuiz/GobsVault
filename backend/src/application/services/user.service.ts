import bcrypt from 'bcrypt'
import { IUserRepository } from '../../domain/interfaces/user-repository.interface'
import { UnauthorizedError, NotFoundError } from '../../shared/errors/AppError'
import { UserModel } from '../../infrastructure/database/schemas/user.schema'

export class UserService {
  private readonly BCRYPT_ROUNDS = 12

  constructor(
    private readonly userRepository: IUserRepository,
    private readonly tokenBlacklistService?: any // Optional para não quebrar código existente
  ) {}

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    // Busca o usuário com a senha
    const user = await this.userRepository.findById(userId)

    if (!user) {
      throw new NotFoundError('Usuário não encontrado')
    }

    // Verifica se a senha atual está correta
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password)
    if (!isPasswordValid) {
      throw new UnauthorizedError('Senha atual incorreta')
    }

    // Verifica se a nova senha é diferente da atual
    const isSamePassword = await bcrypt.compare(newPassword, user.password)
    if (isSamePassword) {
      throw new UnauthorizedError('A nova senha deve ser diferente da senha atual')
    }

    // Hash da nova senha
    const hashedPassword = await bcrypt.hash(newPassword, this.BCRYPT_ROUNDS)

    // Atualiza a senha e o timestamp de mudança
    await UserModel.findByIdAndUpdate(userId, {
      password: hashedPassword,
      passwordChangedAt: new Date()
    })

    // Revoga todos os tokens do usuário (logout-all automático)
    if (this.tokenBlacklistService) {
      await this.tokenBlacklistService.revokeAllUserTokens(userId)
    }
  }
}
