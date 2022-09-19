/* eslint-disable prettier/prettier */
import {IsNotEmpty, IsString, IsUrl, MaxLength} from 'class-validator';
export class ClubDto {

 @IsString()
 @IsNotEmpty()
 readonly name: string;

 @IsString()
 @IsNotEmpty()
 @MaxLength(100)
 readonly description: string;

 @IsUrl()
 @IsNotEmpty()
 readonly image: string;
}