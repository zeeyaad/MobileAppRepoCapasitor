import { Request, Response } from 'express';
import { AppDataSource } from '../database/data-source';
import { Account } from '../entities/Account';
import { Staff } from '../entities/Staff';
import { Member } from '../entities/Member';
import { TeamMember } from '../entities/TeamMember';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { Repository } from 'typeorm';
import PrivilegeCalculationService from '../services/PrivilegeCalculationService';
import { AuditLogService } from '../services/AuditLogService';

/**
 * Authentication Controller
 * Handles login for all user types: Staff, Members, and other account holders
 */
export class AuthController {
  private accountRepository: Repository<Account>;
  private staffRepository: Repository<Staff>;
  private memberRepository: Repository<Member>;
  private teamMemberRepository: Repository<TeamMember>;
  private auditLogService: AuditLogService;

  constructor() {
    this.accountRepository = AppDataSource.getRepository(Account);
    this.staffRepository = AppDataSource.getRepository(Staff);
    this.memberRepository = AppDataSource.getRepository(Member);
    this.teamMemberRepository = AppDataSource.getRepository(TeamMember);
    this.auditLogService = new AuditLogService();
  }

  /**
   * POST /auth/login
   * 
   * Universal login for all account types:
   * 1. Staff Login: Email + password OR National ID + National ID (first login)
   * 2. Member Login: Email + password OR National ID + National ID (first login)
   * 3. Any account role: admin, staff, member, moderator
   */
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, national_id, password } = req.body;

      // Determine login type
      let account: Account | null = null;
      let staff: Staff | null = null;
      let member: Member | null = null;
      let teamMember: TeamMember | null = null;
      let requiresCredentialChange = false;

      // Try to determine if this is a national_id login
      // User might pass national_id as email field for first login
      const actualNationalId = national_id || email;

      // Login Method 2: National ID + National ID as password (for first login)
      // Check this first to catch users using national_id (whether in email or national_id field)
      if (actualNationalId && password === actualNationalId) {
        // Try to find staff by national ID
        staff = await this.staffRepository.findOne({
          where: { national_id: actualNationalId },
          relations: ['staff_type'],
        });

        if (staff) {
          // Get account
          account = await this.accountRepository.findOne({
            where: { id: staff.account_id },
          });

          if (!account) {
            res.status(401).json({
              success: false,
              message: 'Account not found',
            });
            return;
          }

          // Verify password (should be hashed national_id for first login)
          const passwordMatch = await bcrypt.compare(actualNationalId, account.password);
          if (!passwordMatch) {
            res.status(401).json({
              success: false,
              message: 'Invalid national ID or password',
            });
            return;
          }

          // Check if credentials have been changed
          if (!account.password_changed_at) {
            // First login - must change credentials
            requiresCredentialChange = true;
          } else {
            // Credentials already changed - should use email/password
            res.status(403).json({
              success: false,
              message: 'Please login with email and password, not national ID',
            });
            return;
          }
        } else {
          // Try to find member by national ID
          member = await this.memberRepository.findOne({
            where: { national_id: actualNationalId },
            relations: ['member_type'],
          });

          if (member) {
            // Get account
            account = await this.accountRepository.findOne({
              where: { id: member.account_id },
            });

            if (!account) {
              res.status(401).json({
                success: false,
                message: 'Account not found',
              });
              return;
            }

            // Verify password
            const passwordMatch = await bcrypt.compare(actualNationalId, account.password);
            if (!passwordMatch) {
              res.status(401).json({
                success: false,
                message: 'Invalid national ID or password',
              });
              return;
            }

            // Check if credentials have been changed
            if (!account.password_changed_at) {
              requiresCredentialChange = true;
            } else {
              res.status(403).json({
                success: false,
                message: 'Please login with email and password, not national ID',
              });
              return;
            }
          } else {
            // Try to find team member by national ID
            teamMember = await this.teamMemberRepository.findOne({
              where: { national_id: actualNationalId },
              relations: ['team_member_teams'],
            });

            if (teamMember) {
              account = await this.accountRepository.findOne({
                where: { id: teamMember.account_id },
              });

              if (!account) {
                res.status(401).json({ success: false, message: 'Account not found' });
                return;
              }

              const passwordMatch = await bcrypt.compare(actualNationalId, account.password);
              if (!passwordMatch) {
                res.status(401).json({ success: false, message: 'Invalid national ID or password' });
                return;
              }

              if (!account.password_changed_at) {
                requiresCredentialChange = true;
              } else {
                res.status(403).json({
                  success: false,
                  message: 'Please login with email and password, not national ID',
                });
                return;
              }
            } else if (!email || email === national_id) {
              // Tried to login with national_id but user not found
              res.status(401).json({
                success: false,
                message: 'Invalid national ID or password',
              });
              return;
            }
          }
        }
      }
      // Login Method 1: Email + Password (for any account type after credential change)
      if (!staff && !member && !teamMember && email && password) {
        account = await this.accountRepository.findOne({
          where: { email },
        });

        if (!account) {
          res.status(401).json({
            success: false,
            message: 'Invalid email or password',
          });
          return;
        }

        // Verify password
        const passwordMatch = await bcrypt.compare(password, account.password);
        if (!passwordMatch) {
          res.status(401).json({
            success: false,
            message: 'Invalid email or password',
          });
          return;
        }

        // Determine if this is staff, member, or team_member account
        staff = await this.staffRepository.findOne({
          where: { account_id: account.id },
          relations: ['staff_type'],
        });

        if (staff) {
          // Check if regular staff has changed their credentials yet
          if (staff.staff_type_id !== 1 && staff.staff_type_id !== 2) {
            if (!account.password_changed_at) {
              requiresCredentialChange = true;
            }
          }
        } else {
          // Try regular member
          member = await this.memberRepository.findOne({
            where: { account_id: account.id },
            relations: ['member_type'],
          });

          if (member) {
            if (!account.password_changed_at) {
              requiresCredentialChange = true;
            }
          } else {
            // Try team member
            teamMember = await this.teamMemberRepository.findOne({
              where: { account_id: account.id },
              relations: ['team_member_teams'],
            });

            if (teamMember) {
              if (!account.password_changed_at) {
                requiresCredentialChange = true;
              }
            }
          }
        }
      } else if (!staff && !member && !teamMember) {
        res.status(400).json({
          success: false,
          message: 'Invalid login method. Provide either (email + password) or (national_id + password)',
        });
        return;
      }

      if (!account || (!staff && !member && !teamMember)) {
        res.status(401).json({
          success: false,
          message: 'Authentication failed',
        });
        return;
      }

      // Generate JWT token
      const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
      const tokenPayload: Record<string, unknown> = {
        account_id: account.id,
        email: account.email,
        role: account.role,
      };

      // Add staff-specific data and privileges
      if (staff) {
        tokenPayload.staff_id = staff.id;
        tokenPayload.staff_type_id = staff.staff_type_id;

        // Calculate and add final privileges
        try {
          const privilegeCodes = await PrivilegeCalculationService.calculateFinalPrivilegeCodes(staff.id);
          // Log the computed privileges for debugging (can be enabled via DEBUG_AUTH env var)
          try {
            console.log(`DEBUG_AUTH: privilegeCodes for staff ${staff.id}:`, Array.from(privilegeCodes));
          } catch {
            console.log('DEBUG_AUTH: could not stringify privilegeCodes');
          }
          tokenPayload.privileges = Array.from(privilegeCodes);
        } catch (err) {
          // Log error but don't fail login - staff gets empty privileges
          console.error('Error calculating privileges:', err);
          tokenPayload.privileges = [];
        }
      } else if (member) {
        tokenPayload.member_id = member.id;
        tokenPayload.member_type_id = member.member_type_id;
        tokenPayload.privileges = [];
      } else if (teamMember) {
        tokenPayload.team_member_id = teamMember.id;
        tokenPayload.privileges = [];
      }

      const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '24h' });

      const DEBUG_AUTH = process.env.DEBUG_AUTH === 'true';

      // Audit Log for successful login
      const role = staff?.staff_type?.name_en || (member ? member.member_type?.name_en : (teamMember ? 'Team Member' : account.role));
      const userName = staff
        ? `${staff.first_name_en} ${staff.last_name_en}`
        : member
          ? `${member.first_name_en} ${member.last_name_en}`
          : teamMember
            ? `${teamMember.first_name_en} ${teamMember.last_name_en}`
            : account.email;

      await this.auditLogService.createLog({
        userName,
        role: role || 'Unknown',
        action: 'Login',
        module: 'Auth',
        description: `User logged in: ${userName}`,
        status: 'نجح',
        dateTime: new Date(),
        ipAddress: req.ip || '0.0.0.0'
      });

      // Response based on whether credentials need to be changed
      if (requiresCredentialChange) {
        // First login - must change credentials
        const memberStatus = member ? (member.status || account.status) : account.status;
        const userData: Record<string, unknown> = {
          account_id: account.id,
          email: account.email,
          role: account.role,
          status: memberStatus,
          privileges: tokenPayload.privileges || [],
          instructions: 'Call /auth/change-credentials with new email and password',
        };

        if (staff) {
          userData.staff_id = staff.id;
          userData.name_en = `${staff.first_name_en} ${staff.last_name_en}`.trim();
          userData.name_ar = `${staff.first_name_ar} ${staff.last_name_ar}`.trim();
          userData.staff_type = staff.staff_type?.name_en;
        } else if (member) {
          userData.member_id = member.id;
          userData.name_en = `${member.first_name_en} ${member.last_name_en}`.trim();
          userData.name_ar = `${member.first_name_ar} ${member.last_name_ar}`.trim();
          userData.member_type = member.member_type?.name_en;
        } else if (teamMember) {
          userData.team_member_id = teamMember.id;
          userData.name_en = `${teamMember.first_name_en} ${teamMember.last_name_en}`.trim();
          userData.name_ar = `${teamMember.first_name_ar} ${teamMember.last_name_ar}`.trim();
        }

        const responseBody: Record<string, unknown> = {
          success: true,
          message: 'First login - you must change your credentials before full access',
          requires_credential_change: true,
          token, // Temporary token for credential change endpoint
          user: userData,
        };
        if (DEBUG_AUTH) {
          responseBody.privilege_debug = tokenPayload.privileges || [];
        }
        res.status(200).json(responseBody);
      } else {
        // Regular login - full access
        // For members, use member.status as the authoritative status
        // (admins update member.status, not necessarily account.status)
        const memberStatus = member ? (member.status || account.status) : account.status;
        const userData: Record<string, unknown> = {
          account_id: account.id,
          email: account.email,
          role: account.role,
          status: memberStatus,
          privileges: tokenPayload.privileges || [],
        };

        if (staff) {
          userData.staff_id = staff.id;
          userData.name_en = `${staff.first_name_en} ${staff.last_name_en}`.trim();
          userData.name_ar = `${staff.first_name_ar} ${staff.last_name_ar}`.trim();
          userData.staff_type = staff.staff_type?.name_en;
        } else if (member) {
          userData.member_id = member.id;
          userData.name_en = `${member.first_name_en} ${member.last_name_en}`.trim();
          userData.name_ar = `${member.first_name_ar} ${member.last_name_ar}`.trim();
          userData.member_type = member.member_type?.name_en;
        } else if (teamMember) {
          userData.team_member_id = teamMember.id;
          userData.name_en = `${teamMember.first_name_en} ${teamMember.last_name_en}`.trim();
          userData.name_ar = `${teamMember.first_name_ar} ${teamMember.last_name_ar}`.trim();
        }

        const responseBody: Record<string, unknown> = {
          success: true,
          message: 'Login successful',
          token,
          user: userData,
        };
        if (DEBUG_AUTH) {
          responseBody.privilege_debug = tokenPayload.privileges || [];
        }
        res.status(200).json(responseBody);
      }
    } catch (error: Error | unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({
        success: false,
        message: 'Login failed',
        error: errorMessage,
      });
    }
  }

  /**
   * POST /auth/change-credentials
   * 
   * For staff/members: Change email and password on first login
   * Required: JWT token from first login
   * Works for both staff and members
   */
  async changeCredentials(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as unknown as Record<string, unknown>).user as Record<string, unknown> | undefined;

      if (!user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
        return;
      }

      const { new_email, new_password } = req.body;
      const account_id = user.account_id as number;
      const staff_id = user.staff_id as number | undefined;
      const member_id = user.member_id as number | undefined;

      // Validation
      if (!new_email || !new_password) {
        res.status(400).json({
          success: false,
          message: 'Missing required fields: new_email, new_password',
        });
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(new_email)) {
        res.status(400).json({
          success: false,
          message: 'Invalid email format',
        });
        return;
      }

      // Check if email already exists
      const existingEmail = await this.accountRepository.findOne({
        where: { email: new_email },
      });

      if (existingEmail && existingEmail.id !== account_id) {
        res.status(400).json({
          success: false,
          message: 'Email already in use',
        });
        return;
      }

      // Get account
      const account = await this.accountRepository.findOne({
        where: { id: account_id },
      });

      if (!account) {
        res.status(404).json({
          success: false,
          message: 'Account not found',
        });
        return;
      }

      // Update account
      account.email = new_email;
      account.password = await bcrypt.hash(new_password, 10);
      account.status = 'active'; // Mark account as active after credential change
      account.password_changed_at = new Date(); // Track that credentials were changed

      await this.accountRepository.save(account);

      // Determine if staff or member and update accordingly
      // Generate new token payload with updated email
      const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
      const newTokenPayload: Record<string, unknown> = {
        account_id: account.id,
        email: new_email,
        role: account.role,
      };

      // Calculate privileges for token and response
      if (staff_id) {
        newTokenPayload.staff_id = staff_id;
        try {
          const privilegeCodes = await PrivilegeCalculationService.calculateFinalPrivilegeCodes(staff_id);
          newTokenPayload.privileges = Array.from(privilegeCodes);
        } catch (err) {
          console.error('Error calculating privileges:', err);
          newTokenPayload.privileges = [];
        }
      } else if (member_id) {
        newTokenPayload.member_id = member_id;
        newTokenPayload.privileges = [];
      }

      // Prepare user data for response
      const userData: Record<string, unknown> = {
        account_id: account.id,
        email: new_email,
        role: account.role,
        status: 'active',
        privileges: newTokenPayload.privileges || [],
      };

      let finalUserName = '';
      let finalRole = '';

      if (staff_id) {
        // Update staff
        const staff = await this.staffRepository.findOne({
          where: { id: staff_id },
          relations: ['staff_type'],
        });

        if (!staff) {
          res.status(404).json({
            success: false,
            message: 'Staff record not found',
          });
          return;
        }

        staff.status = 'active';
        await this.staffRepository.save(staff);

        userData.staff_id = staff.id;
        const name = `${staff.first_name_en} ${staff.last_name_en}`;
        userData.name_en = name;
        finalUserName = name;
        finalRole = staff.staff_type?.name_en || 'Staff';
      } else if (member_id) {
        // Update member
        const member = await this.memberRepository.findOne({
          where: { id: member_id },
          relations: ['member_type'],
        });

        if (!member) {
          res.status(404).json({
            success: false,
            message: 'Member record not found',
          });
          return;
        }

        member.status = 'active';
        await this.memberRepository.save(member);

        userData.member_id = member.id;
        const name = `${member.first_name_en} ${member.last_name_en}`;
        userData.name_en = name;
        finalUserName = name;
        finalRole = member.member_type?.name_en || 'Member';
      }

      // Audit Log for credential change
      await this.auditLogService.createLog({
        userName: finalUserName || (account.email as string),
        role: finalRole || (account.role as string),
        action: 'Change Credentials',
        module: 'Auth',
        description: `User changed credentials: ${finalUserName || account.email}`,
        status: 'نجح',
        dateTime: new Date(),
        ipAddress: req.ip || '0.0.0.0'
      });

      const newToken = jwt.sign(newTokenPayload, JWT_SECRET, { expiresIn: '24h' });

      res.status(200).json({
        success: true,
        message: 'Credentials changed successfully. You can now access the system.',
        token: newToken,
        user: userData,
      });
    } catch (error: Error | unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({
        success: false,
        message: 'Error changing credentials',
        error: errorMessage,
      });
    }
  }

  /**
   * GET /auth/me
   * Get current logged-in user's information
   * Requires: Valid JWT token
   */
  /**
   * GET /auth/me
   * Get current logged-in user's information
   * 
   * Requires: Valid JWT token in Authorization header
   * Returns: Current user's profile data including account info, role, privileges
   */
  async getCurrentUser(req: Request, res: Response): Promise<void> {
    try {
      // Get user data from request (set by auth middleware)
      const user = (req as unknown as Record<string, unknown>).user as Record<string, unknown>;

      if (!user || !user.account_id) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized - No user information found',
        });
        return;
      }

      // Fetch account to get email and status
      const account = await this.accountRepository.findOne({
        where: { id: user.account_id as number },
      });

      if (!account) {
        res.status(404).json({
          success: false,
          message: 'Account not found',
        });
        return;
      }

      const userData: Record<string, unknown> = {
        account_id: account.id,
        email: account.email,
        role: account.role,
        status: account.status,
        name_en: '',
        name_ar: '',
        staff_id: null,
        staff_type_id: null,
        staff_type: null,
        member_id: null,
        member_type_id: null,
        member_type: null,
        privileges: user.privileges && Array.isArray(user.privileges) ? user.privileges : [], // Use JWT privileges as initial value
      };

      // If user is staff or admin, fetch staff details
      if (account.role === 'staff' || account.role === 'admin') {
        const staff = await this.staffRepository.findOne({
          where: { account_id: account.id },
          relations: ['staff_type'], // Only load staff_type relation (privileges are calculated separately)
        });

        if (staff) {
          userData.staff_id = staff.id;
          userData.staff_type_id = staff.staff_type_id;
          userData.staff_type = staff.staff_type?.name_en || null;
          userData.name_en = `${staff.first_name_en || ''} ${staff.last_name_en || ''}`.trim();
          userData.name_ar = `${staff.first_name_ar || ''} ${staff.last_name_ar || ''}`.trim();

          try {
            // Calculate privileges using PrivilegeCalculationService
            const privileges = await PrivilegeCalculationService.calculateFinalPrivileges(staff.id);
            userData.privileges = privileges.map((p: Record<string, unknown>) => p.code);
          } catch (privError) {
            console.error('Error calculating privileges for staff:', staff.id, privError);
            // If privilege calculation fails, use privileges from JWT token as fallback
            if (user.privileges && Array.isArray(user.privileges)) {
              userData.privileges = user.privileges as string[];
            }
          }
        }
      }

      // If user is member, fetch member details
      if (account.role === 'member') {
        const member = await this.memberRepository.findOne({
          where: { account_id: account.id },
          relations: ['member_type', 'memberships', 'memberships.membership_plan'],
        });

        if (member) {
          userData.member_id = member.id;
          userData.member_type_id = member.member_type_id;
          userData.member_type = member.member_type?.name_en || null;
          userData.name_en = `${member.first_name_en} ${member.last_name_en}`;
          userData.name_ar = `${member.first_name_ar} ${member.last_name_ar}`;
          // Member account status (pending/active/suspended) — must not be overwritten by membership plan status
          userData.status = member.status || account.status;
          userData.photo = member.photo || null;
          userData.national_id_front = member.national_id_front || null;
          userData.national_id_back = member.national_id_back || null;
          userData.medical_report = member.medical_report || null;
          // Additional profile fields
          userData.phone = member.phone;
          userData.address = member.address;
          userData.birthdate = member.birthdate;
          userData.national_id = member.national_id;
          userData.join_date = member.created_at;

          // Find active membership or latest
          if (member.memberships && member.memberships.length > 0) {
            // Sort by start_date descending
            const sortedMemberships = member.memberships.sort((a, b) =>
              new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
            );
            const activeMembership = sortedMemberships.find(m => m.status === 'active') || sortedMemberships[0];

            if (activeMembership && activeMembership.membership_plan) {
              userData.membership_plan_name = activeMembership.membership_plan.name_ar || activeMembership.membership_plan.name_en;
              userData.membership_plan_code = activeMembership.membership_plan.plan_code || activeMembership.membership_plan.id;
              userData.registration_date = activeMembership.start_date;
              userData.expiry_date = activeMembership.end_date;
              userData.plan_price = activeMembership.membership_plan.price;
              userData.renewal_fee = activeMembership.membership_plan.renewal_price ?? activeMembership.membership_plan.price;
              // Store membership plan status separately — do NOT overwrite the member's account status
              userData.membership_status = activeMembership.status;
            }
          }
        }
      }

      // If user is team_member, fetch team member details
      if (account.role === 'team_member') {
        const tm = await AppDataSource.getRepository(TeamMember).findOne({
          where: { account_id: account.id },
          relations: ['team_member_teams', 'team_member_teams.team'],
        });

        if (tm) {
          userData.team_member_id = tm.id;
          userData.name_en = `${tm.first_name_en} ${tm.last_name_en}`;
          userData.name_ar = `${tm.first_name_ar} ${tm.last_name_ar}`;
          userData.status = tm.status;
          userData.teams = tm.team_member_teams?.map(t => t.team?.name_en || t.team_id) || [];
        }
      }

      res.status(200).json({
        success: true,
        message: 'User information retrieved successfully',
        data: {
          user: userData,
        },
      });
    } catch (error: Error | unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error fetching current user:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching user information',
        error: errorMessage,
      });
    }
  }

  /**
   * PUT /auth/me/profile
   * Allows a logged-in member to update their own profile data.
   * Requires: Valid JWT token (authenticate middleware only — no admin privilege needed).
   */
  async updateMyProfile(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as unknown as Record<string, unknown>).user as Record<string, unknown> | undefined;

      if (!user || !user.account_id) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      // Only members can use this self-update endpoint
      if (user.role !== 'member') {
        res.status(403).json({ success: false, message: 'This endpoint is only for members' });
        return;
      }

      const member_id = user.member_id as number | undefined;
      if (!member_id) {
        res.status(400).json({ success: false, message: 'Member ID not found in token' });
        return;
      }

      const member = await this.memberRepository.findOne({ where: { id: member_id } });
      if (!member) {
        res.status(404).json({ success: false, message: 'Member not found' });
        return;
      }

      const { first_name_ar, last_name_ar, first_name_en, last_name_en, phone, address, birthdate, photo, national_id_front, national_id_back, medical_report } = req.body;

      if (first_name_ar !== undefined) member.first_name_ar = first_name_ar;
      if (last_name_ar !== undefined) member.last_name_ar = last_name_ar;
      if (first_name_en !== undefined) member.first_name_en = first_name_en;
      if (last_name_en !== undefined) member.last_name_en = last_name_en;
      if (phone !== undefined) member.phone = phone;
      if (address !== undefined) member.address = address;
      if (birthdate !== undefined) member.birthdate = birthdate ? new Date(birthdate) : null;
      if (photo !== undefined) member.photo = photo;
      if (national_id_front !== undefined) member.national_id_front = national_id_front;
      if (national_id_back !== undefined) member.national_id_back = national_id_back;
      if (medical_report !== undefined) member.medical_report = medical_report;

      const updatedMember = await this.memberRepository.save(member);

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: updatedMember,
      });
    } catch (error: Error | unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error updating member profile:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update profile',
        error: errorMessage,
      });
    }
  }
}

export default new AuthController();
