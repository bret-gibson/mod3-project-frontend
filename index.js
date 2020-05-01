document.addEventListener("DOMContentLoaded", () => {
    fetchGameSong()
    // const audio = document.getElementById("current-game-song")
    
})

function fetchGameSong(){
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
    const audioPlayer = document.createElement("audio")
    const audioContainer = document.getElementById("audio-container")
    audioPlayer.id = "current-game-song"
    audioPlayer.controls = "controls"
    const songUrl = songChoice.attributes.song.source 
    audioPlayer.src = songUrl   //gamesong
    audioPlayer.type="audio/mp3"
    audioPlayer.volume = 0.0
    audioPlayer.addEventListener("play", () => fetchChoices(songChoice), { once: true})
    audioContainer.append(audioPlayer)

}

function fetchChoices(songChoice){
    //get fetch call to game songs, where gamesong = false
    //create buttons for each
    //do this X amount of times for X choices

    fetch("http://localhost:3000/songs")
    .then(response => response.json())
    .then(songs => {
        const songArray = songs["data"]
        const dummySongs = songArray.filter(song => song.attributes.dummy === true).sort(() => Math.random() - 0.5); //array of only dummy songs

        let choices = []

        for (let i = 0; choices.length < 3; i++){
            choices.push(dummySongs[i].attributes)
        }
        choices.push(songChoice.attributes.song)
        renderChoices(choices)
    }) 
}

function renderChoices(choices){
    //buttons for the wrong answers
    // shuffle buttons to make order random
    choices.sort(() => Math.random() - 0.5);
    const choiceContainer = document.querySelector("#choice-container")
    choices.forEach((choice) => {
        let button = document.createElement("button")
        button.innerText = `${choice.title} - ${choice.artist}`
        
        choiceContainer.append(button)
    })
    const mainContainer = document.querySelector("#main-container")
    mainContainer.append(choiceContainer)

    //button for the right answer
}