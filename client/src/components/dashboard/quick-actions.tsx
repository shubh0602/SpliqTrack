import { useState } from "react";
import { Button } from "@/components/ui/button";
import AddExpenseModal from "@/components/modals/add-expense-modal";
import CreateGroupModal from "@/components/modals/create-group-modal";
import AddFriendModal from "@/components/modals/add-friend-modal";
import InviteModal from "@/components/modals/invite-modal";

export default function QuickActions() {
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [isFriendModalOpen, setIsFriendModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  return (
    <>
      <div className="flex flex-wrap gap-4 mb-8">
        <Button 
          onClick={() => setIsExpenseModalOpen(true)}
          className="bg-cred-gradient px-6 py-3 rounded-xl font-medium hover:opacity-90 transition-opacity"
        >
          <i className="fas fa-plus mr-2"></i>Add Expense
        </Button>
        <Button 
          onClick={() => setIsGroupModalOpen(true)}
          className="bg-cred-light px-6 py-3 rounded-xl font-medium hover:bg-opacity-80 transition-all border border-gray-700"
        >
          <i className="fas fa-users mr-2"></i>Create Group
        </Button>
        <Button 
          onClick={() => setIsFriendModalOpen(true)}
          className="bg-cred-light px-6 py-3 rounded-xl font-medium hover:bg-opacity-80 transition-all border border-gray-700"
        >
          <i className="fas fa-user-plus mr-2"></i>Add Friend
        </Button>
        <Button 
          onClick={() => setIsInviteModalOpen(true)}
          className="bg-purple-600 px-6 py-3 rounded-xl font-medium hover:bg-purple-700 transition-all border border-purple-500"
        >
          <i className="fas fa-share mr-2"></i>Share Invite
        </Button>
        <Button className="bg-green-gradient px-6 py-3 rounded-xl font-medium hover:opacity-90 transition-opacity">
          <i className="fas fa-check mr-2"></i>Settle Up
        </Button>
      </div>

      <AddExpenseModal 
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        onSubmit={() => setIsExpenseModalOpen(false)}
        isLoading={false}
      />

      <CreateGroupModal 
        isOpen={isGroupModalOpen}
        onClose={() => setIsGroupModalOpen(false)}
        onSubmit={() => setIsGroupModalOpen(false)}
        isLoading={false}
      />

      <AddFriendModal 
        isOpen={isFriendModalOpen}
        onClose={() => setIsFriendModalOpen(false)}
        onSubmit={() => setIsFriendModalOpen(false)}
        isLoading={false}
      />

      <InviteModal 
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        inviteType="friend"
      />
    </>
  );
}
