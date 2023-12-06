/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './entities/user.entity';
import { Model } from 'mongoose';
import * as bcryptjs from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';

import { JwtPayload } from './interfaces/jwt-payload';
import { LoginResponse } from './interfaces/login-response';

import { LoginDto, RegisterUserDto, CreateUserDto, UpdateUserDto } from './dto';
import { log } from 'console';


@Injectable()
export class AuthService {

  constructor( @InjectModel( User.name ) private userMode: Model<User>, private jwt: JwtService ) {};

  async login( loginDto: LoginDto ):Promise<LoginResponse> {

    const { email, password } = loginDto

    const user = await this.userMode.findOne({ email });
    if( !user ) {
      throw new UnauthorizedException('Credenciales invalidas');
    }

    if( !bcryptjs.compareSync(password, user.password)) {
      throw new UnauthorizedException('Credenciales invalidas');
    }

    const { password:_, ...resp } = user.toJSON();


    return {
      user: resp,
      token: this.getJwt( { id: user.id } ),
    }

  };

  async register( registerUserDto: RegisterUserDto ):Promise<LoginResponse>{

    const user = await this.create( registerUserDto );

    return {
      user,
      token: this.getJwt( { id: user._id } ),
    }
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    
    try {

      const { password, ...userData } = createUserDto;

      const newUser = new this.userMode({
        password: bcryptjs.hashSync( password, 10 ),
        ...userData
      });

      await newUser.save();
      const { password:_, ...user} = newUser.toJSON();


      return user;
      
    } catch (error) {
      if( error.code === 11000 ){
        throw new BadRequestException('El correo ya esta en uso');
      }
      throw new InternalServerErrorException('Error al crear el usuario');
    }


  }

  findAll():Promise<User[]> {

    const data = this.userMode.find( {}, { password: 0} )

    return data ;
  }

  async findUserById( id: string ):Promise<User> {
    const user = await this.userMode.findById( id, { password: 0} );
    return user;
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }

  getJwt( payload: JwtPayload, ){
    const token = this.jwt.sign( payload );
    return token;
  }

}
