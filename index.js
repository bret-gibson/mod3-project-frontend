let username = ""
let countdown
let timerId
let score = 0
const mainContainer = document.querySelector("#main-container")
const audioContainer = document.querySelector("#audio-container")
const choiceContainer = document.querySelector("#choice-container")
const gameHeader = document.querySelector("#game-header")
const choiceList = document.querySelector("#choices")
const points = document.getElementById('points')

document.addEventListener("DOMContentLoaded", () => {
    signIn()
    // playGame()
})

function signIn(){
    const signInForm = document.createElement("form")
    signInForm.id = "sign-in"
    const usernameInput = document.createElement("input")
    usernameInput.setAttribute("type", "text")
    usernameInput.id = "username"
    usernameInput.placeholder = "Sign In"
    const submitButton = document.createElement("input")
    submitButton.setAttribute("type", "submit")
    signInForm.append(usernameInput, submitButton)
    mainContainer.append(signInForm)
    // const username = usernameInput.value
    signInForm.addEventListener("submit", () => {fetchUser(event, usernameInput.value)})
}

function fetchUser(event, username){
    event.preventDefault()
    console.log(username)
    

    fetch("http://localhost:3000/users/")
    .then(response => response.json())
    .then(usersArray => {
        usersArray["data"].forEach((arrayItem) => {
            if (username === arrayItem["attributes"]["username"]){
                let userId = (arrayItem["id"])
                localStorage["userid"] = userId
            }
        }
        )
    })
    playGame()
}

function playGame(){
    const siginInForm = document.querySelector("#sign-in")
    siginInForm.innerHTML = ""
    const playGameButton = document.createElement("button")
    playGameButton.id = "start-button"
    playGameButton.innerText = "Start Game"
    // const playGameButton = document.createElement("img")                  
    // playGameButton.id = "start-button"
    // playGameButton.src = "http://clipart-library.com/images/di9rakrnT.jpg"

    mainContainer.append(playGameButton)

    playGameButton.addEventListener("click", () => {
        playGameButton.remove()
        createGameSession()
        fetchSong()
    })

}

function createGameSession(){
    
    fetch('http://localhost:3000/game_sessions', {
        method: 'POST',
        headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            user_id: localStorage["userid"]
        })
        })
    // .then(response => response.json())
    // .then(session => {
    //     debugger
    //     localStorage.setItem("sessionId", session.data.id)
    // })
    // fetchSong()
}

function fetchSong(){
    audioContainer.innerHTML = ""
    fetch("http://localhost:3000/songs/answer_songs")
    .then(response => response.json())
    .then(songData => {
        const songArray = songData["data"]
        const sortedSongs = songArray.sort(() => Math.random() - 0.5);
        const songChoice = sortedSongs[Math.floor(Math.random() * sortedSongs.length)]
        const songUrl = songChoice.attributes.source
        localStorage.setItem("songId", songChoice.id)

        createGameSong(songChoice)
        renderAudio(songChoice)
    })
}

// function getGameSession(){
//     // debugger -- doesn't hit this at all..
//     fetch("http://localhost:3000/game_sessions/last")
//     .then(response => response.json())
//     .then(session => {
//         localStorage.setItem("sessionId", session.data.id)
//     })
// }

function createGameSong(songChoice){
    fetch("http://localhost:3000/game_sessions/last")
    .then(response => response.json())
    .then(session => {
        localStorage.setItem("sessionId", session.data.id)
    })

    let sessionId = localStorage.sessionId
    let songId = localStorage.songId
    
    let gameSongObj = {
        game_session_id: sessionId,
        song_id: songId,
        correct_guess: false
    }
    
    fetch('http://localhost:3000/game_songs', {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
                },
        body: JSON.stringify(gameSongObj)
    })

}

