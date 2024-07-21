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

    times.forEach((time, index) => {
        let peopleAvailable = [];
        people.forEach((person, personIndex) => {
            if (tableData[index][personIndex] === "") {
                peopleAvailable.push(person);
            }
        });

        let mandatoryRoles = GetMandatoryRoles().slice();
        let previousRow = index > 1 ? tableData[index - 1] : tableData[index];
        // cycle through mandatory roles
        while (mandatoryRoles.length > 0) {
            let thisRole = mandatoryRoles.shift();
            thisRole.count++;
            // get all people who have not done this role
            let peopleWhoHaventDoneThisRole = peopleAvailable.filter((person) => {
                return !previousRow[people.indexOf(person)] === thisRole.role;
            });
            if (peopleWhoHaventDoneThisRole.length === 0) {
                // no one left who hasn't done this role, so add everyone
                peopleWhoHaventDoneThisRole = peopleAvailable;
            }
            // select a person
            peopleWhoHaventDoneThisRole = ShuffleArray(peopleWhoHaventDoneThisRole);
            let person = peopleWhoHaventDoneThisRole.shift();
            if (person === undefined) {
                break;
            }
            tableData[index][people.indexOf(person)] = thisRole.role;
            if (thisRole.count < thisRole.maxPeople) {
                peopleAvailable.push(person);
            }
        }
    });

    // endregion
}