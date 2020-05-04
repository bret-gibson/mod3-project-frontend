let countdown
let timerId
let score = 0

document.addEventListener("DOMContentLoaded", () => {
    fetchGameSong()
})

function fetchGameSong(){
    const audioContainer = document.getElementById("audio-container")
    audioContainer.innerHTML = ""
    const choiceContainer = document.querySelector("#choice-container")
    choiceContainer.innerHTML = ""
    fetch("http://localhost:3000/game_songs")
    .then(response => response.json())
    .then(gameSongData => {
        const gameSongArray = gameSongData["data"]
        const songChoice = gameSongArray[Math.floor(Math.random() * gameSongArray.length)]
        const songUrl = songChoice.attributes.song.source
        renderAudio(songChoice)
    })
}

function renderAudio(songChoice){
    const timer = document.querySelector("#timer")
    timer.textContent = "10 seconds remaining"
    const audioPlayer = document.createElement("audio")
    const audioContainer = document.getElementById("audio-container")
    audioPlayer.id = "current-game-song"
    audioPlayer.controls = "controls"
    const songUrl = songChoice.attributes.song.source 
    audioPlayer.src = songUrl   //gamesong
    audioPlayer.type="audio/mp3"
    audioPlayer.volume = 0.1
    audioPlayer.addEventListener("play", () => fetchChoices(songChoice), { once: true})
    audioContainer.append(audioPlayer)
}

function fetchChoices(songChoice){
    //get fetch call to game songs, where gamesong = false
    //create buttons for each
    //do this X amount of times for X choices
    startTimer(9)

    fetch("http://localhost:3000/songs")
    .then(response => response.json())
    .then(songs => {
        // Maybe fix so that we arent querying ALL songs every time...
        // want to query for JUST the songs marked as dummy (may need to change API)
        const songArray = songs["data"]
        const dummySongs = songArray.filter(song => song.attributes.dummy === true).sort(() => Math.random() - 0.5); //array of only dummy songs

        let choices = []

        for (let i = 0; choices.length < 3; i++){
            choices.push(dummySongs[i])
        }
        choices.push(songChoice.attributes.song)
        renderChoices(choices, songChoice)
    }) 
}

function renderChoices(choices, songChoice){
    // buttons for the wrong answers
    // shuffle buttons to make order random
    let new_choices = choices.sort(() => Math.random() - 0.5);
    const choiceContainer = document.querySelector("#choice-container")
    new_choices.forEach((choice) => {
        let button = document.createElement("button")
        
        if (choice["attributes"]){
            button.innerText = `${choice["attributes"]["title"]} - ${choice["attributes"]["artist"]}`
        }
        else {
            button.innerText = `${choice["title"]} - ${choice["artist"]}`
        }

        button.id = choice.id
        button.addEventListener("click", () => handleChoice(choices, songChoice))
        choiceContainer.append(button)
    })
    const mainContainer = document.querySelector("#main-container")
    mainContainer.append(choiceContainer)
}

function handleChoice(choices, songChoice) {
    console.log(choices, songChoice)
    // debugger
    if (event.target.id === songChoice.id){
        alert("YOU GOT IT RIGHT")
        clearInterval(timerId)
        let points = document.getElementById('points')
        score += 100
        points.innerText = `${score} Points`
        fetchGameSong()
    } else {
        alert("WRONG! GAME OVER!")
        clearInterval(timerId)
        //remove event listener so you can't keep playing
        //or remove buttons.. 
    }
    //if choice = gameSong, then give point
    //if not, then no point
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
        alert("Out of time.. you lose.")
      } else {
        timer.textContent = timeLeft + ' seconds remaining'
        timeLeft--
      }
    }
}