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



fetchData(); //hoisting

//EX3: fetching resources using ASYNC and AWAIT
async function fetchData(){
    try{
        //get user input
        const pokemonName = document.getElementById("pokemonName").value.toLowerCase();
    
        //try to fetch user input from pokemon api
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`);

        //error handling if resource not found
        if (!response.ok){
            throw new Error("Could not fetch resource");
        }

        //convert response into desired format
        const data = await response.json();

        //get the sprite datas
        const pokemonSprite = data.sprites.front_default;

        const imgElement = document.getElementById("pokemonSprite");

        //display the requested pokemon sprite
        imgElement.src = pokemonSprite;
        imgElement.style.display = "block";
    }
    catch(error){
        console.error(error);
    }
}