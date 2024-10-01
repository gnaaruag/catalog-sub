const fs = require('fs');

// decodes to base 10
function toDecimal(value, base) {
    return parseInt(value, base);
}

// interpolate points 
function lagrangeInterpolation(xValues, yValues, x) {
    let total = 0;
    for (let i = 0; i < xValues.length; i++) {
        let xi = xValues[i];
        let yi = yValues[i];
        let term = yi;
        for (let j = 0; j < xValues.length; j++) {
            if (i !== j) {
                term = term * (x - xValues[j]) / (xi - xValues[j]);
            }
        }
        total += term;
    }
    return total;
}

// secret compute wrapper
function findSecret(xValues, yValues, k) {
    let xSubset = xValues.slice(0, k);
    let ySubset = yValues.slice(0, k);
    return lagrangeInterpolation(xSubset, ySubset, 0); // Evaluate at x = 0 for the constant term
}

// file parse
function processJson(jsonInput) {
    let xValues = [];
    let yValues = [];

    for (let key in jsonInput) {
        if (key !== 'keys') {
            let base = parseInt(jsonInput[key].base);
            let value = jsonInput[key].value;
            xValues.push(parseInt(key));
            yValues.push(toDecimal(value, base));
        }
    }

    let k = jsonInput.keys.k;
    let secret = findSecret(xValues, yValues, k);

    return secret ;
}

// wrong points
function findWrongPoints(jsonInput) {
    let xValues = [];
    let yValues = [];
	const fin = []

    for (let key in jsonInput) {
        if (key !== 'keys') {
            let base = parseInt(jsonInput[key].base);
            let value = jsonInput[key].value;
            xValues.push(Number(key)); // Convert key to number
            yValues.push(toDecimal(value, base));
        }
    }

    let k = jsonInput.keys.k;
    let xSubset = xValues.slice(0, k);
    let ySubset = yValues.slice(0, k);

    // Define the polynomial using the first k points
    let polynomial = (x) => lagrangeInterpolation(xSubset, ySubset, x);

    let wrong = null;
    const tolerance = 1e-6; // room for error in float

    for (let i = 0; i < xValues.length; i++) {
        let actualY = yValues[i];
        let expectedY = polynomial(xValues[i]);

        if (Math.abs(parseInt(actualY) - parseInt(expectedY)) > tolerance) {
            wrong = {
                x: xValues[i],
                actualY: actualY,
                expectedY: expectedY
            };
			fin.push(wrong)
        } else {
            // console.log(`Point (x=${xValues[i]}, expected=${expectedY}, actual=${actualY}) is correct.`);
        }
    }

    return fin;
}


// driver to run cases
fs.readFile('test1.json', 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading the file:', err);
        return;
    }

    try {
        const jsonDocument = JSON.parse(data);
        const secret  = processJson(jsonDocument);
        console.log("The secret is:", secret);
    } catch (parseError) {
        console.error('Error parsing JSON:', parseError);
    }
});


fs.readFile('test2.json', 'utf8', (err, data) => {
	console.log("test2")
    if (err) {
        console.error('Error reading the file:', err);
        return;
    }

    try {
        const jsonDocument = JSON.parse(data);
        const secret  = processJson(jsonDocument);
        const imp = findWrongPoints(jsonDocument);
		if (!imp) {
			console.log("no wrong points")
		}
		else {
			console.log("the wrong points are:", imp);
		}
        console.log("The secret is:", secret);
    } catch (parseError) {
        console.error('Error parsing JSON:', parseError);
    }
});
