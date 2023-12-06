import { IsEmail, IsString, MinLength } from 'class-validator';

/* eslint-disable prettier/prettier */
export class CreateUserDto {

    @IsEmail()
    email: string;
    
    @IsString()
    username: string;

    @MinLength(6)
    password: string;



}

