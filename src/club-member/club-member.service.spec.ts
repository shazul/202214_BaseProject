/* eslint-disable prettier/prettier */
import { Test, TestingModule } from '@nestjs/testing';
import { MemberEntity } from '../member/member.entity';
import { Repository } from 'typeorm';
import { ClubEntity } from '../club/club.entity';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { ClubMemberService } from './club-member.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { faker } from '@faker-js/faker';

describe('ClubMemberService', () => {
  let service: ClubMemberService;
  let clubRepository: Repository<ClubEntity>;
  let memberRepository: Repository<MemberEntity>;
  let club: ClubEntity;
  let membersList : MemberEntity[];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig()],
      providers: [ClubMemberService],
    }).compile();

    service = module.get<ClubMemberService>(ClubMemberService);
    clubRepository = module.get<Repository<ClubEntity>>(getRepositoryToken(ClubEntity));
    memberRepository = module.get<Repository<MemberEntity>>(getRepositoryToken(MemberEntity));

    await seedDatabase();
  });

  const seedDatabase = async () => {
    memberRepository.clear();
    clubRepository.clear();

    membersList = [];
    for(let i = 0; i < 5; i++){
        const member: MemberEntity = await memberRepository.save({
          username: faker.internet.userName(),
          birthdate: faker.date.birthdate(),
          email: faker.internet.email()
        })
        membersList.push(member);
    }

    club = await clubRepository.save({
      name: faker.company.name(),
      description: faker.lorem.sentence(),
      image: faker.image.imageUrl(),
      members: membersList
    })
  }

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('addMemberClub should add an member to a club', async () => {
    const newMember: MemberEntity = await memberRepository.save({
      username: faker.internet.userName(),
      birthdate: faker.date.birthdate(),
      email: faker.internet.email()
    });

    const newClub: ClubEntity = await clubRepository.save({
      name: faker.company.name(),
      description: faker.lorem.sentence(),
      image: faker.image.imageUrl()
    })

    const result: ClubEntity = await service.addMemberClub(newClub.id, newMember.id);

    expect(result.members.length).toBe(1);
    expect(result.members[0]).not.toBeNull();
    expect(result.members[0].username).toBe(newMember.username)
    expect(result.members[0].birthdate).toStrictEqual(newMember.birthdate)
    expect(result.members[0].email).toBe(newMember.email)
  });

  it('addMemberClub should thrown exception for an invalid member', async () => {
    const newClub: ClubEntity = await clubRepository.save({
      name: faker.company.name(),
      description: faker.lorem.sentence(),
      image: faker.image.imageUrl()
    })

    await expect(() => service.addMemberClub(newClub.id, "0")).rejects.toHaveProperty("message", "The member with the given id was not found");
  });

  it('addMemberClub should throw an exception for an invalid club', async () => {
    const newMember: MemberEntity = await memberRepository.save({
      username: faker.internet.userName(),
      birthdate: faker.date.birthdate(),
      email: faker.internet.email()
    });

    await expect(() => service.addMemberClub("0", newMember.id)).rejects.toHaveProperty("message", "The club with the given id was not found");
  });

  it('findMemberByClubIdMemberId should return member by club', async () => {
    const member: MemberEntity = membersList[0];
    const storedMember: MemberEntity = await service.findMemberByClubIdMemberId(club.id, member.id, )
    expect(storedMember).not.toBeNull();
    expect(storedMember.username).toBe(member.username);
    expect(storedMember.birthdate).toStrictEqual(member.birthdate);
    expect(storedMember.email).toBe(member.email);
  });

  it('findMemberByClubIdMemberId should throw an exception for an invalid member', async () => {
    await expect(()=> service.findMemberByClubIdMemberId(club.id, "0")).rejects.toHaveProperty("message", "The member with the given id was not found");
  });

  it('findMemberByClubIdMemberId should throw an exception for an invalid club', async () => {
    const member: MemberEntity = membersList[0];
    await expect(()=> service.findMemberByClubIdMemberId("0", member.id)).rejects.toHaveProperty("message", "The club with the given id was not found");
  });

  it('findMemberByClubIdMemberId should throw an exception for an member not associated to the club', async () => {
    const newMember: MemberEntity = await memberRepository.save({
      username: faker.internet.userName(),
      birthdate: faker.date.birthdate(),
      email: faker.internet.email()
    });

    await expect(()=> service.findMemberByClubIdMemberId(club.id, newMember.id)).rejects.toHaveProperty("message", "The member with the given id is not associated to the club");
  });

  it('findMembersByClubId should return members by club', async ()=>{
    const members: MemberEntity[] = await service.findMembersByClubId(club.id);
    expect(members.length).toBe(5)
  });

  it('findMembersByClubId should throw an exception for an invalid club', async () => {
    await expect(()=> service.findMembersByClubId("0")).rejects.toHaveProperty("message", "The club with the given id was not found");
  });

  it('associateMembersClub should update members list for a club', async () => {
    const newMember: MemberEntity = await memberRepository.save({
      username: faker.internet.userName(),
      birthdate: faker.date.birthdate(),
      email: faker.internet.email()
    });

    const updatedClub: ClubEntity = await service.associateMembersClub(club.id, [newMember]);
    expect(updatedClub.members.length).toBe(1);

    expect(updatedClub.members[0].username).toBe(newMember.username);
    expect(updatedClub.members[0].birthdate).toBe(newMember.birthdate);
    expect(updatedClub.members[0].email).toBe(newMember.email);
  });

  it('associateMembersClub should throw an exception for an invalid club', async () => {
    const newMember: MemberEntity = await memberRepository.save({
      username: faker.internet.userName(),
      birthdate: faker.date.birthdate(),
      email: faker.internet.email()
    });

    await expect(()=> service.associateMembersClub("0", [newMember])).rejects.toHaveProperty("message", "The club with the given id was not found");
  });

  it('associateMembersClub should throw an exception for an invalid member', async () => {
    const newMember: MemberEntity = membersList[0];
    newMember.id = "0";

    await expect(()=> service.associateMembersClub(club.id, [newMember])).rejects.toHaveProperty("message", "The member with the given id was not found");
  });

  it('deleteMemberToClub should remove an member from a club', async () => {
    const member: MemberEntity = membersList[0];

    await service.deleteMemberClub(club.id, member.id);

    const storedClub: ClubEntity = await clubRepository.findOne({where: {id: club.id}, relations: ["members"]});
    const deletedMember: MemberEntity = storedClub.members.find(a => a.id === member.id);

    expect(deletedMember).toBeUndefined();

  });

  it('deleteMemberToClub should thrown an exception for an invalid member', async () => {
    await expect(()=> service.deleteMemberClub(club.id, "0")).rejects.toHaveProperty("message", "The member with the given id was not found");
  });

  it('deleteMemberToClub should thrown an exception for an invalid club', async () => {
    const member: MemberEntity = membersList[0];
    await expect(()=> service.deleteMemberClub("0", member.id)).rejects.toHaveProperty("message", "The club with the given id was not found");
  });

  it('deleteMemberToClub should thrown an exception for an non asocciated member', async () => {
    const newMember: MemberEntity = await memberRepository.save({
      username: faker.internet.userName(),
      birthdate: faker.date.birthdate(),
      email: faker.internet.email()
    });

    await expect(()=> service.deleteMemberClub(club.id, newMember.id)).rejects.toHaveProperty("message", "The member with the given id is not associated to the club");
  });

});