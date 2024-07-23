function get_table_as_csv(table_id, separator = ',') {
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
    return csv.join('\n');
}

function download_table_as_csv(table_id, separator = ',') {
    let csv_string = get_table_as_csv(table_id, separator);
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

function copy_table_to_clipboard(table_id) {
    navigator.clipboard.writeText(get_table_as_csv(table_id, '\t'));
}

function GetNewTableData() {
    let localTableData = [];
    let table = document.getElementById("table");
    // for (let i = 0; i < tableData.length; i++) {
    //     let row = [];
    //     for (let j = 0; j < tableData[i].length; j++) {
    //         row.push($(`#${i},${j}`).children().eq(0).val());
    //     }
    //     localTableData.push(row);
    // }

    for (let row of table.rows) {
        let localRow = [];
        for (let cell of row.cells) {
            let jCell = $(cell);
            let content = jCell.children().eq(0).val();
            if (content !== undefined) { localRow.push(content); }
        }
        localTableData.push(localRow);
    }

    localTableData.splice(0, 1);
    return localTableData;
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
    DrawTable(GetNewTableData(), false, "saveTable", false);
    download_table_as_csv('saveTable');
});

$("#downloadPDF").on("click", function() {
    DrawTable(GetNewTableData(), false, "saveTable", false);

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

$("#copyTable").on("click", function() {
    DrawTable(GetNewTableData(), false, "saveTable", false);
    copy_table_to_clipboard('saveTable');
})