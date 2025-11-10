export interface IUserBase {
  username: string
  email: string
  password: string

  createdAt: Date
  updatedAt: Date
  isActive: boolean

  balance: number
  xp: number
  level: number

  totalTrades: number
}

export interface IUser extends IUserBase {
  _id: string
}

export interface IUserResponse extends Omit<IUser, 'password'> {}

export interface IUserCreate {
  username: string
  email: string
  password: string
}
