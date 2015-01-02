/*jslint node: true*/

"use strict";

var fixtures = require("./fixtures"),
    urlUtils = require("./utils/urlUtils");

module.exports = {
    getRecipeUrlsShouldReturnAbsolureUrls: function (test) {
        fixtures.
            recipesPage.
            getRecipeUrls().
            then(function (urls) {
                test.strictEqual(urls.every(urlUtils.isAbsolute), true);
                test.done();
            }).
            done();
    },
    getRecipeUrlsShouldReturnRecipeUrls: function (test) {
        var recipesPage = fixtures.recipesPage;
        recipesPage.
            getRecipeUrls().
            then(function (urls) {
                var isNumDownFrom = urlUtils.isNumDownFrom(recipesPage.getUrl(), 1);
                test.strictEqual(urls.every(isNumDownFrom), true);
                test.done();
            }).
            done();
    },
    getRecipeUrlsShouldReturnAllRecipeUrls: function (test) {
        fixtures.
            recipesPage.
            getRecipeUrls().
            then(function (urls) {
                test.strictEqual(urls.length, 992);
                test.done();
            }).
            done();
    },
    getRecipeUrlsShouldReturnZeroRecipeUrlsWhenRecipesPageIsInvalid: function (test) {
        fixtures.
            invalidRecipesPage.
            getRecipeUrls().
            then(function (urls) {
                test.strictEqual(urls.length, 0);
                test.done();
            }).
            done();
    },
    getImageUrlShouldReturnAnAbsoluteUrl: function (test) {
        fixtures.
            balletjesRecipePage.
            getImageUrl().
            then(function (url) {
                test.strictEqual(urlUtils.isAbsolute(url), true);
                test.done();
            }).
            done();
    },
    getImageUrlShouldReturnAnImageUrl: function (test) {
        fixtures.
            balletjesRecipePage.
            getImageUrl().
            then(function (url) {
                test.strictEqual(
                    urlUtils.isNumDownFrom(
                        "http://www.een.be/files/een.be/imagecache/video_image/images/programmas/" +
                            "dagelijkse_kost",
                        2,
                        url
                    ),
                    true
                );
                test.done();
            }).
            done();
    },
    getImageUrlShouldReturnUndefinedWhenRecipePageIsInvalid: function (test) {
        fixtures.
            invalidRecipePage.
            getImageUrl().
            then(function (url) {
                test.strictEqual(url, undefined);
                test.done();
            }).
            done();
    },
    getRecipeVariationUrlsShouldReturnAbsolureUrls: function (test) {
        fixtures.
            balletjesRecipePage.
            getRecipeVariationUrls().
            then(function (urls) {
                test.strictEqual(urls.every(urlUtils.isAbsolute), true);
                test.done();
            }).
            done();
    },
    getRecipeVariationUrlsShouldReturnRecipeVariationUrls: function (test) {
        var recipePage = fixtures.balletjesRecipePage,
            refererUrl = recipePage.getUrl();
        recipePage.
            getRecipeVariationUrls().
            then(function (urls) {
                test.strictEqual(urls.every(function (url) {
                    return url !== refererUrl && urlUtils.isSimilar(url, refererUrl);
                }), true);
                test.done();
            }).
            done();
    },
    getRecipeVariationUrlsShouldReturnAllRecipeVariationUrls: function (test) {
        fixtures.
            balletjesRecipePage.
            getRecipeVariationUrls().
            then(function (urls) {
                test.strictEqual(urls.length, 4);
                test.done();
            }).
            done();
    },
    getRecipeVariationUrlsShouldReturnZeroRecipeVariationUrlsWhenRecipePageIsInvalid: function (test) {
        fixtures.
            invalidRecipePage.
            getRecipeVariationUrls().
            then(function (urls) {
                test.strictEqual(urls.length, 0);
                test.done();
            }).
            done();
    },
    getRecipeShouldReturnARecipe1: function (test) {
        fixtures.
            balletjesRecipePage.
            getRecipe().
            then(function (recipe) {
                test.deepEqual(recipe, {
                    name: "balletjes in tomatensaus",
                    tags: ["hoofdgerecht", "klassieker"],
                    cookingTime: "80 minuten",
                    introduction: [
                        "Balletjes in tomatensaus, da’s wellicht één van de allerlekkerste gerechten uit " +
                            "onze Vlaamse keuken. Voor de tomatensaus heb je wel heel wat ingrediënten " +
                            "nodig, want alleen zo krijgt de saus heel veel smaak. Dat is het geheim van " +
                            "een top-tomatensaus.",
                        "Gehaktballetjes maken is helemaal niet moeilijk, en als je de twee nadien " +
                            "samenbrengt in één pot dan is het pas echt smullen geblazen! De balletjes " +
                            "smaken heel lekker met bv. verse aardappelpuree, maar dat kunnen net zo " +
                            "goed frietjes of rijst zijn. Dat beslis je zelf!"
                    ],
                    price: 3,
                    ingredients: {
                        servings: 4,
                        categories: [
                            {
                                name: "tomatensaus",
                                ingredients: [
                                    "200 g gezouten spek (1 dikke snee)",
                                    "3 uien",
                                    "2 teentjes look",
                                    "4 stengels selders",
                                    "1 dikke wortel",
                                    "800 g gepelde tomaten (in blik)",
                                    "500 g tomatenpulp (in blik of brik)",
                                    "80 g geconcentreerde tomatenpuree (in blik)",
                                    "4 dl water",
                                    "1⁄2 rode chilipeper",
                                    "enkele takjes verse tijm",
                                    "4 blaadjes laurier (vers of gedroogd)",
                                    "1 takje verse rozemarijn",
                                    "1 takje verse salie",
                                    "enkele takjes verse dragon",
                                    "een snuif gedroogde oregano",
                                    "een flinke eetlepel bloem",
                                    "1⁄2 eetlepel suiker",
                                    "een scheutje olijfolie",
                                    "peper",
                                    "zout"
                                ]
                            },
                            {
                                name: "balletjes",
                                ingredients: [
                                    "1 kg gemengd gehakt (varken en rund)",
                                    "2 eieren",
                                    "4 eetlepels paneermeel",
                                    "1⁄2 bussel peterselie",
                                    "1 klontje boter",
                                    "een scheutje olijfolie",
                                    "peper",
                                    "zout"
                                ]
                            }
                        ]
                    }
                });
                test.done();
            }).
            done();
    },
    getRecipeShouldReturnARecipe2: function (test) {
        fixtures.
            caesardressingRecipePage.
            getRecipe().
            then(function (recipe) {
                test.deepEqual(recipe, {
                    name: "Caesardressing",
                    tags: ["basistechnieken"],
                    cookingTime: "15 minuten",
                    ingredients: {
                        servings: 4,
                        categories: [
                            {
                                ingredients: [
                                    "3 zoute ansjovisfilets",
                                    "75 g geraspte Parmezaanse kaas",
                                    "2 dooiers",
                                    "1 dl yoghurt",
                                    "1 limoen (of limoensap)",
                                    "2 dl druivenpitolie",
                                    "1 teentje look",
                                    "1 pikante rode chilipeper",
                                    "1 eetlepel mosterd"
                                ]
                            }
                        ]
                    }
                });
                test.done();
            }).
            done();
    },
    getRecipeShouldReturnARecipe3: function (test) {
        fixtures.
            cupcakesRecipePage.
            getRecipe().
            then(function (recipe) {
                test.deepEqual(recipe, {
                    name: "aardappel-cupcakes",
                    tags: ["snack", "vernieuwend"],
                    cookingTime: "80 minuten (incl. 30 minuten baktijd)",
                    introduction: [
                        "Zoete cupcakes zijn helemaal ‘in’. Jeroen doet een beetje tegendraads en maakt " +
                            "hartige cupcakes op basis van aardappelen. Ze zijn lekker als snack, maar " +
                            "je kan ze net zo goed serveren als een origineel aardappelalternatief bij " +
                            "een hoofdgerecht met vlees, vis of kip. Kortom, met een simpel patatje kan " +
                            "je heel erg leuke dingen doen."
                    ],
                    price: 1.5,
                    ingredients: {
                        servings: 4,
                        categories: [
                            {
                                ingredients: [
                                    "4 sneetjes chorizo (dikke; 4-5 mm)",
                                    "6 kwartjes van artisjokken (opgelegd in olie)",
                                    "2 eieren",
                                    "1 ui",
                                    "2 eetlepels verse geitenkaas",
                                    "2 eetlepels bloem",
                                    "1 koffielepel bakpoeder",
                                    "1 eetlepel fijngehakte verse oregano",
                                    "1 scheutje olijfolie",
                                    "1 kg aardappelen (loskokend)"
                                ]
                            }
                        ]
                    }
                });
                test.done();
            }).
            done();
    },
    getRecipeShouldReturnARecipe4: function (test) {
        fixtures.
            toastRecipePage.
            getRecipe().
            then(function (recipe) {
                test.deepEqual(recipe, {
                    name: "Zuiderse toast champignon met limoen-ricotta en rucola",
                    tags: ["klassieker", "snack"],
                    cookingTime: "30 minuten",
                    introduction: [
                        "De ‘toast champignon’ is een onverwoestbare klassieker uit de bistrokeuken. ’t " +
                            "Is een redelijk zwaar gerecht en daarom bedacht Jeroen de Zuiderse versie " +
                            "van de toast met een fris kaasmengsel van ricotta en een beetje limoen. De " +
                            "klassieke Parijse champignons vervangt hij door een paddenstoelenmengeling " +
                            "die iedereen naar smaak en aanbod kan samenstellen. Zuurdesembrood is zeer " +
                            "geschikt voor de toast."
                    ],
                    price: 4,
                    ingredients: {
                        servings: 4,
                        categories: [
                            {
                                name: "brood met paddestoelen",
                                ingredients: [
                                    "2 dikke sneden zuurdesembrood (2cm dik)",
                                    "750 g gemengde paddestoelen: een selectie van bv. oesterzwammen, " +
                                        "cantharellen, eekhoorntjesbrood, kastanjechampignons, …",
                                    "2 grote sjalotten",
                                    "1 teentje look",
                                    "2 takjes tijm",
                                    "1 takje rozemarijn",
                                    "3 blaadjes salie",
                                    "scheutjes fijne olijfolie",
                                    "peper",
                                    "zout"
                                ]
                            },
                            {
                                name: "limoen-ricotta",
                                ingredients: [
                                    "400 g ricotta",
                                    "1⁄2 limoen (onbehandeld)",
                                    "4 eetlepels fijne olijfolie",
                                    "peper",
                                    "zout",
                                    "100 g rucola",
                                    "scheutjes balsamico"
                                ]
                            }
                        ]
                    }
                });
                test.done();
            }).
            done();
    }
};
