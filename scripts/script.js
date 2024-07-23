let times = [];
let people = [];
let roles = [];
let tableData = [];
const CUSTOM_GENERATION_INFO = [
    {
        "name": "default",
        "displayName": "Original (Default)",
        "scriptPath": "scripts/roster.js",
        "description": "This script generates from the top-down. It doesn't assign tasks to already busy people. However, it may give very late lunches. To remedy this, try the [Lunch First] script.",
    },
    {
        "name": "lunchFirst",
        "displayName": "Lunch First",
        "scriptPath": "alt_generation_scripts/lunchFirst.js",
        "description": "Based on: [default]\nThis script assigns lunch blocks first, then goes from top to bottom.\nThis fixes the problem with [default], of occasionally not assigning lunches.\nPriorities:\n\t1. Lunches\n\t2. Compulsory roles\n\t3. Optional roles\n\t4. Free time",
    }
];

$(document).ready(function() {
    UpdateGenerationScripts();
})

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
            let this_value = tableData[i][j] === "" ? " " : tableData[i][j];
            if (useInputs) {
                table += `<td id="${i},${j}"><input value="${this_value}"></td>`;
            }
            else if (!createID) {
                table += `<td>${this_value}</td>`;
            }
            else {
                table += `<td id="${i},${j}">${this_value}</td>`;
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

$("#loadSettings").on("click", function () {

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
    } catch (err) {
        alert(`Invalid settings loaded!\nPlease check your settings and try again.\n\nError: ${err}`);
        return;
    }

    let result = LoadGenerationScript();

    if (!result) {
        return;
    }

    UpdatePeopleList();
    UpdateRolesList();

    $("#loadData").hide();
    $("#firstPage").show();
});

function LoadGenerationScript() {
    let info = GetCurrentlySelectedGenerationScript();
    if (info === undefined) {
        alert("No generation script selected!");
        return false;
    }
    console.log("Loading generation script...");
    const scriptElement = document.createElement('script');
    scriptElement.type = 'text/javascript';
    scriptElement.src = info.scriptPath;
    $("body").append(scriptElement);
    return true;
}

$("#instantGeneration").on("click", function () {
    $("#loadSettings").click()
    $("#updateTimes").click();
    $("#updatedPeople").click();
    $("#roles").click();
    $("#generate").click();
})

$("#clearSettings").on("click", function() {
    if ($("#settings").val() === "") { return;}
    let result = confirm("Are you sure you want to clear all settings?");
    if (!result) { return; }
    $("#settings").val("");
});

$("#toFirstPage").on("click", function() {
    if (!LoadGenerationScript()) {
        return;
    }
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
    console.groupCollapsed("Roster Generation")
    GenerateRoster();
    console.groupEnd();

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

$("#regenerate").on("click", function() {
    tableData = []
    console.groupCollapsed("Roster Regeneration")
    GenerateRoster();
    console.groupEnd();

    $("#table").html("<>");
    DrawTable(tableData, true);
    $("#settingsPopup").show();
});

$("#chooseGenerationScript").change(function () {
    let info = GetCurrentlySelectedGenerationScript()
    let textarea = $("#scriptSelectionInformation");
    if (info === undefined) {
        textarea.val("No script selected");
        return;
    }
    textarea.val(info.description);
})

function UpdateGenerationScripts() {
    let select = $("#chooseGenerationScript");
    select.html("");
    CUSTOM_GENERATION_INFO.forEach(script => {
        select.append(`<option value="${script.name}">${script.displayName}</option>`);
    });
    select.children("option").first().attr("selected", "selected");
    select.change();
}

function GetCurrentlySelectedGenerationScript() {
    return GetGenerationScriptInfo($("#chooseGenerationScript").children("option").filter(":selected").attr("value"));
}

function GetGenerationScriptInfo(script) {
    return CUSTOM_GENERATION_INFO.find(x => x.name === script);
}

// region Global functions

/**
 * Returns a random integer between min (inclusive) and max (inclusive)
 */
function GetRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Shuffles an array
 */
function ShuffleArray(array) {
    let _currentIndex = array.length;

    // While there remain elements to shuffle...
    while (_currentIndex !== 0) {

        // Pick a remaining element...
        let randomIndex = Math.floor(Math.random() * _currentIndex);
        _currentIndex--;

        // And swap it with the current element.
        [array[_currentIndex], array[randomIndex]] = [
            array[randomIndex], array[_currentIndex]];
    }
    return array;
}

// endregion