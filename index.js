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
const header = document.querySelector("div")
const tooltip = document.querySelector("span")
// const userId = header.id

document.addEventListener("DOMContentLoaded", () => {
    column1.style.display = "none"
    column3.style.display = "none"
    signIn()
    // playGame()
})

function signIn(){
    // localStorage.clear()
    const signInForm = document.createElement("form")
    signInForm.id = "sign-in"
    const usernameInput = document.createElement("input")
    usernameInput.setAttribute("type", "text")
    usernameInput.id = "username"
    usernameInput.placeholder = "Username"
    const submitButton = document.createElement("input")
    submitButton.setAttribute("type", "submit")
    submitButton.value = "Log In"
    const formHeader = document.createElement("p");
    formHeader.innerText =
      'Please enter the username "bret" or "mary" to sign in';
    signInForm.append(formHeader, usernameInput, submitButton)
    mainContainer.append(signInForm)
    // const username = usernameInput.value
    signInForm.addEventListener("submit", () => {
        // localStorage["userId"]
        column1.style.display = "block"
        column3.style.display = "block"
        fetchUser(event, usernameInput.value)

    })
}

function fetchUser(event, username){
    event.preventDefault()

    const header = document.querySelector('div')
    header.innerHTML = 
    "<h1 style='text-align:center;'>Song Guesser</h1> <h3 style='text-align:center;'>How well do you know top songs from the last three decades?</h3><br><h4>Rules:</h4><p>Once you hit start, songs will play automatically and a selection of choices will display below the timer. You have 10 seconds to get the answer right or you lose! +100 points for an answer within 5 seconds, +50 points otherwise. Play until you get a wrong answer!</p><br>"

    fetch("http://localhost:3000/users/")
    .then(response => response.json())
    .then(usersArray => {
        usersArray["data"].forEach((arrayItem) => {
            if (username === arrayItem["attributes"]["username"]){
                // let userId = 
                // localStorage.setItem("userId", `${arrayItem["id"]}`)
                header.id = arrayItem["id"]
                // localStorage["userId"] = (arrayItem["id"])
                // localStorage["userId"] = userId
            }
        }
        )
        displayHighScores()
        displayUserHighScores()
        playGame()
    })
    // displayHighScores()
    // displayUserHighScores()
    // playGame()
}

function displayHighScores(){
    const column1 = document.getElementById("column1")
    column1.innerHTML = ""
    column1.innerHTML = "<b>All High Scores</b>"
    const hiScoreList = document.createElement("ul")
    hiScoreList.id = "high-scores-list"
    column1.append(hiScoreList)

    fetch("http://localhost:3000/game_sessions/top_scores")
    .then(response => response.json())
    .then(hiScoreArray => {
        // debugger
            hiScoreArray["data"].forEach(game => {
                let hiScoreItem = document.createElement("li")
                hiScoreItem.id = "high-scores-item"
                hiScoreItem.innerText = `${game["attributes"]["user"]["username"]} - ${game["attributes"]["points"]}`
                hiScoreList.append(hiScoreItem)
            })})
}

function displayUserHighScores(){
    // let userId = localStorage["userId"]
    // let userId = localStorage.getItem("userId")
    const column3 = document.getElementById("column3")
    column3.innerHTML = ""    
    column3.style.display = "show"
    column3.innerHTML = "<b>Your High Scores</b>"
    const userScoreList = document.createElement("ul")
    userScoreList.innerHTML = ""
    userScoreList.id = "user-scores-list"
    
    column3.append(userScoreList)
    
    fetch(`http://localhost:3000/users/${header.id}`)
    .then(response => response.json())
    .then(userData => {
    
        let games = userData["data"]["attributes"]["game_sessions"]
        let pointsArray = games.map(game => game.points)
        let sortedPoints = pointsArray.sort(function(a, b){return b-a})
        let slicedPoints = sortedPoints.slice(0,5)
        localStorage.setItem("userHiScores", JSON.stringify(slicedPoints))
        
        slicedPoints.forEach(points => {
            let userScoreItem = document.createElement("li")
            userScoreItem.id = "high-scores-item"
            userScoreItem.innerText = points
            userScoreList.append(userScoreItem)
        })
    })

    const statsButton = document.createElement("button")
    statsButton.innerText = "My Stats"
    statsButton.id = 'stats-button'
    statsButton.classList = "btn btn-primary btn-large text-center"
    statsButton.setAttribute("data-toggle", "modal")
    statsButton.setAttribute("data-target", "#userModal")
    column3.append(statsButton)
    displayUserStats()
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
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            user_id: header.id
        })
    })
    .then(response => response.json())
    .then(data => {
        tooltip.id = `${data["data"]["id"]}`
        // localStorage.setItem("sessionId", `${data["data"]["id"]}`)
        // localStorage["sessionId"] = data["data"]["id"]
    })
        // .then(response => response.text())
        // .then(data => console.log(data))
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

    // let sessionId = localStorage["sessionId"]
    // let songId = localStorage.songId

    // let sessionId = localStorage.getItem("sessionId")
    let songId = localStorage.getItem("songId")

    let gameSongObj = {
        game_session_id: tooltip.id,
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
    timer.textContent = "10"
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
        isHiScore()
        isUserHiScore()

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
}

