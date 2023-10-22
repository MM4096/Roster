let shiftTimes = []
let people = []

class Cell {
    constructor(row, column, value) {
        this.row = row;
        this.column = column;
        this.value = value;
    }
}

$(document).ready(function() {
    $("#update").click();
})

function clearTable() {
    $("#table").empty();
}

function addRow(data, isHeader=false, rowIndex=0) {

    let row = ""
    let tag = isHeader ? "th" : "td";

    data.forEach((element, index) => {
        row += "<" + tag + ` onclick='cellClicked(${rowIndex},${index})'>` + element + "</" + tag + ">";
    })

    $("#table").append("<tr>" + row + "</tr>");
}

function addTable(data) {
    // data should be 2D array
    let table = $("#table");
    data.forEach((row, index) => {
        addRow(row, index === 0, index);
    })
}

function drawTable() {
    clearTable();
    let data = [];
    let header = ["Time"];
    people.forEach((person) => {
        header.push(person);
    })
    header.push('<button id="addPerson">Add a person</button>')
    data.push(header);

    shiftTimes.forEach((time) => {
        let row = [time];
        people.forEach((person) => {
            row.push(" ");
        })
        data.push(row);
    })

    addTable(data);
}

$("#update").on("click", function() {
    let startTime = $("#startTime").val();
    let endTime = $("#endTime").val();
    let shiftTime = $("#shiftTime").val();

    startTime = startTime.split(":");
    startTime = [parseInt(startTime[0]), parseInt(startTime[1])];
    endTime = endTime.split(":");
    endTime = [parseInt(endTime[0]), parseInt(endTime[1])];
    shiftTime = parseInt(shiftTime);
    let currentTime = [startTime[0], startTime[1]];
    let times = [];

    times.push(currentTime.join(":"));

    while (currentTime[0] < endTime[0] || (currentTime[0] === endTime[0] && currentTime[1] < endTime[1])) {
        currentTime[1] += shiftTime;
        if (currentTime[1] >= 60) {
            currentTime[0] += 1;
            currentTime[1] -= 60;
        }
        times.push(currentTime.join(":"));
    }

    console.log(times)
    shiftTimes = times;
    drawTable();
})

$("#table").on("click", "#addPerson", function() {
    let name = prompt("Enter a name");
    people.push(name);
    drawTable();
})

function cellClicked(rowIndex, colIndex) {
    if (rowIndex === 0 && colIndex !== 0 && colIndex !== people.length + 1) {
        let name = prompt("Enter a name\nLeave blank to remove person");
        if (name === "") {
            people.splice(colIndex - 1, 1);
            drawTable();
            return;
        }
        people[colIndex - 1] = name;
        drawTable();
    }
    else if (rowIndex > 0 && colIndex > 0) {
        // TODO: needs fixing
        let data = prompt("Enter data\nLeave blank to remove data");
        $("#table").eq(rowIndex).eq(colIndex).text(data);
    }
}