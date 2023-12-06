/* eslint-disable prettier/prettier */

import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterUserDto {

    @IsEmail()
    email: string;
    
    @IsString()
    username: string;

    @MinLength(6)
    password: string;



}