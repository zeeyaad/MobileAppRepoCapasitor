import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Member } from './Member';

@Entity('member_relationships')
@Index('idx_relationship_member', ['member_id'])
@Index('idx_relationship_related', ['related_member_id'])
export class MemberRelationship {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  member_id: number;

  @Column()
  related_member_id: number;

  @Column({ type: 'varchar', length: 50 })
  relationship_type: string; // spouse, child, parent, orphan

  @Column({ type: 'varchar', length: 100, nullable: true })
  relationship_name_ar: string; // الزوجة, الابن, الوالد, اليتيم

  @Column({ type: 'boolean', default: false })
  is_dependent: boolean;

  @Column({ type: 'varchar', length: 50, nullable: true })
  age_group: string;

  @CreateDateColumn()
  created_at: Date;

  // Relations
  @ManyToOne(() => Member, (member) => member.relationships)
  @JoinColumn({ name: 'member_id' })
  member: Member;

  @ManyToOne(() => Member)
  @JoinColumn({ name: 'related_member_id' })
  related_member: Member;
}
