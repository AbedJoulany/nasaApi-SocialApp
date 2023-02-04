var apiController = (function(){

    let name = document.getElementById('fname').innerText +
        ' '+document.getElementById('lname').innerText
    let cardLimit = 0
    const cardIncrease = 3;
    let pageCount = 0;
    let currentPage = 1;
    let data;
    var throttleTimer;
    var images = []

    /**
     * function to reset the infinite scroll
     */
    const resetScroll = ()=>{
        cardLimit = 0;
        pageCount = 0;
        currentPage = 1;
        images = []
        window.addEventListener("scroll", handleInfiniteScroll);
    }
    /**
     * function to validate the comment
     * @param comment
     * @returns {boolean}
     */
    const validateComment = (comment) => {
        validator.setMaxLength(128);
        let c = validator.validateMultiple(comment,
            validator.isNotEmptyString,
            validator.checkMaxLength,
        )
        return c;
    }

    /**
     * function to check the status of the promise response
     * @param response the response from ajax request
     * @returns {Promise<never>|Promise<unknown>}
     */
    function status(response) {
        if (response.status >= 200 && response.status < 300) {
            return Promise.resolve(response)
        } else {
            return Promise.reject(new Error(response.statusText))
        }
    }

    /**
     * function to fetch data from the nasa api
     * @param start_date wanted date for picture
     * @param end_date contains the id of the card
     */
    function fetchData(start_date, end_date){
        fetch(`https://api.nasa.gov/planetary/apod?api_key=${APIKEY}&start_date=${start_date}&end_date=${end_date}`)
            .then(status)
            .then(res => res.json())
            .then(json => {
                cardLimit = json.length;
                pageCount = Math.ceil(cardLimit / cardIncrease);
                data = JSON.parse(JSON.stringify(json));
                addCards(currentPage,json)
            })
            .catch(function(error) {
                console.log(error); // we should display the error to the user
            });
    }

    /**
     * function to add the card in the page using infinite scroll
     * @param pageIndex the row of the infinte scroll
     * @param data the card data
     */
    const addCards = (pageIndex,data) => {
        currentPage = pageIndex;
        const startRange = (pageIndex - 1) * cardIncrease;
        const endRange = currentPage === pageCount ? cardLimit : pageIndex * cardIncrease;
        for (let i = startRange+1; i <= endRange; i++) {
            let col = document.createElement('div')
            col.className = 'col'
            col.setAttribute('id',(i-1).toString())
            col.appendChild(createCard(data[data.length - i],data[data.length - i].date))
            document.getElementById('c-row').appendChild(col)
        }
    };
    /**
     * function to create the card that contains the image, picture details and allowing comments
     * @param data the returned data from nasa api
     * @param id the id of the card
     * @returns {HTMLDivElement} card element
     */
    function createCard(data,id){
        images.push(id)
        let card = document.createElement('div');
        card.className = 'card h-100';

        let img = document.createElement('img')
        img.class = 'card-img-top'
        img.src = data.url

        let cardBody = document.createElement('div');
        cardBody.className = 'card-body';

        let title = document.createElement('h5');
        title.innerText = data.title;
        title.className = 'card-title';

        let cardText = document.createElement('p');
        cardText.innerText = data.explanation;
        cardText.className = 'card-text';

        let cardFooter = document.createElement('div');
        cardFooter.className = 'card-footer';

        let dateAndCopy = document.createElement('strong');
        dateAndCopy.innerText = `copyright: ${data.copyright}\ndate: ${data.date}`;

        let form = document.createElement('div')
        form.className = 'form-floating mb-4'

        let input = document.createElement('input')
        input.className = 'form-control'
        input.setAttribute('placeholder',"Type comment...")
        input.setAttribute('id',`addANote_${id}`)

        input.addEventListener("keydown", addComment)
        let label = document.createElement('label')
        label.className = 'form-label';
        label.setAttribute('for',`addANote_${id}`)
        label.textContent = "Type comment..."


        let commentSection = document.createElement("div")
        commentSection.setAttribute('id',`commentSection-${id}`)
        commentSection.className = 'scroll'

        let commentErr = document.createElement('div')
        commentErr.setAttribute('id',`commentErr-${id}`)

        form.appendChild(input)
        form.appendChild(label)

        cardBody.appendChild(title);
        cardBody.appendChild(cardText);
        cardBody.appendChild(dateAndCopy);
        cardBody.appendChild(commentSection);

        cardFooter.appendChild(form)
        cardFooter.appendChild(commentErr)

        card.appendChild(img);
        card.appendChild(cardBody);
        card.appendChild(cardFooter)
        return card;
    }

    /**
     * function to add comment in the image card and in the server side
     * @param key the entered key while typing
     */

    function addComment(key)
    {
        if (key.code === "Enter") {

            const comment = this.value;
            const picId = this.id.split("_")[1]
            validator.emptyErrorMessages()
            if(!validateComment(comment))
            {
                document.getElementById(`commentErr-${picId}`).innerHTML = validator.errorMessages()
                return;
            }
            document.getElementById(`commentErr-${picId}`).innerHTML = ''
            this.value =''
            fetch(`/nasa/addComment`,{
                // Adding method type
                method: "POST",
                headers: {"Content-Type": "application/json"},
                // Adding body or contents to send
                body: JSON.stringify({
                    "picture": picId,
                    "commentText": comment,
                }),
            })
                .then(status)
                .then(res => res.json())
                .then(json => {
                    createComment(comment,name,json, picId)
                })
                .catch(function(error) {
                    console.log(error); // we should display the error to the user
                });
        }
    }

    /**
     * function to create the comment element to add in page
     * @param text contains the comment
     * @param userName the name of the user who wrote the comment
     * @param id the id of the comment from server side
     * @param picId the id of the image
     */
    function createComment(text, userName,id,picId)
    {
        let container = document.createElement('div')
        container.className = 'w-100'
        container.style = 'background-color: #f7f6f6; border-radius: .5rem .5rem 0 0;'
        container.setAttribute('id',`comment-${id}`)

        let element = document.createElement('div')
        element.className = 'justify-content-between align-items-center mb-3'

        let nameElement = document.createElement('h6')
        nameElement.className = 'fw-bold text-primary mb-1'
        nameElement.innerText = userName

        let comment = document.createElement('span')
        comment.className = 'text-dark ms-2'
        comment.innerText = text;

        nameElement.appendChild(comment)
        if(userName === name){
            let removeButton = document.createElement('button')
            removeButton.className = 'btn';
            removeButton.setAttribute('id',`commentButton-${id}`)
            removeButton.setAttribute('picId',`${picId}`)

            let i = document.createElement('i')
            i.className = 'fa fa-close'
            removeButton.appendChild(i)
            removeButton.addEventListener('click', removeComment);
            nameElement.appendChild(removeButton);
        }
        element.appendChild(nameElement)
        container.appendChild(element)
        document.getElementById(`commentSection-${picId}`).appendChild(container)

    }

    /**
     * function that is bonded to the remove comment button
     * the function deletes the comment from page and from server side
     */
    function removeComment(){
        let id = this.id.split("-")[1]
        let picId = this.getAttribute('picId')
        fetch(`/nasa/deleteComment/${picId}/${id}`,{
            // Adding method type
            method: "delete"})
            .then(status)
            .then(res => {
                let comment = document.getElementById(`comment-${id}`)
                comment.parentNode.removeChild(comment)
            })
            .catch(function(error) {
                console.log(error); // we should display the error to the user
            });
    }

    /**
     * function to build the grid of cards, its gets all the picture from the given date
     * till today's date
     * @param date given date by user
     */
    function createGrid(date){

        const start_date = new Date(date)
        const day = new Date();
        const cardContainer = document.getElementById("card-container")
        let row = document.createElement('div')
        row.setAttribute('id','c-row')
        row.className = "row row-cols-1 row-cols-md-3 g-4"
        fetchData(getDateFormat(start_date),getDateFormat(day))
        cardContainer.appendChild(row)
    }

    function updateComments(){
        fetch(`/nasa/getComments`,{
            // Adding method type
            method: "POST",
            headers: {"Content-Type": "application/json"},
            // Adding body or contents to send
            body: JSON.stringify({
                "images": images,
            }),
        })
            .then(status)
            .then(res => res.json())
            .then(json => {
                document.getElementById('errorMessages').innerText = ''
                for (let j = 0; j < json.length; j++){
                    document.getElementById(`commentSection-${json[j].date}`).innerHTML = ''
                    for(let i = 0 ; i < json[j].Comments.length; i++)
                        {
                            console.log(json[j])
                            createComment(json[j].Comments[i].text,json[j].Comments[i].userName,json[j].Comments[i].id,
                                json[j].date)
                    }

                }
            })
            .catch(function(error) {
                document.getElementById('errorMessages').innerText = error
                console.log(error); // we should display the error to the user
            });
    }

    /**
     * function to return the right format to request image from nasa api
     * @param date the inserted date by user
     * @returns {string} the right date format
     */
    function getDateFormat(date)
    {
        let day = date.getDate();
        let month = date.getMonth() + 1;
        let year = date.getFullYear();
        return `${year}-${month}-${day}`
    }

    /**
     * function to handle the infinite scroll
     */
    const handleInfiniteScroll = () => {
        throttle(() => {
            const endOfPage =
                (window.innerHeight + window.pageYOffset) >= document.body.offsetHeight-2;
            if (endOfPage) {
                addCards(currentPage + 1,data);
            }
            if (currentPage === pageCount) {
                removeInfiniteScroll();
            }
        }, 1000);
    };
    /**
     *
     * @param callback
     * @param time
     */
    const throttle = (callback, time) => {
        if (throttleTimer) return;
        throttleTimer = true;
        setTimeout(() => {
            callback();
            throttleTimer = false;
        }, time);
    };
    /**
     * function to remove infinite scroll listener
     */
    const removeInfiniteScroll = () => {
        window.removeEventListener("scroll", handleInfiniteScroll);
    };

    return {
        fetchData,
        createCard,
        addComment,
        createComment,
        removeComment,
        createGrid,
        updateComments,
        getDateFormat,
        handleInfiniteScroll,
        addCards,
        throttle,
        resetScroll,
    }
})();