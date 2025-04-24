import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { EyeIcon, EyeOffIcon, KeyIcon, BookIcon, RefreshCwIcon } from 'lucide-react';

export default function Account() {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  
  // Form states
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [company, setCompany] = useState(user?.company || '');
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showApiKey, setShowApiKey] = useState(false);
  
  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: { firstName: string, lastName: string, company: string }) => {
      return apiRequest('PATCH', `/api/user/${user?.id}`, data);
    },
    onSuccess: (response) => {
      response.json().then((updatedUser) => {
        updateUser(updatedUser);
        toast({
          title: "Profile updated",
          description: "Your profile information has been updated successfully.",
        });
      });
    },
    onError: (error) => {
      toast({
        title: "Update failed",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
      console.error(error);
    }
  });
  
  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: async (data: { currentPassword: string, newPassword: string }) => {
      // In a real implementation, this would call an API endpoint to change the password
      // For now, we'll just simulate success
      return new Promise(resolve => setTimeout(resolve, 1000));
    },
    onSuccess: () => {
      toast({
        title: "Password updated",
        description: "Your password has been changed successfully.",
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    },
    onError: (error) => {
      toast({
        title: "Password change failed",
        description: "Failed to change password. Please check your current password and try again.",
        variant: "destructive",
      });
      console.error(error);
    }
  });
  
  // Regenerate API key mutation
  const regenerateApiKeyMutation = useMutation({
    mutationFn: async () => {
      // In a real implementation, this would call an API endpoint to regenerate the API key
      // For now, we'll just simulate success
      return new Promise(resolve => setTimeout(resolve, 1000));
    },
    onSuccess: () => {
      toast({
        title: "API key regenerated",
        description: "Your API key has been regenerated successfully.",
      });
      // In a real implementation, we would update the user's API key
    },
    onError: (error) => {
      toast({
        title: "Failed to regenerate API key",
        description: "Please try again later.",
        variant: "destructive",
      });
      console.error(error);
    }
  });
  
  // Handle profile form submission
  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    updateProfileMutation.mutate({
      firstName,
      lastName,
      company
    });
  };
  
  // Handle password form submission
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentPassword) {
      toast({
        title: "Current password required",
        description: "Please enter your current password.",
        variant: "destructive",
      });
      return;
    }
    
    if (!newPassword) {
      toast({
        title: "New password required",
        description: "Please enter a new password.",
        variant: "destructive",
      });
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Your new password and confirmation password don't match.",
        variant: "destructive",
      });
      return;
    }
    
    changePasswordMutation.mutate({
      currentPassword,
      newPassword
    });
  };
  
  // Handle API key regeneration
  const handleRegenerateApiKey = () => {
    if (window.confirm('Are you sure you want to regenerate your API key? This will invalidate your current key.')) {
      regenerateApiKeyMutation.mutate();
    }
  };
  
  // Toggle API key visibility
  const toggleApiKeyVisibility = () => {
    setShowApiKey(!showApiKey);
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
        <p className="text-gray-600">Manage your profile and subscription</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Settings */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-lg font-semibold mb-4">Profile Information</h2>
              
              <form onSubmit={handleProfileSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <Label htmlFor="first-name">First Name</Label>
                    <Input 
                      id="first-name" 
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="last-name">Last Name</Label>
                    <Input 
                      id="last-name" 
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>
                
                <div className="mb-6">
                  <Label htmlFor="email">Email Address</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled
                    className="mt-1 bg-gray-50"
                  />
                </div>
                
                <div className="mb-6">
                  <Label htmlFor="company">Company</Label>
                  <Input 
                    id="company" 
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="mt-1"
                  />
                </div>
                
                <div className="flex justify-end">
                  <Button 
                    type="submit" 
                    disabled={updateProfileMutation.isPending}
                  >
                    {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-lg font-semibold mb-4">Change Password</h2>
              
              <form onSubmit={handlePasswordSubmit}>
                <div className="mb-4">
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input 
                    id="current-password" 
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="mt-1"
                  />
                </div>
                
                <div className="mb-4">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input 
                    id="new-password" 
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="mt-1"
                  />
                </div>
                
                <div className="mb-6">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input 
                    id="confirm-password" 
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="mt-1"
                  />
                </div>
                
                <div className="flex justify-end">
                  <Button 
                    type="submit"
                    disabled={changePasswordMutation.isPending}
                  >
                    {changePasswordMutation.isPending ? 'Updating...' : 'Update Password'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-lg font-semibold mb-4">API Integration</h2>
              
              <div className="bg-gray-50 border border-gray-200 rounded-md p-4 mb-4">
                <p className="text-gray-700 text-sm">Use our API to integrate SmartClause document analysis into your applications.</p>
              </div>
              
              <div className="mb-6">
                <Label className="block mb-2">
                  Your API Key
                </Label>
                <div className="flex">
                  <Input 
                    type={showApiKey ? "text" : "password"} 
                    value={user?.apiKey || "••••••••••••••••••••••••••••••"} 
                    disabled 
                    className="flex-grow rounded-r-none bg-gray-50"
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={toggleApiKeyVisibility}
                    className="rounded-l-none border-l-0"
                  >
                    {showApiKey ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <Button 
                  variant="outline" 
                  onClick={handleRegenerateApiKey}
                  disabled={regenerateApiKeyMutation.isPending}
                >
                  <RefreshCwIcon className="h-4 w-4 mr-2" /> Regenerate Key
                </Button>
                <Button variant="outline">
                  <BookIcon className="h-4 w-4 mr-2" /> View API Docs
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Subscription Info */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-lg font-semibold mb-4">Subscription</h2>
              
              <div className="bg-primary-50 border border-primary-100 rounded-md p-4 mb-6">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium text-primary-800">
                    {user?.planType === 'pro' ? 'Pro Plan' : 'Free Plan'}
                  </h3>
                  <span className="bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded-full">Active</span>
                </div>
                <p className="text-gray-600 text-sm">Your subscription renews on Sep 15, 2023</p>
              </div>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center text-sm">
                  <div className="text-success mr-3">✓</div>
                  <span>Unlimited contract analyses</span>
                </div>
                <div className="flex items-center text-sm">
                  <div className="text-success mr-3">✓</div>
                  <span>Advanced risk detection</span>
                </div>
                <div className="flex items-center text-sm">
                  <div className="text-success mr-3">✓</div>
                  <span>Contract Q&A with GPT-4</span>
                </div>
                <div className="flex items-center text-sm">
                  <div className="text-success mr-3">✓</div>
                  <span>Unlimited saved clauses</span>
                </div>
                <div className="flex items-center text-sm">
                  <div className="text-success mr-3">✓</div>
                  <span>API access</span>
                </div>
              </div>
              
              <div className="flex flex-col space-y-3">
                <Button 
                  variant="outline" 
                  className="border-primary-600 text-primary-600 hover:bg-primary-50"
                >
                  Manage Subscription
                </Button>
                <Button variant="outline">
                  View Billing History
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-lg font-semibold mb-4">Usage Statistics</h2>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Contract Analysis</span>
                    <span className="text-gray-900 font-medium">8 / Unlimited</span>
                  </div>
                  <Progress value={25} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">API Calls</span>
                    <span className="text-gray-900 font-medium">157 / 1,000</span>
                  </div>
                  <Progress value={15.7} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Saved Clauses</span>
                    <span className="text-gray-900 font-medium">2 / Unlimited</span>
                  </div>
                  <Progress value={10} className="h-2" />
                </div>
              </div>
              
              <p className="text-xs text-gray-500 mt-4">Billing cycle resets on Sep 15, 2023</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
