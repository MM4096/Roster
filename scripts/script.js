let times = [];
let people = [];
let roles = [];
let tableData = [];

function MakeTableData() {
    let tableData = [];
    for (let i = 0; i < times.length; i++) {
        let row = [];
        for (let j = 0; j < people.length; j++) {
            row.push(`<input type='checkbox' id='${i}-${j}'></input>`);
        }
        tableData.push(row);
    }
    return tableData;
}

function GetBusyPeople() {
    let data = [];
    for (let i = 0; i < times.length; i++) {
        let row = [];
        for (let j = 0; j < people.length; j++) {
            row.push($(`#${i}-${j}`).prop("checked"));
        }
        data.push(row);
    }
    return data;
}

function DrawTable(tableData, useInputs = false, id = "table", createID = true) {
    let table = "<table>";
    table += "<tr><th></th>";
    for (let i = 0; i < people.length; i++) {
        table += `<th>${people[i]}</th>`;
    }
    for (let i = 0; i < tableData.length; i++) {
        table += "<tr>";
        table += `<td>${ConvertToTime(times[i])}</td>`;
        for (let j = 0; j < tableData[i].length; j++) {
            if (useInputs) {
                table += `<td id="${i},${j}"><input value=" ${tableData[i][j]}"></td>`;
            }
            else if (!createID) {
                table += `<td>${tableData[i][j]}</td>`;
            }
            else {
                table += `<td id="${i},${j}">${tableData[i][j]}</td>`;
            }
        }
        table += "</tr>";
    }
    table += "</table>";
    $(`#${id}`).html(table);
}

function ConvertToTime(minutes) {
    let hours = Math.floor(minutes / 60);
    let mins = minutes % 60;

    if (mins < 10) {
        mins = "0" + mins;
    }

    return hours + ":" + mins;
}

function ResetAllCheckboxes() {
    let result = confirm("Are you sure you want to reset all checkboxes?");
    if (!result) { return; }
    for (let i = 0; i < times.length; i++) {
        for (let j = 0; j < people.length; j++) {
            $(`#${i}-${j}`).prop("checked", false);
        }
    }
}

function RemovePerson(index) {
    people.splice(index, 1);
    UpdatePeopleList();
}

function RemoveRole(index) {
    roles.splice(index, 1);
    UpdateRolesList();
}

function UpdateRolesList() {
    $("#roleList").html("");
    for (let i = 0; i < roles.length; i++) {
        $("#roleList").append(`<li>${roles[i].role}, Role ${(roles[i].mandatory ? "is mandatory" : "is optional")}, People allocated: ${roles[i].minPeople}-${roles[i].maxPeople} <button onclick='RemoveRole(${i})'>Remove</button></li>`);
    }
    if (roles.length === 0) {
        $("#generate").attr("disabled", "disabled");
        $("#roleList").append("<li>Add a role to begin</li>");
    }
    else {
        $("#generate").removeAttr("disabled");
    }
}

function GetMandatoryRoles() {
    let mandatoryRoles = [];
    roles.forEach(role => {
        if (role.mandatory) {
            mandatoryRoles.push(role);
        }
    });
    return mandatoryRoles;
}

function GetOptionalRoles() {
    let optionalRoles = [];
    roles.forEach(role => {
        if (!role.mandatory) {
            optionalRoles.push(role);
        }
    });
    return optionalRoles;
}


function UpdatePeopleList() {
    $("#personList").html("");
    for (let i = 0; i < people.length; i++) {
        $("#personList").append(`<li>${people[i]} <button onclick='RemovePerson(${i})'>Remove</button></li>`);
    }
    if ((new Set(people)).size !== people.length) {
        $("#peopleError").show();
        $("#updatedPeople").attr("disabled", "disabled");
    }
    else if (people.length === 0) {
        $("#peopleError").hide();
        $("#updatedPeople").attr("disabled", "disabled");
        $("#personList").append("<li>Add a person to begin</li>");
    }
    else {
        $("#peopleError").hide();
        $("#updatedPeople").removeAttr("disabled");
    }
}

