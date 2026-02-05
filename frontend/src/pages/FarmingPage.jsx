import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { ethers } from 'ethers';
import { useAuth } from '../context/AuthContext';
import { Droplets, DollarSign, Zap, Gift } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import GlobalStatsBar from '../components/GlobalStatsBar';
// import RelatedQuests from '../components/finance/RelatedQuests'; // REMOVED: Quests system eliminated
import './FinancePages.css';

const FarmingPage = ({ farmingContract, lpTokenContract }) => {
  const { user } = useAuth();
  const [addLiquidityAmount, setAddLiquidityAmount] = useState('');
  const [removeLiquidityAmount, setRemoveLiquidityAmount] = useState('');

  const [stats, setStats] = useState({
    totalLiquidity: '0',
    apr: '45.5', // Assuming APR is a fixed value for now
    userLiquidity: '0',
    rewardsEarned: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    if (!farmingContract || !user) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const [totalLiquidity, userInfo, pendingRewards] = await Promise.all([
        farmingContract.totalLpStaked(),
        farmingContract.userInfo(user.address),
        farmingContract.pendingRewards(user.address)
      ]);

      setStats(prevStats => ({
        ...prevStats,
        totalLiquidity: parseFloat(ethers.formatUnits(totalLiquidity, 18)).toLocaleString('en-US'),
        userLiquidity: parseFloat(ethers.formatUnits(userInfo.amount, 18)).toLocaleString('en-US'),
        rewardsEarned: parseFloat(ethers.formatUnits(pendingRewards, 18))
      }));
    } catch (error) {
      console.error("Failed to fetch farming stats:", error);
    } finally {
      setIsLoading(false);
    }
  }, [farmingContract, user]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Mock data
  const mockStats = {
    totalLiquidity: 2500000.00,
    apr: 45.5,
    userLiquidity: 10000,
    rewardsEarned: 450.75
  };


  const handleAddLiquidity = async () => {
    if (!farmingContract || !lpTokenContract || parseFloat(addLiquidityAmount) <= 0) return;
    try {
      const amountInWei = ethers.parseUnits(addLiquidityAmount, 18);
      const farmingContractAddress = await farmingContract.getAddress();

      // Approve spending LP tokens
      const approveTx = await lpTokenContract.approve(farmingContractAddress, amountInWei);
      await approveTx.wait();

      // Deposit LP tokens
      const depositTx = await farmingContract.deposit(amountInWei);
      await depositTx.wait();

      setAddLiquidityAmount('');
      fetchStats(); // Refresh stats
    } catch (error) {
      console.error("Adding liquidity failed:", error);
      toast.error(`Error al añadir liquidez: ${error.reason || error.message}`);
    }
  };

  const handleRemoveLiquidity = async () => {
    if (!farmingContract || parseFloat(removeLiquidityAmount) <= 0) return;
    try {
      const amountInWei = ethers.parseUnits(removeLiquidityAmount, 18);
      const withdrawTx = await farmingContract.withdraw(amountInWei);
      await withdrawTx.wait();
      setRemoveLiquidityAmount('');
      fetchStats(); // Refresh stats
    } catch (error) {
      console.error("Removing liquidity failed:", error);
      toast.error(`Error al retirar liquidez: ${error.reason || error.message}`);
    }
  };

  const handleClaimRewards = async () => {
    if (!farmingContract) return;
    try {
      const claimTx = await farmingContract.claimReward();
      await claimTx.wait();
      fetchStats(); // Refresh stats
    } catch (error) {
      console.error("Failed to claim farming rewards:", error);
      toast.error(`Error al reclamar recompensas: ${error.reason || error.message}`);
    }
  };

  return (
    <div className="finance-page">
      {/* Global Stats Bar - Ecosystem Metrics */}
      <GlobalStatsBar />

      <header className="finance-header">
        <h1><Droplets size={28} /> Liquidity Farming</h1>
        <p>Aporta liquidez al par BEZ/ETH para ganar recompensas y comisiones.</p>
      </header>

      <div className="finance-stats-grid">
        <Card className="stat-card-finance">
          <DollarSign />
          <div>
            <div className="stat-label-finance">Liquidez Total</div>
            <div className="stat-value-finance">{stats.totalLiquidity} LP Tokens</div>
          </div>
        </Card>
        <Card className="stat-card-finance">
          <Zap />
          <div>
            <div className="stat-label-finance">APR Estimado</div>
            <div className="stat-value-finance">{stats.apr}%</div>
          </div>
        </Card>
      </div>

      <div className="finance-main-content">
        <div className="finance-actions">
          <Card>
            <h3>Tu Liquidez</h3>
            <div className="user-stats">
              <div className="user-stat">
                <span>Tus LP Tokens en Farming:</span>
                <strong>{stats.userLiquidity} LP</strong>
              </div>
              <div className="user-stat">
                <span>Recompensas Ganadas:</span>
                <strong className="rewards">{(stats.rewardsEarned || 0).toFixed(2)} BEZ</strong>
              </div>
            </div>
            <Button variant="primary" onClick={handleClaimRewards} className="claim-btn">
              <Gift size={16} /> Reclamar Recompensas
            </Button>
          </Card>

          <Card>
            <h3>Aportar Liquidez</h3>
            <div className="action-form">
              <input
                type="number"
                placeholder="Cantidad de LP Tokens"
                value={addLiquidityAmount}
                onChange={(e) => setAddLiquidityAmount(e.target.value)}
                className="form-input-finance"
              />
              <Button variant="primary" onClick={handleAddLiquidity}>Aportar</Button>
            </div>
          </Card>

          <Card>
            <h3>Retirar Liquidez</h3>
            <div className="action-form">
              <input
                type="number"
                placeholder="Cantidad de LP Tokens"
                value={removeLiquidityAmount}
                onChange={(e) => setRemoveLiquidityAmount(e.target.value)}
                className="form-input-finance"
              />
              <Button variant="secondary" onClick={handleRemoveLiquidity}>Retirar</Button>
            </div>
          </Card>
        </div>

        {/* Removed RelatedQuests component */}
      </div>
    </div>
  );
};

export default FarmingPage;
