/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { log } from 'console';
import * as request from 'supertest';
import { JwtPayload } from '../interfaces/jwt-payload';
import { AuthService } from '../auth.service';

@Injectable()
export class AuthGuard implements CanActivate {

  constructor( private jwt: JwtService, private authService: AuthService  ){}
  
  async canActivate( context: ExecutionContext): Promise<boolean>  {
    
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException();
    }

    try {
      const payload = await this.jwt.verifyAsync<JwtPayload>(
        token,
        {
          secret: process.env.JWT_SEED,
        },
        );

        const user = await this.authService.findUserById( payload.id );
        if( !user ) {
          throw new UnauthorizedException('Usuario no existe');
        }
        if( !user.isActive ) {
          throw new UnauthorizedException('Usuario inactivo');
        }

      
      request['user'] = user;
    } catch (error) {
      throw new UnauthorizedException();
    }

    return true;

  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers['authorization']?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

}
