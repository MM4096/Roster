function download_table_as_csv(table_id, separator = ',') {
    // Select rows from table_id
    let rows = document.querySelectorAll('table#' + table_id + ' tr');
    // Construct csv
    let csv = [];
    for (let i = 0; i < rows.length; i++) {
        let row = [], cols = rows[i].querySelectorAll('td, th');
        for (let j = 0; j < cols.length; j++) {
            // Clean innertext to remove multiple spaces and jumpline (break csv)
            let data = cols[j].innerText.replace(/(\r\n|\n|\r)/gm, '').replace(/(\s\s)/gm, ' ')
            // Escape double-quote with double-double-quote (see https://stackoverflow.com/questions/17808511/properly-escape-a-double-quote-in-csv)
            data = data.replace(/"/g, '""');
            // Push escaped string
            row.push('"' + data + '"');
        }
        csv.push(row.join(separator));
    }
    let csv_string = csv.join('\n');
    // Download it
    let filename = 'export_' + table_id + '_' + new Date().toLocaleDateString() + '.csv';
    let link = document.createElement('a');
    link.style.display = 'none';
    link.setAttribute('target', '_blank');
    link.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv_string));
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}



$("#downloadSettings").on("click", function() {
    let download = confirm("Are you sure you want to download your settings?\nWill be downloaded as settings.json");
    if (!download) { return; }
    let settings = SaveSettings();
    let blob = new Blob([settings], {type: "text/plain;charset=utf-8"});

    let link = document.createElement("a");
    let url = URL.createObjectURL(blob);

    link.href = url;
    link.download = "settings.json";
    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
})

$("#downloadCSV").on("click", function() {
    DrawTable(tableData, false, "saveTable");
    download_table_as_csv('saveTable');
});

$("#downloadPDF").on("click", function() {
    DrawTable(tableData, false, "saveTable");

    let printWindow = window.open('', '');
    printWindow.document.write('<html lang="en-US"><head><title>Roster PDF</title><style>' +
        'table, th, td {\n' +
        '    width: fit-content;\n' +
        '    border: 2px solid #000000;\n' +
        '}\n' +
        'td {\n' +
        '    width: fit-content;\n' +
        '    min-width: 75px;\n' +
        '    padding: 10px;\n' +
        '}' +
        '</style></head><body><table>');
    $("#saveTable").show();
    printWindow.document.write($("#saveTable").html());
    printWindow.document.write('</table></body></html>');
    printWindow.print();
    printWindow.document.close();
    $("#saveTable").hide();
})