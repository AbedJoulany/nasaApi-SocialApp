
var validator = (function () {
    // the module has a number of parameters that can be set and
    // that are used by the validation functions
    let errorMessages = [] // list of error messages building up as we validate
    let maxLength = 32 // max length of string length validation
    let minLength = 3 // min length of string length validation
    let wordDelimiters = " " // separators for the string tokenizer

    /**
     * initializes the module with some parameters
     * @param max the max length of a string
     * @param forbidden the list of forbidden words
     */
    const init = function (max = 24) {
        maxLength = max
    }

    /** checks if str is not null/emtpy/undefined
     * @param {string} str - the field to validate
     * @returns {boolean}
     */
    function isNotEmptyString(str)
    {
        if (str === null || str === undefined || str.trim() === "") {
            errorMessages.push("The input is empty.");
            return false;
        }
        return true;
    }

    /**
     * checks if str lenght is < maxLength
     * @param str - the field to validate
     * @returns {boolean}
     */
    const checkMaxLength = (str) => {
        if (str.length > maxLength) {
            errorMessages.push(`Input is too long. It must be at most ${maxLength} characters.`);
            return false;
        }
        return true;
    }
    /**
     * checks if str lenght is < maxLength
     * @param str - the field to validate
     * @returns {boolean}
     */
    const checkMinLength = (str) => {
        if (str.length < minLength) {
            errorMessages.push(`Input is too long. It must be at least ${minLength} characters.`);
            return false;
        }
        return true;
    }

    /**
     * checks if str contains a single word, using wordDelimiters
     * @param str - the field to validate
     * @returns {boolean} - true if the string contains a single word
     */
    const checkOneWord = (str) => {
        if (str.split(new RegExp("[" + wordDelimiters + "]")).length > 1) {
            errorMessages.push(`Input '${str}' must contain a single word. Separators are '${wordDelimiters}'.`);
            return false;
        }
        return true;
    }

    /**
     * checks if str contains only letters and digits
     * @param str - the field to validate
     * @returns {boolean}
     */
    const lettersAndDigitsOnly = (str) => {
        if (!str.match(/^[a-zA-Z0-9]+$/)) {
            errorMessages.push(`Input '${str}' must contain only letters and digits.`);
            return false;
        }
        return true;
    }

    /**
     * checks if str contains only letters and digits
     * @param str - the field to validate
     * @returns {boolean}
     */
    const lettersOnly = (str) => {
        if (!str.match(/^[a-zA-Z]+$/)) {
            errorMessages.push(`Input '${str}' must contain only letters.`);
            return false;
        }
        return true;
    }
    /**
     * validate if the input is in email format
     * @param str the inserted email
     * @returns {boolean} true if its email format
     */
    const validateEmail = (str) => {
        if (!(/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/).test(str)) {
            errorMessages.push("Email address is not Valid.");
            return false;
        }
        return true;
    }
    /**
     * validate that passwords are identical
     * @param pass1 password
     * @param pass2 password repeat
     * @returns {boolean} true if identical
     */
    const validatePasswords = (pass1, pass2) =>{
        if(pass1 !== pass2)
        {
            errorMessages.push("passwords are not identical.");
            return false;
        }
        return true;
    }

    /**
     * checks if str is in date format
     * @param str the date to validate
     * @returns {boolean} true if its a year
     */
    const validateYearFormat = (str) => {
        if(isNaN(Date.parse(str)))
        {
            errorMessages.push(`Date '${str}' must be in YYYY-MM-DD format`);
            return false;
        }
        return true;
    }
    /**
     * checks if date is not after today's date
     * @param str the date to validate
     * @returns {boolean} true if its in range
     */
    const validateYearRange = (str) =>{
        const date = new Date(str)
        const today = new Date();
        if(date > Date.now())
        {
            errorMessages.push(`Date must be in <= '${today.getFullYear()}-${today.getMonth()+1}-${today.getDate()}'`);
            return false;
        }
        return true;
    }

    /**
     * checks multiple conditions (AND clause) on str using a list of functions
     * that take str as a parameter and return a boolean
     * @param str - the field to validate
     * @param listOfValidationFunctions - array of functions that take str as a parameter and return a boolean
     * @returns {boolean} returns true if all conditions are met else false as soon as one condition is not met
     */
    const validateMultiple = (str, ...listOfValidationFunctions) => {
        for (const validationFunction of listOfValidationFunctions)
            if (!validationFunction(str))
                return false;
        return true;
    }

    /**
     * function to convert errors into html element
     * @returns {string}
     */
    function convertErrorsToHtml() {
        let res = errorMessages.length > 0 ? "Please correct the following mistake(s):<ol>" : "<ol>";
        for (let error of errorMessages)
            res += `<li>${error}</li>`;
        res += "</ol>";
        return res;
    }

    return {
        init,
        errorMessages: () => errorMessages,
        emptyErrorMessages: () => errorMessages = [],
        convertErrorsToHtml,

        // validation functions
        isNotEmptyString,
        checkMaxLength,
        checkMinLength,
        checkOneWord,
        lettersOnly,
        lettersAndDigitsOnly,
        validateYearFormat,
        validateYearRange,
        validateEmail,
        validatePasswords,
        validateMultiple,

        // module parameters
        setMaxLength: (length) => maxLength = length,
        setMinLength: (length) => minLength = length,
        getMaxLength: () => maxLength,
        getMinLength: () => minLength,
        setDelimiters: (del) => wordDelimiters = del,
        getDelimiters: () => wordDelimiters,
    }
})();