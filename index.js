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
    playGame()
})

function playGame(){
    const playGameButton = document.createElement("button")
    playGameButton.innerText = "Start Game"
    mainContainer.append(playGameButton)

    playGameButton.addEventListener("click", () => {
        createGameSession()
        fetchSong()
        playGameButton.remove()
    })

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
        // patchGameSession(songChoice)
        renderAudio(songChoice)
    })
}

function createGameSession(songChoice){
    
    fetch('http://localhost:3000/game_sessions', {
        method: 'POST',
        headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
        },
        body: JSON.stringify({
        })
        })
    // .then(data => {
    //     console.log(data)
    //     debugger })

    // fetchSong()

}

function getGameSession(){
    fetch("http://localhost:3000/game_sessions/last")
    .then(response => response.json())
    .then(session => {
        localStorage.setItem("sessionId", session.data.id)
    })
}

function createGameSong(songChoice){
    let sessionId = localStorage.getItem("sessionId")
    let songId = localStorage.getItem("songId")
    let gameSongObj = {
        game_session_id: sessionId,
        song_id: songId,
        correct_guess: false
    }

    fetch('http://localhost:3000/game_songs', {
        method: 'POST',
        headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
        },
        body: JSON.stringify(gameSongObj)
        })


}

// function patchGameSession(songChoice){
//     // debugger
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
    audioPlayer.controls = "controls"
    const songUrl = songChoice.attributes.source 
    audioPlayer.src = songUrl   //gamesong
    audioPlayer.type="audio/mp3"
    audioPlayer.volume = 0.1
    audioPlayer.addEventListener("play", () => fetchChoices(songChoice), { once: true})
    audioContainer.append(audioPlayer)
    document.getElementById("points").innerText = "0 Points"
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
        // debugger
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

        clearInterval(timerId)
        fetchSong()
    } else {
        event.target.style = "background-color:#c90000; border-color: #c90000"
        const audio = document.querySelector("audio")
        audio.pause()
        audioContainer.innerHTML = ""

        let incorrectMessageDiv = document.createElement("div")
        incorrectMessageDiv.id = "incorrect-message"
        incorrectMessageDiv.innerText = "Incorrect! Game Over!"
        gameHeader.append(incorrectMessageDiv)

        let tryAgainButton = document.createElement("button")
        tryAgainButton.innerText = "Try Again?"
        tryAgainButton.classList = "btn btn-large btn-primary"
        tryAgainButton.addEventListener("click", () => {
            incorrectMessageDiv.remove()
            tryAgainButton.remove()
            choiceList.innerHTML = ""
            fetchSong()
        })
        incorrectMessageDiv.append(tryAgainButton)
        
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

// function startAudio(audioPlayer, start) {
//     audioPlayer.play()
//     start.textContent = "Stop music and quit"
//     start.addEventListener("click", (event) => quitGame(audioPlayer))
// }

// function quitGame(audioPlayer){
//     clearTimeout(timerId)
//     audioPlayer.pause()
//     audioContainer.innerHTML = ""
//     choiceList.innerHTML = ""
//     points.innerText = "0 Points"
//     fetchGameSong()
// }