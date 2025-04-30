
import React, { useRef } from 'react';
import { CartItem } from '@/pages/admin/PointOfSale';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Receipt, Printer } from 'lucide-react';

interface PaymentReceiptProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  total: number;
  transactionId?: string;
  timestamp?: Date;
}

const PaymentReceipt: React.FC<PaymentReceiptProps> = ({
  isOpen,
  onClose,
  items,
  total,
  transactionId = `TR-${Math.floor(Math.random() * 1000000)}`,
  timestamp = new Date(),
}) => {
  const receiptRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const receiptContent = receiptRef.current;
    if (!receiptContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    // Create a styled receipt for printing
    printWindow.document.write(`
      <html>
        <head>
          <title>Payment Receipt</title>
          <style>
            body {
              font-family: 'Courier New', monospace;
              font-size: 12px;
              max-width: 300px;
              margin: 0 auto;
              padding: 15px;
            }
            h1 {
              font-size: 14px;
              text-align: center;
              margin-bottom: 10px;
            }
            .header {
              text-align: center;
              margin-bottom: 15px;
              font-weight: bold;
            }
            .info {
              margin-bottom: 15px;
              font-size: 11px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
            }
            th, td {
              text-align: left;
              padding: 4px 0;
              vertical-align: top;
            }
            .quantity {
              text-align: center;
              width: 30px;
            }
            .price {
              text-align: right;
            }
            .total-row {
              font-weight: bold;
              border-top: 1px dashed #000;
              margin-top: 5px;
              padding-top: 5px;
            }
            .footer {
              margin-top: 20px;
              text-align: center;
              font-size: 11px;
            }
            @media print {
              @page { margin: 0; }
              body { margin: 10px; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            THERAPY CENTER
          </div>
          <div class="info">
            <div>Transaction ID: ${transactionId}</div>
            <div>Date: ${timestamp.toLocaleDateString('id-ID')}</div>
            <div>Time: ${timestamp.toLocaleTimeString('id-ID')}</div>
          </div>
          <table>
            <thead>
              <tr>
                <th class="quantity">Qty</th>
                <th>Item</th>
                <th class="price">Price</th>
              </tr>
            </thead>
            <tbody>
              ${items.map(item => `
                <tr>
                  <td class="quantity">${item.quantity}</td>
                  <td>${item.name}</td>
                  <td class="price">Rp ${item.price.toLocaleString('id-ID')}</td>
                </tr>
              `).join('')}
              <tr class="total-row">
                <td colspan="2">Total</td>
                <td class="price">Rp ${total.toLocaleString('id-ID')}</td>
              </tr>
            </tbody>
          </table>
          <div class="footer">
            Thank you for your business!
          </div>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="h-4 w-4" />
            Payment Receipt
          </DialogTitle>
        </DialogHeader>
        
        <div ref={receiptRef} className="bg-white p-4 rounded-md border text-sm">
          <div className="text-center font-semibold mb-2">THERAPY CENTER</div>
          
          <div className="text-xs mb-3">
            <div>Transaction ID: {transactionId}</div>
            <div>Date: {timestamp.toLocaleDateString('id-ID')}</div>
            <div>Time: {timestamp.toLocaleTimeString('id-ID')}</div>
          </div>
          
          <Separator className="my-2" />
          
          <table className="w-full text-xs">
            <thead>
              <tr>
                <th className="text-left font-medium">Item</th>
                <th className="text-center font-medium w-12">Qty</th>
                <th className="text-right font-medium">Price</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td className="text-center">{item.quantity}</td>
                  <td className="text-right">Rp {item.price.toLocaleString('id-ID')}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={3}><Separator className="my-2" /></td>
              </tr>
              <tr className="font-semibold">
                <td colSpan={2}>Total</td>
                <td className="text-right">Rp {total.toLocaleString('id-ID')}</td>
              </tr>
            </tfoot>
          </table>
          
          <div className="mt-4 text-xs text-center text-muted-foreground">
            Thank you for your business!
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose} size="sm">
            Close
          </Button>
          <Button onClick={handlePrint} className="gap-1" size="sm">
            <Printer className="h-3 w-3" /> 
            Print Receipt
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentReceipt;
