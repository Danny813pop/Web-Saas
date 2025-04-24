import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Link, useLocation } from 'wouter';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import ContractCard from '@/components/shared/ContractCard';
import { FileText, AlertTriangle, PieChart } from 'lucide-react';
import { Contract } from '@shared/schema';

export default function Dashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  // Fetch user's contracts
  const { 
    data: contracts, 
    isLoading, 
    isError,
    refetch
  } = useQuery<Contract[]>({
    queryKey: ['/api/contracts/user/' + user?.id],
    enabled: !!user?.id,
  });

  // Delete contract mutation
  const deleteMutation = useMutation({
    mutationFn: async (contractId: number) => {
      return apiRequest('DELETE', `/api/contract/${contractId}`);
    },
    onSuccess: () => {
      toast({
        title: "Contract deleted",
        description: "The contract has been deleted successfully.",
      });
      refetch();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete contract. Please try again.",
        variant: "destructive",
      });
      console.error(error);
    }
  });

  // Navigation handlers
  const handleViewContract = (id: number) => {
    setLocation(`/analyzer?contractId=${id}`);
  };

  const handleDeleteContract = (id: number) => {
    if (window.confirm('Are you sure you want to delete this contract?')) {
      deleteMutation.mutate(id);
    }
  };

  // Mock download function (would be implemented with actual file download in production)
  const handleDownloadContract = (id: number) => {
    toast({
      title: "Download started",
      description: "Your contract is being downloaded.",
    });
  };

  // Calculate stats
  const totalContracts = contracts?.length || 0;
  const highRiskContracts = contracts?.filter(c => c.riskScore === 'high').length || 0;
  const mediumRiskContracts = contracts?.filter(c => c.riskScore === 'medium').length || 0;
  const lowRiskContracts = contracts?.filter(c => c.riskScore === 'low').length || 0;

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Manage your contracts and analysis</p>
      </div>
      
      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="pt-5">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-500 text-sm uppercase">Contracts Analyzed</p>
                {isLoading ? (
                  <Skeleton className="h-10 w-16 mt-1" />
                ) : (
                  <h2 className="text-3xl font-bold text-gray-900 mt-1">{totalContracts}</h2>
                )}
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <FileText className="text-primary-600 h-6 w-6" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-green-500 text-sm font-medium">
                <i className="fas fa-arrow-up"></i> 12% from last month
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-5">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-500 text-sm uppercase">Risk Score (Avg)</p>
                {isLoading ? (
                  <Skeleton className="h-10 w-24 mt-1" />
                ) : (
                  <h2 className="text-3xl font-bold text-yellow-500 mt-1">Medium</h2>
                )}
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <AlertTriangle className="text-yellow-500 h-6 w-6" />
              </div>
            </div>
            <div className="mt-4">
              <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-yellow-500" style={{width: '65%'}}></div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-5">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-500 text-sm uppercase">Usage</p>
                {isLoading ? (
                  <Skeleton className="h-10 w-16 mt-1" />
                ) : (
                  <h2 className="text-3xl font-bold text-gray-900 mt-1">65%</h2>
                )}
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <PieChart className="text-green-500 h-6 w-6" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-600">
                <span className="font-medium">13/20</span> analyses this month
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Recent Contracts Section */}
      <Card className="mb-8">
        <div className="p-5 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">Recent Contracts</h2>
          <Link href="/analyzer">
            <Button>
              New Analysis
            </Button>
          </Link>
        </div>
        
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-8 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
            </div>
          ) : isError ? (
            <div className="p-8 text-center text-red-500">
              Failed to load contracts. Please try again.
            </div>
          ) : contracts && contracts.length > 0 ? (
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <th className="p-4">Contract Name</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Risk Score</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {contracts.map(contract => (
                  <ContractCard
                    key={contract.id}
                    id={contract.id}
                    name={contract.name}
                    date={contract.uploadedAt}
                    riskScore={contract.riskScore}
                    contractType={contract.contractType || ''}
                    fileType={contract.fileType}
                    onView={handleViewContract}
                    onDownload={handleDownloadContract}
                    onDelete={handleDeleteContract}
                  />
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-8 text-center text-gray-500">
              No contracts found. Upload a contract to get started.
            </div>
          )}
        </div>
        
        {contracts && contracts.length > 0 && (
          <div className="p-4 border-t border-gray-200 text-center">
            <Button variant="link">View all contracts</Button>
          </div>
        )}
      </Card>
    </div>
  );
}
