/* fetch = Function used for making HTTP requests to fetch resources. 
        (JSON style data, iages, files)
        - Simplifies asynchronous data fetching in JS and 
          used for interacting with APIs to retrieve and send
          data asynchronously over the web.
        - fetch(url, {options})
            - fetch(url, {method:"GET"}) // default is GET thus do not need to explicity state.

*/


//EX1: fetching Gengar's name
// fetch("https://pokeapi.co/api/v2/pokemon/gengar")
//     .then(response => response.json())
//     .then(data => console.log(data.name))
//     .catch(error => console.error(error));

//EX2 : fetching Gengar's name only if resource was found
// fetch("https://pokeapi.co/api/v2/pokemon/gengar")
//     .then(response => {
//         //check if response's ok status is true (resource is found)
//         if(!response.ok)
//             throw new Error("Could not fetch resourse");

//         return response.json();
//     })
//     .then(data => console.log(data.name))
//     .catch(error => console.error(error))


//EX3: fetching resources using ASYNC and AWAIT
async function fetchData(){
    try{

        //get user input
        const pokemonName = document.getElementById("searchBar").value.toLowerCase();
    
        //try to fetch user input from pokemon api
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`);

        //error handling if resource not found
        if (!response.ok){
            throw new Error("Could not fetch resource");
        }

        //convert response into desired format
        const data = await response.json();

        // *** DISPLAY NAME ***
        displayPKM_NAME(data);


        // *** DISPLAY SPRITE ***
        displayPKM_SPRITE(data);


        // *** DISPLAY STATS ***
        
        // *** PKM TYPE ***
        displayPKM_TYPE(data);

        // *** EVOLUTION CHAIN ***
        displayEvolutionChain(data);
    }
    catch(error){
        alert("Please check pokemon spelling or is this even a pokemon?")
        console.error(error);
    }
}

//function that return the data resource of a pokemon
async function fetchPkmData(name)
{
    try 
    {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
        if(!response.ok)
            throw new Error("fetchPKM(): Could not fetch resource!");
        const data = await response.json();
        return data;
    }
    catch(error)
    {
        console.error(error);
    }
}

//Display a pokemon's type
function displayPKM_TYPE (data) 
{
    const pkmTypeEl = document.getElementById("pkmType");
    //clear previous types
    pkmTypeEl.textContent = "";

    //list the types
    for (let i=0; i<data.types.length; i++)
    {
        pkmTypeEl.textContent += cap1stLetter(data.types[i].type.name);
        pkmTypeEl.style.display = "inline-block";

        //Handle correct commas
        if (i<data.types.length-1)
            pkmTypeEl.textContent += ', '; 
    }
}

//Display a pokemon's name
function displayPKM_NAME(data)
{
    const h2El = document.getElementById("pokemonName");
    h2El.textContent = data.species.name.toUpperCase();
    h2El.style.display = "block";
}

//Display a pokemon's sprite front & back side
function displayPKM_SPRITE(data)
{
    //get the sprite data
    let pokemonSprite = data.sprites.front_default;     

    //sprite front side
    let imgElement = document.getElementById("pokemonSpriteFront");
    imgElement.src = pokemonSprite;
    imgElement.style.display = "inline-block";
    
    //sprite back side
    pokemonSprite = data.sprites.back_default;
    imgElement = document.getElementById("pokemonSpriteBack");
    imgElement.src = pokemonSprite;
    imgElement.style.display = "inline-block";
}

//function that display the evolution chain
async function displayEvolutionChain(data)
{
    const sprites = [];

    //wait for helper function to recursively collect the evolution sprites
    await getEvolutionChain(data.species.url, sprites);

    const pkmEvolutionEl = document.getElementById("pkmEvolution");
    
    //clear previous data
    pkmEvolutionEl.innerText = "";

    //display all the sprites
    for(let i=0; i<sprites.length-1; i++)
        pkmEvolutionEl.appendChild(sprites[i]);
    
}

//helper function to displayEvolutionChain that recursively collect all the evolution sprites in reverse order
async function getEvolutionChain(url, sprites)
{
    try
    {
        const response = await fetch(url);
        if(!response.ok)
            throw new Error("getEvolutionChain(): Could not find resource!");

        const data = await response.json();

        //depth first search
        if(data.evolves_from_species != null)
            await getEvolutionChain(data.evolves_from_species.url, sprites);

        //base case
        const imgEl = document.createElement('img');
        const basicPkmData = await fetchPkmData(data.id);
        imgEl.src = basicPkmData.sprites.front_default;
        sprites.push(imgEl);
    }
    catch(error)
    {
        console.error(error);
    }
}

//Capitialize first letter of a string
function cap1stLetter(str)
{
    return str.charAt(0).toUpperCase() + str.slice(1);
}

window.onload = function (){
    // const fetchBtnEl = document.getElementById("fetchBtn");
    // fetchBtnEl.addEventListener("click", fetchData);

    const searchBarEl = document.getElementById("searchBar");
    searchBarEl.addEventListener("keydown", function(e) {
        if (e.key === "Enter") {
            e.preventDefault();
            fetchData();
        }
    });
    searchBarEl.addEventListener("click", function(e) {
        searchBarEl.value="";
    });

}