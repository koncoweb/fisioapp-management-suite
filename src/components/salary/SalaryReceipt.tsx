import React, { useRef } from 'react';
import { TherapistSalary } from '@/types/salary';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Printer, Download } from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import AppConfigHeader from '@/components/receipt/AppConfigHeader';

interface SalaryReceiptProps {
  salary: TherapistSalary;
  onClose: () => void;
}

const SalaryReceipt: React.FC<SalaryReceiptProps> = ({ salary, onClose }) => {
  const receiptRef = useRef<HTMLDivElement>(null);
  
  const handlePrint = () => {
    if (!receiptRef.current) return;
    
    const printContent = receiptRef.current.innerHTML;
    
    const printStyles = `
      @page {
        size: 210mm 297mm;
        margin: 10mm;
      }
      body {
        margin: 0;
        padding: 0;
        color: black;
        font-size: 12pt;
      }
      h2, h3 {
        color: black;
        font-weight: bold;
      }
      .receipt-container {
        width: 190mm;
        padding: 10mm;
      }
      table {
        width: 100%;
        border-collapse: collapse;
      }
      table, th, td {
        border: 1px solid #ddd;
      }
      th, td {
        padding: 8px;
        text-align: left;
      }
      th {
        background-color: #f2f2f2;
      }
    `;
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Slip Gaji - ${salary.therapistName}</title>
          <style>${printStyles}</style>
        </head>
        <body>
          <div class="receipt-container">${printContent}</div>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    
    // Delay printing to ensure content is fully loaded
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };
  
  const handleDownloadPDF = async () => {
    if (!receiptRef.current) return;
    
    const canvas = await html2canvas(receiptRef.current, {
      scale: 2,
      logging: false,
      useCORS: true,
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });
    
    pdf.addImage(imgData, 'PNG', 10, 10, 190, 0);
    pdf.save(`Slip-Gaji-${salary.therapistName}-${salary.periodMonth}-${salary.periodYear}.pdf`);
  };

  // Format bulan dalam bahasa Indonesia
  const formatMonth = (month: number) => {
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return months[month - 1];
  };
  
  // Hitung total komponen gaji
  const totalTherapyPayments = salary.therapyPayments.reduce((sum, payment) => sum + payment.amount, 0);
  const totalBonuses = salary.bonuses ? salary.bonuses.reduce((sum, bonus) => sum + bonus.amount, 0) : 0;
  const totalAllowances = salary.allowances ? salary.allowances.reduce((sum, allowance) => sum + allowance.amount, 0) : 0;
  const totalDeductions = salary.deductions ? salary.deductions.reduce((sum, deduction) => sum + deduction.amount, 0) : 0;
  const totalTaxes = salary.taxes ? salary.taxes.reduce((sum, tax) => sum + tax.amount, 0) : 0;
  const totalCashAdvances = salary.cashAdvances ? salary.cashAdvances.reduce((sum, cashAdvance) => sum + cashAdvance.amount, 0) : 0;
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };
  
  return (
    <div className="flex flex-col space-y-4">
      <div 
        ref={receiptRef} 
        className="bg-white p-6 border rounded-md shadow-sm"
        style={{ color: 'black' }}
      >
        <AppConfigHeader type="salary" />
        <div className="text-center mb-6">
          <p className="text-base text-black">Periode: {formatMonth(salary.periodMonth)} {salary.periodYear}</p>
        </div>
        
        <div className="text-base mb-6 text-black">
          <div className="flex justify-between mb-2">
            <span className="font-medium">Nama Terapis:</span>
            <span>{salary.therapistName}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="font-medium">ID Terapis:</span>
            <span>{salary.therapistId}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="font-medium">Status:</span>
            <span className={salary.status === 'paid' ? 'font-bold text-green-600' : 'font-bold text-yellow-600'}>
              {salary.status === 'paid' ? 'LUNAS' : 'BELUM DIBAYAR'}
            </span>
          </div>
          {salary.paidDate && (
            <div className="flex justify-between mb-2">
              <span className="font-medium">Tanggal Pembayaran:</span>
              <span>{format(new Date(salary.paidDate), 'dd/MM/yyyy')}</span>
            </div>
          )}
        </div>
        
        <div className="border-t border-dashed my-4 border-black"></div>
        
        <div className="mb-6">
          <h4 className="font-bold text-lg mb-2 text-black">Rincian Pendapatan</h4>
          
          {/* Tabel Pembayaran Terapi */}
          {salary.therapyPayments.length > 0 && (
            <div className="mb-4">
              <h5 className="font-medium mb-2 text-black">Pembayaran Terapi</h5>
              <table className="w-full border-collapse mb-2">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border p-2 text-left">Tanggal</th>
                    <th className="border p-2 text-left">Pasien</th>
                    <th className="border p-2 text-left">Layanan</th>
                    <th className="border p-2 text-right">Jumlah</th>
                  </tr>
                </thead>
                <tbody>
                  {salary.therapyPayments.map((payment, index) => (
                    <tr key={index} className="border">
                      <td className="border p-2">{format(new Date(payment.date), 'dd/MM/yyyy')}</td>
                      <td className="border p-2">{payment.patientName}</td>
                      <td className="border p-2">{payment.serviceName}</td>
                      <td className="border p-2 text-right">{formatCurrency(payment.amount)}</td>
                    </tr>
                  ))}
                  <tr className="font-medium">
                    <td colSpan={3} className="border p-2 text-right">Total Pembayaran Terapi:</td>
                    <td className="border p-2 text-right">{formatCurrency(totalTherapyPayments)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
          
          {/* Tabel Bonus */}
          {salary.bonuses && salary.bonuses.length > 0 && (
            <div className="mb-4">
              <h5 className="font-medium mb-2 text-black">Bonus</h5>
              <table className="w-full border-collapse mb-2">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border p-2 text-left">Tanggal</th>
                    <th className="border p-2 text-left">Deskripsi</th>
                    <th className="border p-2 text-right">Jumlah</th>
                  </tr>
                </thead>
                <tbody>
                  {salary.bonuses.map((bonus, index) => (
                    <tr key={index} className="border">
                      <td className="border p-2">{format(new Date(bonus.date), 'dd/MM/yyyy')}</td>
                      <td className="border p-2">{bonus.description}</td>
                      <td className="border p-2 text-right">{formatCurrency(bonus.amount)}</td>
                    </tr>
                  ))}
                  <tr className="font-medium">
                    <td colSpan={2} className="border p-2 text-right">Total Bonus:</td>
                    <td className="border p-2 text-right">{formatCurrency(totalBonuses)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
          
          {/* Tabel Tunjangan */}
          {salary.allowances && salary.allowances.length > 0 && (
            <div className="mb-4">
              <h5 className="font-medium mb-2 text-black">Tunjangan</h5>
              <table className="w-full border-collapse mb-2">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border p-2 text-left">Tanggal</th>
                    <th className="border p-2 text-left">Deskripsi</th>
                    <th className="border p-2 text-right">Jumlah</th>
                  </tr>
                </thead>
                <tbody>
                  {salary.allowances.map((allowance, index) => (
                    <tr key={index} className="border">
                      <td className="border p-2">{format(new Date(allowance.date), 'dd/MM/yyyy')}</td>
                      <td className="border p-2">{allowance.description}</td>
                      <td className="border p-2 text-right">{formatCurrency(allowance.amount)}</td>
                    </tr>
                  ))}
                  <tr className="font-medium">
                    <td colSpan={2} className="border p-2 text-right">Total Tunjangan:</td>
                    <td className="border p-2 text-right">{formatCurrency(totalAllowances)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        <div className="mb-6">
          <h4 className="font-bold text-lg mb-2 text-black">Rincian Potongan</h4>
          
          {/* Tabel Potongan */}
          {salary.deductions && salary.deductions.length > 0 && (
            <div className="mb-4">
              <h5 className="font-medium mb-2 text-black">Potongan</h5>
              <table className="w-full border-collapse mb-2">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border p-2 text-left">Tanggal</th>
                    <th className="border p-2 text-left">Deskripsi</th>
                    <th className="border p-2 text-right">Jumlah</th>
                  </tr>
                </thead>
                <tbody>
                  {salary.deductions.map((deduction, index) => (
                    <tr key={index} className="border">
                      <td className="border p-2">{format(new Date(deduction.date), 'dd/MM/yyyy')}</td>
                      <td className="border p-2">{deduction.description}</td>
                      <td className="border p-2 text-right">{formatCurrency(deduction.amount)}</td>
                    </tr>
                  ))}
                  <tr className="font-medium">
                    <td colSpan={2} className="border p-2 text-right">Total Potongan:</td>
                    <td className="border p-2 text-right">{formatCurrency(totalDeductions)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
          
          {/* Tabel Pajak */}
          {salary.taxes && salary.taxes.length > 0 && (
            <div className="mb-4">
              <h5 className="font-medium mb-2 text-black">Pajak</h5>
              <table className="w-full border-collapse mb-2">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border p-2 text-left">Tanggal</th>
                    <th className="border p-2 text-left">Deskripsi</th>
                    <th className="border p-2 text-right">Jumlah</th>
                  </tr>
                </thead>
                <tbody>
                  {salary.taxes.map((tax, index) => (
                    <tr key={index} className="border">
                      <td className="border p-2">{format(new Date(tax.date), 'dd/MM/yyyy')}</td>
                      <td className="border p-2">{tax.description}</td>
                      <td className="border p-2 text-right">{formatCurrency(tax.amount)}</td>
                    </tr>
                  ))}
                  <tr className="font-medium">
                    <td colSpan={2} className="border p-2 text-right">Total Pajak:</td>
                    <td className="border p-2 text-right">{formatCurrency(totalTaxes)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
          
          {/* Tabel Kasbon */}
          {salary.cashAdvances && salary.cashAdvances.length > 0 && (
            <div className="mb-4">
              <h5 className="font-medium mb-2 text-black">Kasbon</h5>
              <table className="w-full border-collapse mb-2">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border p-2 text-left">Tanggal</th>
                    <th className="border p-2 text-left">Deskripsi</th>
                    <th className="border p-2 text-right">Jumlah</th>
                  </tr>
                </thead>
                <tbody>
                  {salary.cashAdvances.map((cashAdvance, index) => (
                    <tr key={index} className="border">
                      <td className="border p-2">{format(new Date(cashAdvance.date), 'dd/MM/yyyy')}</td>
                      <td className="border p-2">{cashAdvance.description}</td>
                      <td className="border p-2 text-right">{formatCurrency(cashAdvance.amount)}</td>
                    </tr>
                  ))}
                  <tr className="font-medium">
                    <td colSpan={2} className="border p-2 text-right">Total Kasbon:</td>
                    <td className="border p-2 text-right">{formatCurrency(totalCashAdvances)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        <div className="border-t border-dashed my-4 border-black"></div>
        
        <div className="text-base mb-6 text-black">
          <div className="flex justify-between font-bold text-lg">
            <span>Total Gaji Bersih:</span>
            <span>{formatCurrency(salary.totalAmount)}</span>
          </div>
        </div>
        
        <div className="border-t border-dashed my-4 border-black"></div>
        
        <div className="text-center text-base text-black mt-8">
          <div className="flex justify-between">
            <div className="text-center">
              <p>Mengetahui,</p>
              <div className="h-20"></div>
              <p>_________________</p>
              <p>Admin</p>
            </div>
            <div className="text-center">
              <p>Diterima oleh,</p>
              <div className="h-20"></div>
              <p>_________________</p>
              <p>{salary.therapistName}</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-center space-x-3">
        <Button variant="outline" size="sm" onClick={handlePrint}>
          <Printer className="h-4 w-4 mr-1" />
          Cetak
        </Button>
        <Button variant="outline" size="sm" onClick={handleDownloadPDF}>
          <Download className="h-4 w-4 mr-1" />
          Download PDF
        </Button>
        <Button variant="outline" size="sm" onClick={onClose}>
          Tutup
        </Button>
      </div>
    </div>
  );
};

export default SalaryReceipt;
