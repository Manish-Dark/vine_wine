import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Calendar as CalendarIcon, FileText } from 'lucide-react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { format } from 'date-fns';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useWineStore } from '../hooks/useWineStore';

interface ReportSectionProps {
  token?: string | null;
}

export const ReportSection: React.FC<ReportSectionProps> = ({ token }) => {
  const { wines, setFilter, loading } = useWineStore(token);
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([new Date(), new Date()]);
  const [startDate, endDate] = dateRange;

  useEffect(() => {
    if (startDate && endDate) {
      setFilter(prev => ({ 
        ...prev, 
        startDate: format(startDate, 'yyyy-MM-dd'),
        endDate: format(endDate, 'yyyy-MM-dd')
      }));
    } else if (!startDate && !endDate) {
      setFilter(prev => ({ ...prev, startDate: undefined, endDate: undefined }));
    }
  }, [startDate, endDate, setFilter]);

  const handleExportPDF = () => {
    try {
      console.log('Exporting PDF for wines:', wines);
      if (wines.length === 0) {
        console.warn('No wines to export');
        return;
      }

      const doc = new jsPDF();
      const tableColumn = ["Wine Name", "Shop Name", "Type", "Vintage", "Qty", "Price", "Exp", "Selling", "Profit"];
      const tableRows: any[] = [];

      wines.forEach(wine => {
        const profit = (wine.quantity * (wine.sellingPrice || 0)) - (wine.quantity * wine.price) - (wine.otherExpense || 0);
        const wineData = [
          wine.name,
          wine.shopName || '-',
          wine.type,
          wine.vintage,
          wine.quantity,
          (wine.price || 0).toLocaleString('en-IN'),
          (wine.otherExpense || 0).toLocaleString('en-IN'),
          (wine.sellingPrice || 0).toLocaleString('en-IN'),
          profit.toLocaleString('en-IN')
        ];
        tableRows.push(wineData);
      });

      const rangeText = startDate && endDate 
        ? `${format(startDate, 'dd/MM/yyyy')} - ${format(endDate, 'dd/MM/yyyy')}`
        : 'All Records';

      const pageWidth = doc.internal.pageSize.getWidth();

      // Header styling - Premium Red
      doc.setFontSize(24);
      doc.setTextColor(139, 26, 47); // Dark Red
      doc.text("Vino Vault - Wine Report", pageWidth / 2, 20, { align: 'center' });
      
      doc.setFontSize(11);
      doc.setTextColor(100);
      doc.text(`Generated on: ${format(new Date(), 'dd-MM-yyyy HH:mm')}`, pageWidth / 2, 28, { align: 'center' });
      doc.text(`Period: ${rangeText}`, pageWidth / 2, 34, { align: 'center' });
      
      doc.setFontSize(10);
      doc.setTextColor(139, 26, 47);
      doc.text("Contact Us: mmanishsharma483@gmail.com", pageWidth / 2, 40, { align: 'center' });

      // Table styling - Royal Blue [13, 71, 161]
      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 45,
        theme: 'grid',
        headStyles: { 
          fillColor: [13, 71, 161], // Royal Blue
          textColor: [255, 255, 255], 
          fontSize: 10,
          fontStyle: 'bold',
          halign: 'center'
        },
        styles: { fontSize: 10, cellPadding: 3 },
        alternateRowStyles: { fillColor: [240, 248, 255] }, // Very light blue
        margin: { top: 45 },
      });

      doc.save(`Wine_Report_${rangeText.replace(/\//g, '-').replace(/ /g, '_')}.pdf`);
      console.log('PDF Export successful');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Failed to generate PDF. Please check the console for details.');
    }
  };

  return (
    <div className="report-section">
      <div className="report-header">
         <div className="report-controls">
            <div className="date-picker-container">
              <CalendarIcon size={16} className="calendar-icon" />
              <DatePicker
                selected={startDate}
                onChange={(date: Date | null) => setDateRange([date, endDate])}
                selectsStart
                startDate={startDate || undefined}
                endDate={endDate || undefined}
                dateFormat="dd-MM-yyyy"
                className="report-date-input"
                placeholderText="Start Date"
                portalId="root"
              />
            </div>

            <div className="date-picker-container">
              <CalendarIcon size={16} className="calendar-icon" />
              <DatePicker
                selected={endDate}
                onChange={(date: Date | null) => setDateRange([startDate, date])}
                selectsEnd
                startDate={startDate || undefined}
                endDate={endDate || undefined}
                minDate={startDate || undefined}
                dateFormat="dd-MM-yyyy"
                className="report-date-input"
                placeholderText="End Date"
                portalId="root"
              />
            </div>
            <button 
              className="btn btn-primary" 
              onClick={handleExportPDF}
              disabled={wines.length === 0}
            >
              <Download size={18} />
              <span>Export PDF</span>
            </button>
         </div>
         <div className="report-meta">
            <p>
              {wines.length > 0 ? (
                <>Showing <strong>{wines.length}</strong> records for {startDate && endDate ? `${format(startDate, 'dd MMM yyyy')} - ${format(endDate, 'dd MMM yyyy')}` : 'all time'}</>
              ) : (
                <span style={{ color: 'var(--danger-light)' }}>No records found for this range. Adjust dates to enable export.</span>
              )}
            </p>
         </div>
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
           <motion.div 
             key="loading"
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             className="report-empty"
           >
             <p>Loading report data...</p>
           </motion.div>
        ) : wines.length > 0 ? (
          <motion.div 
            key="table"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="table-wrap"
          >
            <table className="wine-table">
              <thead>
                <tr>
                  <th>Shop Name</th>
                  <th>Wine</th>
                  <th>Type</th>
                  <th>Vintage</th>
                  <th>Qty</th>
                  <th>Price</th>
                  <th>Other Exp.</th>
                  <th>Selling</th>
                  <th style={{ color: '#27ae60' }}>Profit</th>
                </tr>
              </thead>
              <tbody>
                {wines.map((wine) => (
                  <tr key={wine.id} className="table-row">
                    <td>{wine.shopName || '-'}</td>
                    <td className="td-name">{wine.name}</td>
                    <td><span className={`badge badge-${wine.type.toLowerCase()}`}>{wine.type}</span></td>
                    <td>{wine.vintage}</td>
                    <td>{wine.quantity}</td>
                    <td>₹{wine.price.toLocaleString('en-IN')}</td>
                    <td style={{ color: 'var(--gold)' }}>₹{(wine.otherExpense || 0).toLocaleString('en-IN')}</td>
                    <td style={{ fontWeight: 600, color: 'var(--primary)' }}>₹{(wine.sellingPrice || 0).toLocaleString('en-IN')}</td>
                    <td style={{ fontWeight: 700, color: '#27ae60' }}>₹{((wine.quantity * (wine.sellingPrice || 0)) - (wine.quantity * wine.price) - (wine.otherExpense || 0)).toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        ) : (
          <motion.div 
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="report-empty"
          >
            <FileText size={48} />
            <h3>No entries for this range</h3>
            <p>Try selecting another date range to generate your report.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
