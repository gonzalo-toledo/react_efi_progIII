import jsPDF from 'jspdf';
import { autoTable } from 'jspdf-autotable';

export const exportToPdf = (data, title, columns) => {
    
    console.log(data);
    console.log(title);
    console.log(columns);

    const doc = new jsPDF();
    doc.text(`Listado de ${title}`, 14, 16);

    const tableColumn = columns;
    const tableRows = [];

    data?.forEach(item => {
        const valuesOnly = Object.values(item);
        console.log("values", valuesOnly);
        tableRows.push(valuesOnly);
    });

    autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 20,
        theme: 'grid', // 'striped', 'grid', 'plain'
        styles: {
            cellPadding: 3,
            overflow: 'linebreak',
            font: 'courier',
            fontSize: 12,
            textColor: [0, 0, 0],
        },
    });
    

    doc.save(
        `${title}.pdf`
    )
}
export default exportToPdf;