function SaveSettings() {
    let settings = {
        startTime: $("#startTime").val(),
        endTime: $("#endTime").val(),
        shiftDuration: $("#shiftTime").val(),
        people: people,
        roles: roles,
    };

    return JSON.stringify(settings);
}


$(function() {
    $("#peopleError").hide();
})

$("#loadSettingsFile").on("input", function() {
    let file = $("#loadSettingsFile")[0].files[0];
    if (file === undefined) { console.log("returned"); return; }
    let reader = new FileReader();
    console.log(reader)
    reader.addEventListener("load", (event) => {
        $("#settings").val(event.target.result.toString());
    });
    reader.readAsText(file);
});

$("#loadSettings").on("click", function() {

    try {
        // TODO: Load settings functions
        let settings = JSON.parse($("#settings").val());

        $("#startTime").val(settings.startTime);
        $("#endTime").val(settings.endTime);
        $("#shiftTime").val(settings.shiftDuration);
        people = settings.people;

        let rolesUnparsed = settings.roles;
        roles = [];
        console.log(typeof rolesUnparsed[0].minPeople)
        rolesUnparsed.forEach(role => {
            roles.push({
                role: role.role,
                mandatory: role.mandatory,
                minPeople: parseInt(role.minPeople),
                maxPeople: parseInt(role.maxPeople),
                toBeAllocated: parseInt(role.maxPeople),
            });
        });
    }
    catch (err) {
        alert(`Invalid settings loaded!\nPlease check your settings and try again.\n\nError: ${err}`);
        return;
    }

    UpdatePeopleList();
    UpdateRolesList();

    $("#loadData").hide();
    $("#firstPage").show();
});

$("#clearSettings").on("click", function() {
    if ($("#settings").val() === "") { return;}
    let result = confirm("Are you sure you want to clear all settings?");
    if (!result) { return; }
    $("#settings").val("");
});

$("#toFirstPage").on("click", function() {
    $("#loadData").hide();
    $("#firstPage").show();
});

$("#people").on("keyup", function(event) {
    if (event.key === "Enter") {
        $("#addPerson").click();
    }
});

$("#updateTimes").on("click", function() {
    let startTime = $("#startTime").val().split(":");
    let endTime = $("#endTime").val().split(":");
    let interval = $("#shiftTime").val();

    startTime = parseInt(startTime[0]) * 60 + parseInt(startTime[1]);
    endTime = parseInt(endTime[0]) * 60 + parseInt(endTime[1]);
    interval = parseInt(interval);

    times = [];
    for (let i = startTime; i <= endTime; i += interval) {
        times.push(i);
    }

    $("#secondPage").show();
    $("#firstPage").hide();
});

$("#addPerson").on("click", function() {
    let name = $("#people").val();
    if (name === "") { return; }

    people.push(name);
    UpdatePeopleList();
});

$("#updatedPeople").on("click", function() {
    $("#thirdPage").show();
    $("#secondPage").hide();
    $("#table").show();
    DrawTable(MakeTableData());
});

$("#roles").on("click", function() {
    $("#fourthPage").show();
    $("#thirdPage").hide();
    $("#table").hide();
});

$("#addRole").on("click", function() {
    let role = $("#role").val();
    let mandatory = $("#type").prop("checked");
    let minPeople = parseInt($("#minPeople").val());
    let maxPeople = parseInt($("#maxPeople").val());

    if (role === "" || isNaN(minPeople) || isNaN(maxPeople) || maxPeople < minPeople) { alert("A role could not be created!\n\nAre you missing a name?\nAre Minimum and Maximum people numbers?\nIs Maximum people equal or greater than Minimum people?"); return; }

    $("#role").val("");
    $("#peopleForRole").val("");

    let roleObj = {
        role: role,
        mandatory: mandatory,
        minPeople: minPeople,
        maxPeople: maxPeople,
        toBeAllocated: maxPeople,
    };

    roles.push(roleObj);
    UpdateRolesList();
});

