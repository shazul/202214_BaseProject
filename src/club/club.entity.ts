/* eslint-disable prettier/prettier */
import { MemberEntity } from '../member/member.entity';
import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class ClubEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  image: string;

  @ManyToMany(() => MemberEntity, member => member.clubs)
  @JoinTable({ name: 'clubs_members' })
  members: MemberEntity[];
}
