import React, { forwardRef } from 'react';

export interface ReceiptProps {
    saleId: string;
    items: Array<{ name: string; quantity: number; price: number }>;
    total: number;
    date: string;
}

const Receipt = forwardRef<HTMLDivElement, ReceiptProps>((props, ref) => {
    return (
        <div ref={ref} className="p-8 max-w-[300px] bg-white text-black font-mono text-sm">
            <div className="text-center border-b border-black pb-4 mb-4">
                <h1 className="text-xl font-bold">ApexPOS</h1>
                <p>No. 123, Tech Street, Colombo</p>
                <p>Tel: 011-2345678</p>
            </div>

            <div className="mb-4">
                <p>Date: {props.date}</p>
                <p>Inv #: {props.saleId}</p>
            </div>

            <table className="w-full mb-4">
                <thead>
                    <tr className="border-b border-black">
                        <th className="text-left">Item</th>
                        <th className="text-center">Qty</th>
                        <th className="text-right">Price</th>
                    </tr>
                </thead>
                <tbody>
                    {props.items.map((item, idx) => (
                        <tr key={idx}>
                            <td className="truncate max-w-[100px]">{item.name}</td>
                            <td className="text-center">{item.quantity}</td>
                            <td className="text-right">{item.price.toLocaleString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="border-t border-black pt-2 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>{props.total.toLocaleString()}</span>
            </div>

            <div className="mt-8 text-center text-xs">
                <p>Thank you for shopping with us!</p>
                <p>System by Antigravity</p>
            </div>
        </div>
    );
});

export default Receipt;
