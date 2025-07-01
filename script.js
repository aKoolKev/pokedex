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
    
    if(isFetching) return; //prevent "enter" key spam
    fetchBtnEl.disabled=true; //disable button to prevent spam

    isFetching = true; //toggle

    
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
        const typeArr = displayPKM_TYPE(data);

        // *** EVOLUTION CHAIN ***
        await displayEvolutionChain2(data);

        getStength(typeArr);

        //show field after a valid response
        document.getElementsByClassName("resultsContainer")[0].classList.remove("hidden");
    }
    catch(error){
        alert("Please check pokemon spelling or is this even a pokemon?")
        console.error(error);
    }
    finally
    {
        isFetching = false;
        fetchBtnEl.disabled = false; //re-enable button when done
    }
}

//function that return the data resource of a pokemon
async function fetchPkmData(name)
{
    try 
    {
        name = name === "wormadam" ? "wormadam-plant" : name; //wormadam is not in the "/pokemon url". The name is "wormadam-plant" for some reason...
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

//Display a pokemon's type as well as returning an array of all of it's type
function displayPKM_TYPE (data) 
{
    const typeArr = [];

    const pkmTypeEl = document.getElementById("pkmType");
    //clear previous types
    pkmTypeEl.textContent = "";

    //list the types
    for (let i=0; i<data.types.length; i++)
    {
        const type = cap1stLetter(data.types[i].type.name);
        typeArr.push(type);
        pkmTypeEl.textContent += type;
        pkmTypeEl.style.display = "inline-block";

        //Handle correct commas
        if (i<data.types.length-1)
            pkmTypeEl.textContent += ', '; 
    }
    return typeArr;
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

//function that displays all the evolution of a pokemon (updated function and in use as of 6/29/25)
async function displayEvolutionChain2(data)
{
    try
    {
        const names = [];
        const pkmEvolutionEl = document.getElementById("pkmEvolution");
        pkmEvolutionEl.replaceChildren();

        //call other function to handle collecting all evolution names
        await getEvolutionChain2(data, names);

        //display each sprite
        for (const name of names)
        {
            const pkmData = await fetchPkmData(name); 
            const imgEl = document.createElement("img");
            imgEl.src = pkmData.sprites.front_default;
            imgEl.classList = "w-xs";
            pkmEvolutionEl.appendChild(imgEl);
        }
    }
    catch (error) {console.error(error);}

}

//function that collects all the name of the evolutions of a pokemon (updated function and in use as of 6/29/25)
async function getEvolutionChain2(data, names) //data is from "pokemon/" url
{
    //grab data from "pokemon-species/ url"
    const species_resp = await fetch(data.species.url);
    if(!species_resp.ok) throw new Error("getEvolutionChain2(): Could not get pokemon-species resource!");
    const pokemon_species_data = await species_resp.json();
    
    //grab data from "evolution-chain/ url"
    const evolution_chain_resp = await fetch(pokemon_species_data.evolution_chain.url);
    if(!evolution_chain_resp.ok) throw new Error("getEvolutionChain2(): Could not get evolution-chain resource!");
    const evolution_chain_data = await evolution_chain_resp.json();

    names.push(evolution_chain_data.chain.species.name);
    let arr = evolution_chain_data.chain.evolves_to;
    getEvolutionChainHelper(arr,names);
}

//helper function to getEvolutionChain2 that collects all the evolution names (updated function and in use as of 6/29/25)
function getEvolutionChainHelper(arr,names)
{
    //base case: no next evolution stage
    if (arr.length === 0) return;

    //print out all evolutions at this stage
    for(let i=0; i<arr.length; i++)
    {
        names.push(arr[i].species.name);
        getEvolutionChainHelper(arr[i].evolves_to, names); //recursively collect each branch
    }   
}

function getWeakness(){}

function getStength(typeArr){
    const pkmStrengthEl = document.getElementById("pkmStrength");
    pkmStrengthEl.replaceChildren(); //clear old list 

    for(let i=0; i<typeArr.length; i++)
    {
        const currType = typeArr[i];
        let message = '<' + currType + "> → ";

        const defendingType = typeChart[currType];
        

        for(val in defendingType){
            if (defendingType[val]===2){
                message += '[' + val + '] ';
            }
        }
        const pEl = document.createElement('p');
        pEl.innerText = message;
        pEl.className="text-xl";
        pkmStrengthEl.appendChild(pEl);
    }
}

//toggling to prevent "enter" key spams
let isFetching = false;

//globals vars
const fetchBtnEl = document.getElementById("fetchBtn");
const searchBarEl = document.getElementById("searchBar");

//Pokemon type advantage table (attacker -> defender -> multiplier)
const typeChart = {
    "Normal" : {
        "Rock":0.5,
        "Ghost":0,
        "Steel":0.5
    },
    "Fire" : {
        "Fire":0.5,
        "Water":0.5,
        "Grass":2,
        "Ice":2,
        "Bug":2,
        "Rock":0.5,
        "Dragon":0.5,
        "Steel":2
    },
    "Water" : {
        "Fire":2,
        "Water":0.5,
        "Grass":0.5,
        "Ground":2,
        "Rock":2,
        "Dragon":0.5
    },
    "Electric" : {
        "Water":2,
        "Electric":0.5,
        "Grass":0.5,
        "Ground":0,
        "Flying":2,
        "Dragon":0.5
    },
    "Grass" : {
        "Fire":0.5,
        "Water":2,
        "Grass":0.5,
        "Poison":0.5,
        "Ground":2,
        "Flying":0.5,
        "Bug":0.5,
        "Rock":2,
        "Dragon":0.5,
        "Steel":0.5
    },
    "Ice" : {
        "Fire":0.5,
        "Water":0.5,
        "Grass":2,
        "Ice":0.5,
        "Ground":2,
        "Flying":2,
        "Dragon":2,
        "Steel":0.5
    },
    "Fighting" : {
        "Normal":2,
        "Ice":2,
        "Poison":0.5,
        "Flying":0.5,
        "Psychic":0.5,
        "Bug":0.5,
        "Rock":2,
        "Ghost":0,
        "Dark":2,
        "Steel":2,
        "Fairy":0.5
    },
    "Poison" : {
        "Grass":2,
        "Poison":0.5,
        "Ground":0.5,
        "Rock":0.5,
        "Ghost":0.5,
        "Steel":0,
        "Fairy":2
    },
    "Ground" : {
        "Fire":2,
        "Electric":2,
        "Grass":0.5,
        "Poison":2,
        "Flying":0,
        "Bug":0.5,
        "Rock":2,
        "Steel":2
    },
    "Flying" : {
        "Electric":0.5,
        "Grass":2,
        "Fighting":2,
        "Bug":2,
        "Rock":0.5,
        "Steel":0.5
    },
    "Psychic" : {
        "Fighting":2,
        "Poison":2,
        "Psychic":0.5,
        "Dark":0,
        "Steel":0.5
    },
    "Bug" : {
        "Fire":0.5,
        "Grass":2,
        "Fighting":0.5,
        "Poison":0.5,
        "Flying":0.5,
        "Psychic":2,
        "Ghost":0.5,
        "Dark":2,
        "Steel":0.5,
        "Fairy":0.5
    },
    "Rock" : {
        "Fire":2,
        "Ice":2, 
        "Fighting":0.5,
        "Ground":0.5,
        "Flying":2,
        "Bug":2,
        "Steel":0.5
    },
    "Ghost":{
        "Normal":0,
        "Psychic":2,
        "Ghost":2,
        "Steel":0.5
    },
    "Dragon":{
        "Dragon":2,
        "Steel":0.5,
        "Fairy":0
    },
    "Dark":{
        "Fighting":0.5,
        "Psychic":2,
        "Ghost":2,
        "Dark":0.5,
        "Fairy":0.5
    },
    "Steel":{
        "Fire":0.5,
        "Water":0.5,
        "Electric":0.5,
        "Ice":2,
        "Rock":2,
        "Steel":0.5,
        "Fairy":2
    },
    "Fairy":{
        "Fire":0.5,
        "Fighting":2,
        "Poison":0.5,
        "Dragon":2,
        "Dark":2,
        "Steel":0.5
    }
}



window.onload = function (){
    //button to submit the search bar request
    fetchBtnEl.addEventListener("click", fetchData);

    //enter button submit the search bar request
    searchBarEl.addEventListener("keydown", function(e) {
        if (e.key === "Enter" && !isFetching){
            e.preventDefault();
            fetchData();
        }
    });

    //clear search bar on click
    searchBarEl.addEventListener("focus", function() {
        searchBarEl.value="";
    });

}