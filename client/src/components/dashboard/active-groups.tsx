import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ActiveGroupsProps {
  groups: any[];
}

export default function ActiveGroups({ groups }: ActiveGroupsProps) {
  const getGroupIcon = (index: number) => {
    const icons = [
      "fas fa-mountain",
      "fas fa-home", 
      "fas fa-briefcase",
      "fas fa-plane",
      "fas fa-users",
      "fas fa-heart"
    ];
    return icons[index % icons.length];
  };

  const getGroupGradient = (index: number) => {
    const gradients = [
      "bg-gradient-to-br from-purple-500 to-pink-500",
      "bg-gradient-to-br from-blue-500 to-cyan-500",
      "bg-gradient-to-br from-green-500 to-emerald-500",
      "bg-gradient-to-br from-orange-500 to-red-500",
      "bg-gradient-to-br from-indigo-500 to-purple-500",
      "bg-gradient-to-br from-teal-500 to-blue-500"
    ];
    return gradients[index % gradients.length];
  };

  return (
    <Card className="bg-dark-gradient border-gray-800">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-bold text-white">Your Groups</CardTitle>
          <Button variant="link" className="text-cred-purple hover:text-cred-blue">
            Manage
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!groups || groups.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-800 rounded-xl flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-users text-2xl text-gray-400"></i>
            </div>
            <p className="text-gray-400">No groups yet</p>
            <p className="text-sm text-gray-500 mt-1">Create a group to start splitting expenses</p>
          </div>
        ) : (
          <div className="space-y-4">
            {groups.slice(0, 3).map((group, index) => (
              <div 
                key={group.id} 
                className="p-4 bg-cred-gray rounded-xl hover:bg-opacity-80 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 ${getGroupGradient(index)} rounded-full flex items-center justify-center`}>
                      <i className={`${getGroupIcon(index)} text-white text-sm`}></i>
                    </div>
                    <div>
                      <div className="font-medium text-white">{group.name}</div>
                      <div className="text-sm text-gray-400">
                        {group.members?.length || 0} members
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-400">
                      Active
                    </div>
                  </div>
                </div>
                <div className="flex -space-x-2">
                  {group.members?.slice(0, 4).map((member: any, memberIndex: number) => (
                    <div 
                      key={member.id} 
                      className={`w-6 h-6 ${getGroupGradient(memberIndex)} rounded-full border-2 border-cred-gray flex items-center justify-center`}
                    >
                      <span className="text-xs font-medium text-white">
                        {(member.user?.firstName?.[0] || '') + (member.user?.lastName?.[0] || '')}
                      </span>
                    </div>
                  ))}
                  {(group.members?.length || 0) > 4 && (
                    <div className="w-6 h-6 bg-gray-600 rounded-full border-2 border-cred-gray flex items-center justify-center">
                      <span className="text-xs text-white">+{(group.members?.length || 0) - 4}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
