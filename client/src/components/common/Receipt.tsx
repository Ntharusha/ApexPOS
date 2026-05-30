import React, { forwardRef } from 'react';

export interface ReceiptProps {
    saleId: string;
    items: Array<{ name: string; quantity: number; price: number; tax_category?: string; tax_amount?: number }>;
    total: number;
    discount: number;
    date: string;
    vatAmount?: number;
    ssclAmount?: number;
    grandTotal?: number;
    payments?: Array<{ method: string; amount: number }>;
    cashierName?: string;
    settings?: any;
}


const Receipt = forwardRef<HTMLDivElement, ReceiptProps>((props, ref) => {
    const { saleId, items, total, discount, date, vatAmount = 0, ssclAmount = 0, grandTotal, payments = [], cashierName = 'Cashier', settings } = props;

    const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const finalTotal = grandTotal ?? (subtotal + vatAmount + ssclAmount - discount);

    return (
        <div ref={ref} style={{ padding: '16px', maxWidth: '300px', backgroundColor: '#ffffff', color: '#000000', fontFamily: 'monospace', fontSize: '12px', lineHeight: '1.5' }}>
            {/* Header */}
            <div style={{ textAlign: 'center', borderBottom: '2px solid #000', paddingBottom: '12px', marginBottom: '12px' }}>
                <div style={{ fontSize: '20px', fontWeight: 'bold', letterSpacing: '0.1em' }}>★ {settings?.businessName || 'APEX POS'} ★</div>

                <div style={{ fontSize: '10px', marginTop: '4px' }}>No. 123, Tech Street, Colombo 03</div>
                <div style={{ fontSize: '10px' }}>Tel: 011-234-5678</div>
                <div style={{ fontSize: '10px' }}>VAT Reg: VAT123456789 | TIN: TIN987654</div>
            </div>

            {/* Invoice Info */}
            <div style={{ marginBottom: '10px', fontSize: '11px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Invoice #:</span>
                    <span style={{ fontWeight: 'bold' }}>{saleId}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Date:</span>
                    <span>{date}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Cashier:</span>
                    <span>{cashierName}</span>
                </div>
            </div>

            {/* Divider */}
            <div style={{ borderTop: '1px dashed #000', marginBottom: '10px' }} />

            {/* Items */}
            <table style={{ width: '100%', marginBottom: '10px', fontSize: '11px' }}>
                <thead>
                    <tr style={{ borderBottom: '1px solid #000' }}>
                        <th style={{ textAlign: 'left', paddingBottom: '4px' }}>Item</th>
                        <th style={{ textAlign: 'center', paddingBottom: '4px' }}>Qty</th>
                        <th style={{ textAlign: 'right', paddingBottom: '4px' }}>Total</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map((item, idx) => (
                        <tr key={idx}>
                            <td style={{ paddingTop: '3px', maxWidth: '130px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {item.name}
                                {item.tax_category === 'ZERO_RATED' && <span style={{ fontSize: '9px', marginLeft: '4px' }}>(ZR)</span>}
                                {item.tax_category === 'EXEMPT' && <span style={{ fontSize: '9px', marginLeft: '4px' }}>(EX)</span>}
                            </td>
                            <td style={{ textAlign: 'center', paddingTop: '3px' }}>
                                {item.quantity} x {item.price.toLocaleString()}
                            </td>
                            <td style={{ textAlign: 'right', paddingTop: '3px' }}>
                                {(item.price * item.quantity).toLocaleString()}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Divider */}
            <div style={{ borderTop: '1px dashed #000', marginBottom: '8px' }} />

            {/* Totals */}
            <div style={{ fontSize: '11px', marginBottom: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Subtotal:</span>
                    <span>LKR {subtotal.toLocaleString()}</span>
                </div>
                {discount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Discount:</span>
                        <span>- LKR {discount.toLocaleString()}</span>
                    </div>
                )}
                {vatAmount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>VAT ({(settings?.vatRate * 100 || 18).toFixed(1)}%):</span>
                        <span>LKR {vatAmount.toLocaleString()}</span>
                    </div>
                )}
                {ssclAmount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>SSCL ({(settings?.ssclRate * 100 || 2.5).toFixed(1)}%):</span>
                        <span>LKR {ssclAmount.toLocaleString()}</span>
                    </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '14px', borderTop: '2px solid #000', marginTop: '6px', paddingTop: '6px' }}>
                    <span>GRAND TOTAL:</span>
                    <span>LKR {finalTotal.toLocaleString()}</span>
                </div>
            </div>

            {/* Payment Methods */}
            {payments.length > 0 && (
                <div style={{ fontSize: '11px', marginBottom: '10px', borderTop: '1px dashed #000', paddingTop: '8px' }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>PAYMENT:</div>
                    {payments.map((p, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>{p.method}:</span>
                            <span>LKR {Number(p.amount).toLocaleString()}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* LankaQR Footer */}
            <div style={{ textAlign: 'center', borderTop: '1px dashed #000', paddingTop: '12px', fontSize: '10px' }}>
                <div style={{ marginBottom: '6px' }}>
                    <div style={{ fontSize: '24px', letterSpacing: '-2px' }}>▐██ ██▌</div>
                    <div style={{ fontSize: '24px', letterSpacing: '-2px' }}>▐█ █▌</div>
                    <div style={{ fontSize: '24px', letterSpacing: '-2px' }}>▐██ ██▌</div>
                </div>
                <div style={{ fontSize: '9px', fontWeight: 'bold' }}>LankaQR Enabled Payment</div>
                <div style={{ marginTop: '8px' }}>Thank you for your purchase!</div>
                <div>Please come again 🙏</div>
                <div style={{ marginTop: '6px', fontSize: '9px', color: '#555' }}>Powered by ApexPOS | System by Antigravity</div>
            </div>
        </div>
    );
});

Receipt.displayName = 'Receipt';
export default Receipt;
