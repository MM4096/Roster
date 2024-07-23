function GenerateRoster() {
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
        let worthIt = true;
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

            let worthIt = true;
            let totalWeight = weights.reduce((a, b) => a + b, 0);
            let random = Math.floor(Math.random() * totalWeight);
            let average = totalWeight / weights.length;
            if (average < 5) {
                worthIt = false
            }
            else {
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
            }
            if (role.toBeAllocated > 0 && worthIt) mandatoryRoles.push(role);
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
}