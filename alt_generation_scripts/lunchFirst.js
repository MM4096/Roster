//SCRIPT_HEADER LunchFirst
//SCRIPT_INFO This script places people on lunch breaks first, then fills in the rest of the schedule

const WORST_LUNCH_START = 660;
const LUNCH_START = 720;
const LUNCH_END = 840;

function GenerateRoster() {
    // initialize tableData
    times.forEach((time, index) => {
        let row = [];
        people.forEach((person, personIndex) => {
            row.push("");
        });
        tableData.push(row);
    })

    let minCompulsoryPeople = 0;
    let maxCompulsoryPeople = 0;
    GetMandatoryRoles().forEach((role) => {
        minCompulsoryPeople += role.minPeople;
        maxCompulsoryPeople += role.maxPeople;
    });

    // region lunch
    let lunchedPeople = [];
    // loop over all times, and grab lunch times
    times.forEach((time, index) => {
        if (LUNCH_START <= time && time <= LUNCH_END) {
            // is lunch

            let peopleAvailable = [];
            people.forEach((person, personIndex) => {
                if (tableData[index][personIndex] === "") {
                    peopleAvailable.push(person);
                }
            });

            let compulsoryPeopleRemaining = GetRandomInt(minCompulsoryPeople, maxCompulsoryPeople);
            // remove people who have already lunched
            peopleAvailable = peopleAvailable.filter((person) => {
                if (lunchedPeople.includes(person)) {
                    compulsoryPeopleRemaining--;
                    return false;
                }
                return true;
            });

            // remove people until mandatory people are reached
            peopleAvailable = ShuffleArray(peopleAvailable);
            while (compulsoryPeopleRemaining > 0) {
                let person = peopleAvailable.shift();
                if (person === undefined) {
                    break;
                }
                compulsoryPeopleRemaining--;
            }

            peopleAvailable.forEach((person, personIndex) => {
                lunchedPeople.push(person);
                tableData[index][people.indexOf(person)] = "Lunch";
            });
        }
    });

    // endregion

    // region fill in the rest

    let roles = GetMandatoryRoles();
    AssignRoles(roles);
    roles = GetOptionalRoles();
    AssignRoles(roles);

    // endregion
}

function AssignRoles(roles) {
    let current_roles = roles.slice()
    times.forEach((time, index) => {
        current_roles = roles.slice()
        let completedMinimumRoles = []
        let previousRow = index > 0 ? tableData[index - 1] : tableData[index];
        // cycle through mandatory roles
        while (current_roles.length > 0) {

            let peopleAvailable = [];
            people.forEach((person, personIndex) => {
                if (tableData[index][personIndex] === "") {
                    peopleAvailable.push(person);
                }
            });

            let thisRole = current_roles.shift();
            if (thisRole.count === undefined) {
                thisRole.count = 0;
            }
            thisRole.count++;
            let peopleWhoHaventDoneThisRole = [];
            peopleAvailable.forEach((person) => {
                if (previousRow[people.indexOf(person)] !== thisRole.role) {
                    console.log(`Adding ${person} to peopleWhoHaventDoneThisRole`);
                    peopleWhoHaventDoneThisRole.push(person);
                } else {
                    console.log(`Skipping ${person} because they've already done this role in a previous time slot`);
                }
            })

            // prioritize people who haven't done anything last block
            let peopleWhoHaventDoneAnything = [];
            peopleAvailable.forEach((person) => {
                if (previousRow[people.indexOf(person)] === "") {
                    peopleWhoHaventDoneAnything.push(person);
                }
            });
            if (peopleWhoHaventDoneAnything.length > 0) {
                console.log(`peopleWhoHaventDoneAnything: ${peopleWhoHaventDoneAnything}`);
                peopleWhoHaventDoneThisRole = peopleWhoHaventDoneAnything;
            }

            if (peopleWhoHaventDoneThisRole.length === 0) {
                // no one left who hasn't done this role, so add everyone
                console.log(`No one left who hasn't done this role, so adding everyone`);
                peopleWhoHaventDoneThisRole = peopleAvailable;
            }
            // select a person
            peopleWhoHaventDoneThisRole = ShuffleArray(peopleWhoHaventDoneThisRole);
            console.log(`peopleWhoHaventDoneThisRole: ${peopleWhoHaventDoneThisRole}`);
            let person = peopleWhoHaventDoneThisRole.shift();
            if (person === undefined) {
                break;
            }
            tableData[index][people.indexOf(person)] = thisRole.role;
            console.log(`Assigned ${person} to ${thisRole.role}`);
            if (thisRole.count < thisRole.minPeople) {
                console.log(`Adding {thisRole.role: ${thisRole.role}, thisRole.count: ${thisRole.count}} back to mandatoryRoles`);
                current_roles.push(thisRole);
            } else if (thisRole.count < thisRole.maxPeople) {
                console.log(`Adding {thisRole.role: ${thisRole.role}, thisRole.count: ${thisRole.count}} back to mandatoryCompletedMinimumRoles`);
                completedMinimumRoles.push(thisRole);
            } else {
                console.log(`Resetting count for ${thisRole.role} (and removing from mandatoryRoles)`);
                thisRole.count = 0;
            }

            if (current_roles.length === 0) {
                console.log(`mandatoryRoles is empty, adding mandatoryCompletedMinimumRoles back to mandatoryRoles`);
                current_roles = completedMinimumRoles;
                completedMinimumRoles = [];
            }
        }
    })
}