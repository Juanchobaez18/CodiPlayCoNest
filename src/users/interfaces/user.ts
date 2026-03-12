import { Role } from "src/roles/entities/role.entity";

export interface UserModel {
    id: number,
    email: string,
    password? : string,
    isActive: boolean,
    roles: Role[],
}