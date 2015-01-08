/*jslint node: true*/

"use strict";

var resourceFactory = require("./resourceFactory");

module.exports = {
    recipesPage: resourceFactory.createRecipesPage("recipes.html"),
    invalidRecipesPage: resourceFactory.createRecipesPage("random.html"),
    balletjesRecipePage: resourceFactory.createRecipePage(
        "http://www.een.be/programmas/dagelijkse-kost/recepten/balletjes-in-tomatensaus",
        "balletjesInTomatensausRecipe.html"
    ),
    caesardressingRecipePage: resourceFactory.createRecipePage(
        "http://www.een.be/programmas/dagelijkse-kost/recepten/caesardressing",
        "caesardressingRecipe.html"
    ),
    cupcakesRecipePage: resourceFactory.createRecipePage(
        "http://www.een.be/programmas/dagelijkse-kost/recepten/aardappel-cupcakes",
        "aardappelCupcakesRecipe.html"
    ),
    toastRecipePage: resourceFactory.createRecipePage(
        "http://www.een.be/programmas/dagelijkse-kost/recepten/" +
            "zuiderse-toast-champignon-met-limoen-ricotta-en-rucola",
        "zuiderseToastChampignonMetLimoenRicottaEnRucolaRecipe.html"
    ),
    invalidRecipePage: resourceFactory.createRecipePage(
        "http://www.een.be/programmas/dagelijkse-kost/recepten/random",
        "random.html"
    )
};
