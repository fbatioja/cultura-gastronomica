import { Injectable } from '@nestjs/common';
import { User } from './user';
import { Role } from './role.enum';

@Injectable()
export class UserService {
  private users: User[] = [
    new User(1, 'admin', 'admin', [Role.ADMIN]),
    new User(2, 'user', 'user', [Role.USER]),
    new User(3, 'manager', 'manager', [Role.MANAGER]),
    new User(4, 'staff', 'staff', [Role.STAFF]),
    new User(5, 'supervisor', 'supervisor', [Role.SUPERVISOR]),
  ];

  async findOne(username: string): Promise<User | undefined> {
    return this.users.find((user) => user.username === username);
  }
}
