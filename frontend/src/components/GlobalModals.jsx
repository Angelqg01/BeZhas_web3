import React, { memo } from 'react';
import { useBezCoin } from '../context/BezCoinContext';
import BuyBezCoinModal from './modals/BuyBezCoinModal';

const GlobalModals = () => {
    const { showBuyModal, setShowBuyModal } = useBezCoin();

    return (
        <>
            <BuyBezCoinModal
                isOpen={showBuyModal}
                onClose={() => setShowBuyModal(false)}
            />
        </>
    );
};

export default memo(GlobalModals);
