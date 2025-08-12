import { db } from "../db";
import { invitations, invitationAcceptances, users } from "@shared/schema";
import { eq, and, gte, lt } from "drizzle-orm";
import { nanoid } from "nanoid";

export class InvitationService {
  // Generate a unique invite code
  generateInviteCode(): string {
    return nanoid(10).toLowerCase();
  }

  // Create a new invitation
  async createInvitation(data: {
    invitedBy: string;
    inviteType: "friend" | "group" | "expense";
    targetId?: string;
    maxUses?: number;
    expiresInHours?: number;
    metadata?: any;
  }) {
    const inviteCode = this.generateInviteCode();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + (data.expiresInHours || 24 * 7)); // Default 7 days

    const [invitation] = await db
      .insert(invitations)
      .values({
        inviteCode,
        invitedBy: data.invitedBy,
        inviteType: data.inviteType,
        targetId: data.targetId,
        maxUses: data.maxUses || 1,
        expiresAt,
        metadata: data.metadata,
      })
      .returning();

    return invitation;
  }

  // Get invitation by code
  async getInvitationByCode(inviteCode: string) {
    const [invitation] = await db
      .select({
        invitation: invitations,
        inviter: users,
      })
      .from(invitations)
      .leftJoin(users, eq(invitations.invitedBy, users.id))
      .where(
        and(
          eq(invitations.inviteCode, inviteCode),
          eq(invitations.isActive, true),
          gte(invitations.expiresAt, new Date())
        )
      );

    if (!invitation) return null;

    // Check if invitation has remaining uses
    if (invitation.invitation.usedCount >= invitation.invitation.maxUses) {
      return null;
    }

    return invitation;
  }

  // Accept an invitation
  async acceptInvitation(inviteCode: string, acceptingUserId: string) {
    const invitation = await this.getInvitationByCode(inviteCode);
    if (!invitation) {
      throw new Error("Invalid or expired invitation");
    }

    // Check if user already accepted this invitation
    const existingAcceptance = await db
      .select()
      .from(invitationAcceptances)
      .where(
        and(
          eq(invitationAcceptances.invitationId, invitation.invitation.id),
          eq(invitationAcceptances.acceptedBy, acceptingUserId)
        )
      );

    if (existingAcceptance.length > 0) {
      throw new Error("Invitation already accepted by this user");
    }

    // Record the acceptance
    await db.insert(invitationAcceptances).values({
      invitationId: invitation.invitation.id,
      acceptedBy: acceptingUserId,
    });

    // Update used count
    await db
      .update(invitations)
      .set({
        usedCount: invitation.invitation.usedCount + 1,
      })
      .where(eq(invitations.id, invitation.invitation.id));

    return {
      invitation: invitation.invitation,
      inviter: invitation.inviter,
    };
  }

  // Create guest user from invitation
  async createGuestUserFromInvite(data: {
    firstName: string;
    lastName: string;
    email?: string;
  }) {
    const guestToken = nanoid(32);
    
    const [guestUser] = await db
      .insert(users)
      .values({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        authProvider: "guest",
        guestToken,
        isGuest: true,
      })
      .returning();

    return guestUser;
  }

  // Get user invitations
  async getUserInvitations(userId: string) {
    return await db
      .select({
        invitation: invitations,
        acceptanceCount: invitationAcceptances.id,
      })
      .from(invitations)
      .leftJoin(invitationAcceptances, eq(invitations.id, invitationAcceptances.invitationId))
      .where(eq(invitations.invitedBy, userId))
      .orderBy(invitations.createdAt);
  }

  // Deactivate invitation
  async deactivateInvitation(invitationId: string, userId: string) {
    await db
      .update(invitations)
      .set({ isActive: false })
      .where(
        and(
          eq(invitations.id, invitationId),
          eq(invitations.invitedBy, userId)
        )
      );
  }

  // Generate shareable URL
  generateShareableUrl(inviteCode: string, baseUrl: string = "https://localhost:5000"): string {
    return `${baseUrl}/invite/${inviteCode}`;
  }
}

export const invitationService = new InvitationService();