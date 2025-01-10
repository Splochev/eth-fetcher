import jwt from 'jsonwebtoken';
import { Request } from 'express';
import UserDto from '../dto/UserDto';

export default class AuthHelpers {
    static getUser(req: Request): UserDto | null {
        let token = req.headers.auth_token
        if (!token) return null;
        if (typeof token !== 'string') return null

        jwt.verify(token, process.env.JWT_SECRET as string, (err, decoded) => {
            if (err) throw (err);
        });

        const decoded = jwt.decode(token as string) as UserDto;
        return { id: decoded.id, username: decoded.username } as UserDto;
    }
}
