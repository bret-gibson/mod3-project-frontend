const audio = document.getElementById("current-game-song")
audio.volume = 0.0


document.addEventListener("DOMContentLoaded", () => {
    // renderAudio()
    audio.addEventListener("play", fetchChoices)
})


// function renderAudio (){
//     const audio = document.getElementById("current-game-song")
//     audio.volume = 0.5
// }

function fetchChoices(){
    //get fetch call to game songs, where gamesong = false
    //create buttons for each
    //do this X amount of times for X choices

    fetch("http://localhost:3000/songs")
    .then(response => response.json())
    .then(songs => {
        const songArray = songs["data"]
        const dummySongs = songArray.filter(song => song.attributes.dummy === true) //array of only dummy songs
        let choices = []
        let pick = dummySongs[Math.floor((Math.random() * dummySongs.length))]
        choices.push(pick)
        while (choices.length <= 3){
           let newPick = dummySongs[Math.floor((Math.random() * dummySongs.length))]
            choices.forEach(element => {
                if (element !== newPick){
                    choices.push(newPick)
                }
            })
        }
        choices.pop()
        choiceButtons(choices)
    })

 }

function choiceButtons(choices){
    choices.forEach((choice) => {
        let button = document.createElement("button")
        button.innerText = `${choice.attributes.title} - ${choice.attributes.artist}`
        
        const choiceContainer = document.querySelector("#choice-container")
        choiceContainer.append(button)
    })
}