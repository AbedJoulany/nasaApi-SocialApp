// api key
const APIKEY= 'sa7cxhbtWoZ2MXGEW5fbfpqCovgKJCGX1vqlg46p';
// user name
var name = '';

(function() {
    // initiating the validator
    validator.init(24);
    validator.setDelimiters(" ,.;:!?-");

    /** performs the validation of the form
     * @param name an object containing the values of the form fields
     * @returns {boolean} true if the form is valid, false otherwise
     */
    const validateName = (name) => {
        validator.setMaxLength(24);
        let c = validator.validateMultiple(name,
            validator.isNotEmptyString,
            validator.checkOneWord,
            validator.lettersAndDigitsOnly,
            validator.checkMaxLength)
        return c;
    }
    /**
     * validating the date
     * @param date an str that contains value from field
     * @returns {boolean} true if date field is valid
     */
    const validateDate = (date) => {
        validator.setMaxLength(12);
        let c1 = validator.validateMultiple(date,
            validator.isNotEmptyString,
            validator.checkMaxLength,
            validator.validateYearFormat,
            validator.validateYearRange
            )
        return c1;
    }

    /** generates HTML code for displaying the validation errors
     * @param listOfErrors an array of strings containing the error messages
     * @returns {string|string|*} the HTML code to display the errors
     */
    const convertErrorsToHtml = (listOfErrors) => {
        let res = listOfErrors.length > 0 ? "Please correct the following mistake(s):<ol>" : "<ol>";
        for (let error of listOfErrors)
            res += `<li>${error}</li>`;
        res += "</ol>";
        return res;
    }


    /**
     * upon loading the page, we bind handlers to the form and the button
     */
    document.addEventListener("DOMContentLoaded", () => {

        document.getElementById("dateForm").addEventListener("submit", (event) => {
            event.preventDefault();
            validator.emptyErrorMessages()
            const date = document.getElementById('inputDate').value;
            if(validateDate(date))
            {
                document.getElementById('card-container').innerHTML = ''
                document.getElementById("errorMessages").innerHTML = ''
                apiController.resetScroll();
                apiController.createGrid(date)
            }
            else
                // if the product is not valid, we display the errors:
                document.getElementById("errorMessages").innerHTML = convertErrorsToHtml(validator.errorMessages());

        });

        const day = new Date();
        document.getElementById("date").innerHTML = `today's date is: `+ apiController.getDateFormat(day);
        window.addEventListener("scroll", apiController.handleInfiniteScroll);
        setInterval(apiController.updateComments,15000);

    });
}());

/**
 * function to show or hide elements
 * @param element the element to hide or show
 * @param display none or block
 */
function showOrHide(element, display)
{
    element.style.display = display
}
