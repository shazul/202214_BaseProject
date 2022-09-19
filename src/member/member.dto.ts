/* eslint-disable prettier/prettier */
import {IsDate, IsEmail, IsNotEmpty, IsString } from 'class-validator';
export class MemberDto {

 @IsString()
 @IsNotEmpty()
 readonly username: string;

 @IsString()
 @IsEmail()
 @IsNotEmpty()
 readonly email: string;

 @IsDate()
 @IsNotEmpty()
 readonly birthdate: Date;
}