// function patchGameSession(songChoice){
//     // attributes: {
//     //     songs: []
//     //     }
//     // }
//     let songObject = {
//             id: songChoice.id,
//             title: songChoice.title,
//             artist: songChoice.artist,
//             genre: songChoice.genre,
//             source: songChoice.source,
//             dummy: songChoice.dummy,
//             created_at: songChoice.created_at,
//             updated_at: songChoice.updated_at
//     }
//     //finding a workaround for now with /last
//     fetch("http://localhost:3000/game_sessions/last", {
//         method: 'PATCH',
//         headers: {
//         'Accept': 'application/json',
//         'Content-Type': 'application/json'
//         },
//         body: JSON.stringify()
//     })
// }

function renderAudio(songChoice){
    const timer = document.querySelector("#timer")
    timer.textContent = "10 seconds remaining"
    const audioPlayer = document.createElement("audio")
    audioPlayer.id = "current-game-song"
    // audioPlayer.controls = "controls"
    const songUrl = songChoice.attributes.source 
    audioPlayer.src = songUrl 
    audioPlayer.type="audio/mp3"
    audioPlayer.volume = 0.1
    audioPlayer.autoplay = true
    audioContainer.append(audioPlayer)

    let input = document.createElement("input")
    input.textContent = "Volume"
    input.setAttribute("id", "ex1")
    input.setAttribute("data-slider-id", "ex1Slider")
    input.setAttribute("type", "text")
    input.setAttribute("data-slider-min", "0")
    input.setAttribute("data-slider-max", "1")
    input.setAttribute("data-slider-step", "0.1")
    audioContainer.append(input)
    let slider = new Slider('#ex1', {
        value: 0.1,
        precision: 1
    });
    slider.on("change", () => {
        audioPlayer.volume = slider.getValue()
    })

    if (score === 0){
        points.innerText = "0 Points"
    } else {
        points.innerText = `${score} Points`
    }
 
    
    // audioPlayer.addEventListener("play", () => fetchChoices(songChoice), { once: true})
    fetchChoices(songChoice)
    // let start = document.createElement("button")
    // start.classList = "btn btn-primary btn-large"
    // start.textContent = "Start"
    // start.addEventListener("click", (event) => startAudio(audioPlayer)) //start))
    // audioContainer.append(start)
}

function fetchChoices(songChoice){

    //get fetch call to game songs, where gamesong = false
    //create buttons for each
    //do this X amount of times for X choices
    // choiceList.innerHTML = ""

    let message = document.getElementById("correct-message")
    if (score > 0 && message) {
        message.remove()
    }

    startTimer(9)

    fetch("http://localhost:3000/songs/dummy_songs")
    .then(response => response.json())
    .then(songs => {
        // Maybe fix so that we arent querying ALL songs every time...
        // want to query for JUST the songs marked as dummy (may need to change API)
        const songArray = songs["data"]
        const dummySongs = songArray.sort(() => Math.random() - 0.5); 
        let choices = []

        for (let i = 0; choices.length < 3; i++){
            choices.push(dummySongs[i])
        }
        choices.push(songChoice)
        
        renderChoices(choices, songChoice)
    }) 
}

function renderChoices(choices, songChoice){
    // buttons for the wrong answers
    // shuffle buttons to make order random
    choiceList.innerHTML = ""

    let new_choices = choices.sort(() => Math.random() - 0.5);
    new_choices.forEach((choice) => {
        let choiceItem = document.createElement("li")
        choiceItem.textContent =""
        let button = document.createElement("button")
        
        if (choice["attributes"]){
            button.innerText = `${choice["attributes"]["title"]} - ${choice["attributes"]["artist"]}`
        }
        else {
            button.innerText = `${choice["title"]} - ${choice["artist"]}`
        }        
        button.type = "button"
        button.id = choice.id
        button.classList = "btn btn-primary btn-large btn-block"
        button.addEventListener("click", () => handleChoice(choices, songChoice))
        choiceItem.append(button)
        choiceList.append(choiceItem)
    })
    mainContainer.append(choiceContainer)
}

