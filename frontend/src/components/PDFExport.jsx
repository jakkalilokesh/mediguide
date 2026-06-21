import { Download } from 'lucide-react'

export default function PDFExport({ contentRef, filename = 'MediGuide-Report' }) {
    const handleExport = async () => {
        // Simple PDF generation by printing to PDF via browser
        const printContent = contentRef?.current?.innerHTML
        if (!printContent) return

        const win = window.open('', '_blank')
        win.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>${filename}</title>
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body {
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        padding: 40px;
                        color: #1a1a2e;
                        line-height: 1.6;
                    }
                    .pdf-header {
                        text-align: center;
                        margin-bottom: 30px;
                        padding-bottom: 20px;
                        border-bottom: 2px solid #10b981;
                    }
                    .pdf-header h1 { color: #10b981; font-size: 24px; }
                    .pdf-header p { color: #666; font-size: 12px; }
                    h2, h3 { color: #1a1a2e; margin: 15px 0 8px; }
                    p, li { font-size: 14px; margin: 4px 0; }
                    ul { padding-left: 20px; }
                    .urgency-badge {
                        display: inline-block;
                        padding: 4px 12px;
                        border-radius: 12px;
                        font-weight: bold;
                        font-size: 12px;
                    }
                    .urgency-low { background: #d1fae5; color: #065f46; }
                    .urgency-medium { background: #fef3c7; color: #92400e; }
                    .urgency-high { background: #fee2e2; color: #991b1b; }
                    .footer {
                        margin-top: 40px;
                        padding-top: 15px;
                        border-top: 1px solid #e5e7eb;
                        text-align: center;
                        color: #999;
                        font-size: 11px;
                    }
                    @media print {
                        body { padding: 20px; }
                    }
                </style>
            </head>
            <body>
                <div class="pdf-header">
                    <h1>🏥 MediGuide Health Report</h1>
                    <p>Generated on ${new Date().toLocaleString()}</p>
                </div>
                ${printContent}
                <div class="footer">
                    <p>⚠️ This is AI-generated guidance, not a medical diagnosis. Always consult a healthcare professional.</p>
                    <p>MediGuide — Symptom Triage & Health Guidance Assistant</p>
                </div>
            </body>
            </html>
        `)
        win.document.close()
        setTimeout(() => {
            win.print()
            win.close()
        }, 500)
    }

    return (
        <button className="pdf-export-btn" onClick={handleExport} title="Export as PDF">
            <Download size={16} /> Export PDF
        </button>
    )
}
