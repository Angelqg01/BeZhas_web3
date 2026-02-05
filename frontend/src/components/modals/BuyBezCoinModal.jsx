/**
 * BuyBezCoinModal.jsx
 * 
 * Modal para comprar BEZ tokens - Ahora usa UnifiedPaymentModal
 * 
 * Ubicación: frontend/src/components/modals/BuyBezCoinModal.jsx
 */

import UnifiedPaymentModal from '../UnifiedPaymentModal';

const BuyBezCoinModal = ({ isOpen, onClose }) => {
    const handleSuccess = (result) => {
        console.log('Compra exitosa:', result);
        // Aquí puedes actualizar el balance, etc.
    };

    return (
        <UnifiedPaymentModal
            isOpen={isOpen}
            onClose={onClose}
            type="purchase"
            itemName="BEZ Tokens"
            onSuccess={handleSuccess}
        />
    );
};

export default BuyBezCoinModal;
