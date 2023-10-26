let shiftTimes = []
let people = []
let roles = []

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
            row += "<" + tag + ` onclick='cellClicked(${rowIndex},${index})' id='${rowIndex},${index}'>` + element + "</" + tag + ">";
        }
        else {
            row += "<" + tag + ` onclick='cellClicked(${rowIndex},${index})' id='${rowIndex},${index}' ${extra}>` + element + "</" + tag + ">";
        }
    })

    $("#table").append("<tr>" + row + "</tr>");
}

function addTable(data, addHeaderAndTime=false) {
    clearTable();
    if (addHeaderAndTime) {
        let header = ["Time"];
        people.forEach((person) => {
            header.push(person);
        })
        data.unshift(header);
        addRow(header, true)
        console.log(data)
        data.forEach((row, index) => {
            if (index !== 0) {
                let formattedTime = formatTime(shiftTimes[index - 1].split(":")) + " - " + formatTime(shiftTimes[index].split(":"));
                row.unshift(formattedTime);
                addRow(row, false, index - 1);
            }
        })
        return;
    }

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

$("#roleList").on("click", ".removeRole", function() {
    let index = $(this).parent().index();
    roles.splice(index, 1);
    UpdateRolesList();
    if (roles.length === 0) {
        $("#roleList").append("<li>Add a role to get started</li>")
        $("#generate").attr("disabled", true);
    }
})

$("#addRole").on("click", function() {
    let role = $("#role").val();
    let roleType = $("#type").find(":selected").attr("value");
    let roleIsMandatory = roleType === "mandatory";
    let minPeople = parseInt($("#minPeople").val());
    let maxPeople = parseInt($("#maxPeople").val());

    let array = [role, roleIsMandatory, minPeople, maxPeople];

    roles.push(array);
    UpdateRolesList();
    $("#generate").removeAttr("disabled");
})


$("#generate").on("click", function() {
    // generate 2D array
    // let data = [];
    //
    // for (let i = 0; i < shiftTimes.length - 1; i++) {
    //     let row = [];
    //     for (let j = 0; j < people.length; j++) {
    //         row.push(" ");
    //     }
    //     data.push(row);
    // }
    //
    // console.log(data)

    let tableData = [];
    $("#table tr").each(function() {
        let rowData = [];
        $(this).find("td").each(function() {
            rowData.push($(this).text());
        });
        tableData.push(rowData);
    });

    // Remove the first row (header)
    tableData.shift();

    // Remove the first column from each row
    for (let i = 0; i < tableData.length; i++) {
        tableData[i].shift();
    }

    // get required roles
    let requiredRoles = [];
    let optionalRoles = [];
    roles.forEach((role) => {
        if (role[1]) {
            requiredRoles.push(role);
        }
        else {
            optionalRoles.push(role);
        }
    })

    let notGoneToLunch = people.slice();

    // assign roles according to requirements
    tableData.forEach((row, index) => {
        let canAssign = people.slice();
        let notAssigned = [];
        let tempRequiredRoles = requiredRoles.slice();
        let tempOptionalRoles = optionalRoles.slice();

        for (let column = 0; column < row.length; column++) {
            let task = row[column];
            console.log(task)
            if (task !== " ") {
                let personDoingTask = people[column];
                canAssign.splice(canAssign.indexOf(personDoingTask), 1);
            }
        }
        notAssigned = canAssign.slice();

        console.log(notAssigned)

        tempRequiredRoles.forEach((role) => {
            let min = role[2];
            let max = role[3];
            let peopleAssigned = 0;
            let peopleToAssign = Math.floor(Math.random() * (max - min + 1) + min);

            while (peopleAssigned < peopleToAssign) {
                if (notAssigned.length === 0) {
                    break;
                }

                let personIndex = Math.floor(Math.random() * notAssigned.length);
                let person = notAssigned[personIndex];

                if (tableData[index][people.indexOf(person)] !== role[0]) {
                    notAssigned.splice(personIndex, 1);
                    tableData[index][people.indexOf(person)] = role[0];
                    peopleAssigned++;
                }
            }
        })

        for (let column = 0; column < row.length; column++) {
            let task = row[column];
            console.log(task)
            if (task !== " ") {
                let personDoingTask = people[column];
                canAssign.splice(canAssign.indexOf(personDoingTask), 1);
            }
        }

        let hour = parseInt(shiftTimes[index].split(":")[0]);

        if (11 < hour < 4) {
            notAssigned.forEach((person) => {
                if (notGoneToLunch.includes(person)) {
                    tableData[index][people.indexOf(person)] = "Lunch";
                    notGoneToLunch.splice(notGoneToLunch.indexOf(person), 1);
                }
            })
        }

        tempOptionalRoles.forEach((role) => {
            let min = role[2];
            let max = role[3];
            let peopleAssigned = 0;
            let peopleToAssign = Math.floor(Math.random() * (max - min + 1) + min);

            while (peopleAssigned < peopleToAssign) {
                if (notAssigned.length === 0) {
                    break;
                }

                let personIndex = Math.floor(Math.random() * notAssigned.length);
                let person = notAssigned[personIndex];

                if (tableData[index][people.indexOf(person)] !== role[0]) {
                    notAssigned.splice(personIndex, 1);
                    tableData[index][people.indexOf(person)] = role[0];
                    peopleAssigned++;
                }
            }
        })

    })

    clearTable()
    addTable(tableData, true);
    $("#fourthPage").hide();
    $("#fifthPage").show();
    $("#table").show()
})

$("#finish").on("click", function() {
    $("#fifthPage").hide();
    $("#firstPage").show();
    $("#table").hide();
    $("#startTime").val("");
    $("#endTime").val("");
    $("#shiftTime").val("");
    $("#people").val("");
    $("#role").val("");
    $("#minPeople").val("");
    $("#maxPeople").val("");
    $("#personList").empty();
    $("#roleList").empty();
    $("#generate").attr("disabled", true);
    $("#updatedPeople").attr("disabled", true);
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