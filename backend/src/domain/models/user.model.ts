import { Document } from 'mongoose'
import { IUserBase } from '../../../../shared/types/user.types'

export interface IUserDocument extends IUserBase, Document {}