function startTimer(duration){
    let timeLeft = duration
    let timer = document.getElementById('timer')

    timerId = setInterval(countdown, 1000)
    
    function countdown() {
        if (timeLeft < 0) {
            patchPoints()
            isHiScore()
            isUserHiScore()

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
            timer.textContent = timeLeft
            timeLeft--
        }
    }
}

function patchPoints(){
    //whenever a user loses or time runs out,
    //fetch patch to update the points for that game session
    // let sessionId = localStorage.getItem("sessionId")
    let sessionObj = {
        points: score
    }
    fetch(`http://localhost:3000/game_sessions/${tooltip.id}`, {
        method: 'PATCH',
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
                },
        body: JSON.stringify(sessionObj)
    })
}

function isHiScore(){
    fetch("http://localhost:3000/game_sessions/top_scores")
    .then(response => response.json())
    .then(sessions => {
        let lowestHiScore = sessions["data"][4]["attributes"]["points"]
        let result = lowestHiScore < score
        if (result === true){
            displayHighScores()
        }
        
    })
}

function isUserHiScore(){
    // let userId = localStorage.getItem("userId")
    let userHiScoresArray = JSON.parse(localStorage.getItem("userHiScores"))
    // let isCurrentAHiScore = userHiScoresArray.some(element => {
    //     return element < score
    // })
    // if (isCurrentAHiScore){
    //     displayUserHighScores()
    // }

    let isCurrentAHiScore = userHiScoresArray[4]

    let userScoreResult = isCurrentAHiScore < score
    if (userScoreResult === true){
        displayUserHighScores()
    }
    
    // fetch(`http://localhost:3000/users/${userId}`)
    // .then(response => response.json())
    // .then(data => {
    //     debugger
    //     let userGameSessionsArray = data["data"]["attributes"]["game_sessions"]

    // })
}

function displayUserStats(){
    // let userId = localStorage.getItem("userId")

  //   points = data["data"][0]["attributes"]['points']

    let totalPoints = 0
    let totalGames = 0
    let username
    // let songCategories = []
    fetch('http://localhost:3000/game_sessions')
    .then(response => response.json())
    .then(data => {
        let songCategories = []
        data["data"].forEach(session => {
            if (session["attributes"]["user"]["id"] === parseInt(header.id)){
                username = session["attributes"]["user"]["username"]
                session["attributes"]["songs"].forEach(song => {
                    songCategories.push(song["genre"])
                })
                totalGames += 1
                totalPoints += parseInt(session["attributes"]["points"])
            }

        })
        let countObj = {}
        let countFunc = keys => {
            countObj[keys] = ++countObj[keys] || 1;
        }
          
        songCategories.forEach(countFunc)

        const statsHeader = document.getElementById("name-header")
        statsHeader.innerText = `Stats for ${username}`

        const globalGamesPlayed = document.getElementById("user-games-played")
        globalGamesPlayed.innerText = `Number of Games Played: ${totalGames}`

        const globalPoints = document.getElementById("user-global-points")
        globalPoints.innerText = `Total Points Scored: ${totalPoints}`

        const categoriesUl = document.getElementById("categories")
        for (const key in countObj) {
            let categoryItem = document.createElement("li")
            categoryItem.innerText = `${key}: ${countObj[key]}`
            categoriesUl.append(categoryItem)
        }
    })
}