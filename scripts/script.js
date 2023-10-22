let shiftTimes = []
let people = []
let roles = []

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

function formatTime(time) {
    let hours = parseInt(time[0]);
    let minutes = parseInt(time[1]);
    let ampm = "AM";

    if (hours > 12) {
        ampm = "PM";
        hours -= 12;
    }

    if (hours < 10) {
        hours = "0" + hours;
    }
    if (minutes < 10) {
        minutes = "0" + minutes
    }

    return hours + ":" + minutes + " " + ampm;
}

function addRow(data, isHeader=false, rowIndex=0) {

    let row = ""
    let tag = isHeader ? "th" : "td";
    let extra = rowIndex !== 0 ? "class='hover'" : "";

    data.forEach((element, index) => {
        if (index === 0) {
            row += "<" + tag + ` onclick='cellClicked(${rowIndex},${index})'>` + element + "</" + tag + ">";
        }
        else {
            row += "<" + tag + ` onclick='cellClicked(${rowIndex},${index})' ${extra}>` + element + "</" + tag + ">";
        }
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
    data.push(header);

    shiftTimes.forEach((time, index) => {

        if (index === shiftTimes.length - 1) {
            return;
        }

        let formattedTime = formatTime(time.split(":")) + " - " + formatTime(shiftTimes[shiftTimes.indexOf(time) + 1].split(":"));

        let row = [formattedTime];
        people.forEach((person) => {
            row.push(" ");
        })
        data.push(row);
    })

    addTable(data);
}

function UpdatePeopleList() {
    $("#personList").empty();
    people.forEach((person) => {
        $("#personList").append("<li>" + person + " <button class='removePerson'>Remove</button></li>");
    });
}

function UpdateRolesList() {
    // TODO: Needs fixing
    $("#roleList").empty();
    roles.forEach((role) => {
        $("#roleList").append(`<li>Role: ${role[0]}, Manatory: ${role[1]}, People: ${role[2]}-${role[3]} <button class='removeRole'>Remove</button></li>`);
    });
}

$("#updateTimes").on("click", function() {
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
    shiftTimes = times;
    drawTable();
    $("#firstPage").hide();
    $("#secondPage").show();
})

$("#table").on("click", "#addPerson", function() {
    let name = prompt("Enter a name");
    people.push(name);
    drawTable();
})

$("#addPerson").on("click", function() {
    let name = $("#people").val();
    people.push(name);
    UpdatePeopleList();
    $("#updatedPeople").removeAttr("disabled");
})

$("#personList").on("click", ".removePerson", function() {
    let index = $(this).parent().index();
    people.splice(index, 1);
    UpdatePeopleList();
    drawTable();
    if (people.length === 0) {
        $("#updatedPeople").attr("disabled", true);
        $("#personList").append("<li>Add a person to get started</li>")
    }
})

$("#updatedPeople").on("click", function() {
    drawTable();
    $("#secondPage").hide();
    $("#thirdPage").show();
    $("#table").show();
})

$("#roles").on("click", function() {
    $("#thirdPage").hide();
    $("#fourthPage").show();
    $("#table").hide();
})

$("#addRole").on("click", function() {
    let role = $("#role").val();
    let roleType = $("#type").find(":selected").attr("value");
    let roleIsMandatory = roleType === "mandatory";
    let minPeople = parseInt($("#minPeople").val());
    let maxPeople = parseInt($("#maxPeople").val());

    roles.push({role, roleIsMandatory, minPeople, maxPeople});
    UpdateRolesList();
})

function cellClicked(rowIndex, colIndex) {
    if (rowIndex > 0 && colIndex > 0) {
        let data = prompt("Enter data\nLeave blank to remove data");

        if (data === "") {
            data = " ";
        }
        if (!data) {
            return;
        }

        let table = $("#table")[0];
        let cell = table.rows[rowIndex].cells[colIndex]; // This is a DOM "TD" element
        cell = $(cell); // Now it's a jQuery object.
        cell.text(data);
    }
}