function handleChoice(choices, songChoice) {
    let timeLeft = parseInt(document.getElementById("timer").innerText)

    if (event.target.id === songChoice.id){
        // $("#myModal").modal();
        // let sessionId = localStorage.sessionId
        // let songId = localStorage.songId

        // let gameSongObj = {
        //     correct_guess: true
        // }
        
        // fetch('http://localhost:3000/game_songs/last', {
        //     method: 'PATCH',
        //     headers: {
        //         "Content-Type": "application/json",
        //         "Accept": "application/json"
        //     },
        //     body: JSON.stringify(gameSongObj)
                
        // })
        if (timeLeft >= 5){
            score += 100
        } else {
            score += 50
        }

        points.innerText = `${score} Points`
        event.target.style = "background-color:green"
        let correctMessageDiv = document.createElement("div")
        correctMessageDiv.id = "correct-message"
        correctMessageDiv.innerText = "Correct! Keep Going!"
        gameHeader.append(correctMessageDiv)
        let list = document.querySelector("#choices")
        let items = list.childNodes
        items.forEach(li => {
            let listNodes = li.childNodes
            listNodes[0].setAttribute("disabled", "true")
        })

        clearInterval(timerId)
        fetchSong()
    } else {
        patchPoints()
        event.target.style = "background-color:#c90000; border-color: #c90000"
        const audio = document.querySelector("audio")
        audio.pause()
        audioContainer.innerHTML = ""

        let incorrectMessageDiv = document.createElement("div")

        incorrectMessageDiv.id = "incorrect-message"
        incorrectMessageDiv.innerText = "Incorrect! Game Over!"
        gameHeader.append(incorrectMessageDiv)

        let list = document.querySelector("#choices")
        let items = list.childNodes
        items.forEach(li => {
            let listNodes = li.childNodes
            listNodes[0].setAttribute("disabled", "true")
        })

        let tryAgainButton = document.createElement("button")
        tryAgainButton.innerText = "Try Again?"
        tryAgainButton.classList = "btn btn-large btn-primary"
        tryAgainButton.addEventListener("click", () => {
            score = 0
            incorrectMessageDiv.remove()
            tryAgainButton.remove()
            choiceList.innerHTML = ""
            createGameSession()
            fetchSong()
        })
        let brTag = document.createElement("br")
        let brTag2 = document.createElement("br")
        incorrectMessageDiv.append(brTag, tryAgainButton, brTag2)
        
        let correctChoice = document.getElementById(songChoice.id)
        correctChoice.style = "background-color:green"
        
        clearInterval(timerId)
    }
    // const blah = document.getElementById("choices")
    // let buttons = blah.childNodes
    // buttons.forEach(button => {
    //     let att = createAttribute("disabled")
    //     att.value = "true"
    //     button.setAttribute(att)
    // })
}

function startTimer(duration){
    let timeLeft = duration
    let timer = document.getElementById('timer')

    timerId = setInterval(countdown, 1000)
    
    function countdown() {
        if (timeLeft < 0) {
            patchPoints()
            clearTimeout(timerId)
            const audio = document.querySelector("audio")
            audio.pause()
            choiceList.innerHTML = ""
            audioContainer.innerHTML = ""
            let outOfTime = document.createElement("div")
            outOfTime.id = "out-of-time"
            outOfTime.innerText = "Out of time! Game over!"
            let tryAgainButton = document.createElement("button")
            tryAgainButton.innerText = "Try Again?"
            tryAgainButton.classList = "btn btn-large btn-primary"
            tryAgainButton.addEventListener("click", () => {
                outOfTime.remove()
                tryAgainButton.remove()
                createGameSession()
                fetchSong()
            })
            outOfTime.append(tryAgainButton)
            choiceContainer.append(outOfTime)
        } else {
            timer.textContent = timeLeft + ' seconds remaining'
            timeLeft--
        }
    }
}

function patchPoints(){
    //whenever a user loses or time runs out,
    //fetch patch to update the points for that game session
    let sessionId = localStorage.sessionId
    let sessionObj = {
        points: score
    }
    fetch(`http://localhost:3000/game_sessions/${sessionId}`, {
        method: 'PATCH',
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
                },
        body: JSON.stringify(sessionObj)
    })
}