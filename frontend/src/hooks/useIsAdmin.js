import { useAccount, useReadContract } from 'wagmi';
import { userProfileAbi, contractAddresses } from '../lib/blockchain/contracts';

export const useIsAdmin = () => {
  const { address, isConnected } = useAccount();

  const { data: owner, isLoading } = useReadContract({
    address: contractAddresses.userProfile,
    abi: userProfileAbi,
    functionName: 'owner',
    query: {
      enabled: isConnected,
    },
  });

  const isAdmin = isConnected && !isLoading && owner === address;

  return { isAdmin, isLoading };
};