$("#generate").on("click", function() {
    // region generation


    // initialize tableData
    times.forEach((time, index) => {
        let row = [];
        people.forEach((person, personIndex) => {
            row.push("");
        });
        tableData.push(row);
    })

    let data = GetBusyPeople();
    let notLunched = people.slice();

    times.forEach((time, index) => {
        // every time slot
        let peopleAvailable = [];
        people.forEach((person, personIndex) => {
            if (!data[index][personIndex]) {
                peopleAvailable.push(person);
            }
            else {
                tableData[index][personIndex] = $("#busyInput").val();
            }
        });

        let lunchPeriod = 660 < times[index] && times[index] < 840;
        let notLunched = [];
        // search for lunch
        peopleAvailable.forEach((person) => {
            let personIndex = people.indexOf(person);
            let lunched = false;
            for (let i = 0; i < tableData.length; i++) {
                if (tableData[i][personIndex] === "Lunch") {
                    lunched = true;
                }
            }
            if (!lunched) {
                notLunched.push(person);
            }
        })

        let mandatoryRoles = GetMandatoryRoles();
        if (lunchPeriod) {
            mandatoryRoles.push({role: "Lunch"});
        }
        // cycle through mandatory roles
        while (mandatoryRoles.length > 0 && peopleAvailable.length > 0) {
            let role = mandatoryRoles.shift();
            let weights = [];

            peopleAvailable.forEach(person => {
                let weight = 10;
                let personIndex = people.indexOf(person);
                let personRoles = [];
                // get all roles of this person
                for (let i = 0; i < tableData.length; i++) {
                    personRoles.push(tableData[i][personIndex]);
                }

                // decrease weight if person has already done role
                if (personRoles.includes(role.role)) {
                    weight -= 3;
                }
                // decrease weight if person has already done role in the last block
                if (index > 0 && tableData[index - 1][personIndex] === role.role) {
                    weight -= 5;
                }
                if (lunchPeriod && notLunched.includes(person)) {
                    weight -= 2;
                }

                weights.push(weight);
            })

            let totalWeight = weights.reduce((a, b) => a + b, 0);
            let random = Math.floor(Math.random() * totalWeight);
            let personIndex = 0;
            let currentWeight = 0;
            for (let i = 0; i < weights.length; i++) {
                currentWeight += weights[i];
                if (currentWeight > random) {
                    personIndex = i;
                    break;
                }
            }

            let person = peopleAvailable[personIndex];
            peopleAvailable.splice(personIndex, 1);
            tableData[index][people.indexOf(person)] = role.role;
            role.toBeAllocated--;
            if (role.toBeAllocated > 0) mandatoryRoles.push(role);
        }

        if (peopleAvailable.length > 0 && lunchPeriod) {
            let availableAndNotLunched = peopleAvailable.filter(person => notLunched.includes(person));
            availableAndNotLunched.forEach(person => {
                tableData[index][people.indexOf(person)] = "Lunch";
            })
        }

        let optionalRoles = GetOptionalRoles();
        // cycle through optional roles
        while (optionalRoles.length > 0 && peopleAvailable.length > 0) {
            let role = optionalRoles.shift();
            // select random person
            let personIndex = Math.floor(Math.random() * peopleAvailable.length);
            let person = peopleAvailable[personIndex];
            // remove person from list
            peopleAvailable.splice(personIndex, 1);
            // add to role
            tableData[index][people.indexOf(person)] = role.role;
            // tableData.
            role.toBeAllocated--;
            if (role.toBeAllocated > 0) optionalRoles.push(role);
        }



    });

    // endregion

    DrawTable(tableData, true);
    $("#fourthPage").hide();
    $("#fifthPage").show();
    $("#table").show();
    $("#settingsPopup").show();

    $("#currentSettings").val(SaveSettings());
});

$("#saveSettings").on("click", function() {
    navigator.clipboard.writeText(SaveSettings()).then(function() {
        $("#saveSettings").text("Copied!")
    });
});

$("#closeSettings").on("click", function() {
    $("#settingsPopup").hide();
});