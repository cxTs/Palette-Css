// ensemble des expressions régulières nécessaires au travail avec les couleurs
var regex = {
    hex:/#[a-f0-9]{8}|#[a-f0-9]{6}|#[a-f0-9]{3}/gi,
    rgba:/rgba?\(\s*(\s*(\s*\d{1,2}|1\d\d|2([0-4]\d|5[0-5]))\s*,?){3}(\s*,\s*[0]{1}\.\d*\s*)?\)/gi,
    hsl:/hsl\(\s*\d*\s*[,]\s*\d*%\s*[,]\s*\d*%\s*\)/gi,
    symbol:/\W/g,
    space:/\s/g,
    opacity:/fill-opacity:\d/,
    svgXml:/\.svg|\.xml/,
    noNumber :/\D*/gi,
    hexValues:/[a-f0-9]{2}/gi,
    rgbaValues:/[2][5][0-5]|[2][0-4][0-9]|[0-1][0-9][0-9]|[0-9][0-9]|0\.[0-9]{1,2}|[0-9]/g,
    hslValues:/[2][5][0-5](?!%)|[2][0-4][0-9](?!%)|[0-1][0-9][0-9](?!%)|100(?=%)|[0-9][0-9](?=%)|0(?=%)|0(?!%)/gi,
    fileType:/\w*\/svg|\w*\/xml|\w*\/plain|\w*\/css|\w*\/html/i,
};
var texte = ""; // fichier sélectionné par l'uitlisation renvoyé au format text.
var readerText = new FileReader(); // lecteur du fichier sélectionné par l'utilisateur
readerText.onload = function (event) {
    texte = "";
    texte += event.target.result; // une fois le lecteur chargé, il attribut son résusltat à 'texte'
    palette = new Palette(texte); // création d'un nouvelle objet palette par-dessus la première instance avec 'texte'
    creerCSS();
}
//--------------/
// FUNCTIONS
//--------------/
function lireFichier(file) {
    if(texte.length>0) // nettoyage de 'texte' si plusieurs fichiers traités à la suite
    {
        texte = "";
    }
    readerText.readAsText(file); // envoie du fichier au reader sur la fonction readAsText()
    return;
};
function recevoirFichier() {
    var fichier = document.getElementById("file").files[0]; // sélection du fichier reçu de l'input file
    // vérification du format du fichier passé par l'utilisateur
    if (regex.fileType.test(fichier.type)) {
        //clearOutput("cssFile"); // nettoyage couleurs précedemment affichées
        lireFichier(fichier);
    } else {
        window.alert("Type de fichier non pris en charge");
        // nettoyage affichage du précédent fichier
        document.getElementById("file").value="";
        clearOutput("palette"); // palette de couleurs
        try { //nettoyage bouton download css
            var form = document.getElementById('choice');
            var dlCss = document.getElementById("download");
            console.log(dlCss);
            console.log("try");
            form.removeChild(dlCss);
        } catch(e) {
            console.log("catch"+e);
        };
    }
    return;
};
function clearOutput(id) { // destruction des descendant d'un élément dont l'id est passé en arg
    var el = document.getElementById(id);
    while(el.firstChild) {
        el.removeChild(el.firstChild);
    }
    return;
};
function hide(id,attr) { // mutation attribut des input dont l'id est passé en arg
    document.getElementById(id).setAttribute(attr,'hidden');
    return;
}
// fonction de création d'une instance XMLHttpRequest
function getXHR() {
    var xhr = null;
    if(window.XMLHttpRequest || window.ActiveXObject) {
        if(window.ActiveXObject) {
            try {
                xhr = new ActiveXObject("Msxml2.XMLHTTP");
            } catch (e) {
                xhr = new ActiveXObject("Microsoft.XMLHTTP");
            }
        } else {
            xhr = new XMLHttpRequest();
        }
    } else {
        window.alert("Votre navigateur ne prend pas en charge l'objet XMLHttpRequest");
        return null;
    }
    return xhr;
};
function sendToPhp(hex,rgba,hsl,callback) {
    var xhr = getXHR();
    xhr.onreadystatechange = function() {
        if(xhr.readyState==4 && xhr.status==200) {
            // lorsque la requête est passée et le retour serveur ok, on fait apparaître le lien de téléchargement du
            // fichier css créé par le srcipt php
            callback(); // cssFileAdress()
        }
    };
    xhr.open("POST","creationCss.php",true);
    xhr.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
    xhr.send("hex="+hex+"&rgba="+rgba+"&hsl="+hsl);
    return;
}
function cssFileAdress() {
    var form = document.getElementById("choice");
    try {
        var dlCss = document.getElementById("download");
        console.log(dlCss);
        console.log("try");
        form.removeChild(dlCss);
    } catch(e) {
        console.log("catch"+e);
    };
    var a = document.createElement('a');
    var text = document.createTextNode("DOWNLOAD CSS");
    a.setAttribute("href","couleurs.css");
    a.setAttribute("id","download");
    a.setAttribute("download","couleurs.css");
    a.setAttribute("class","button");
    a.appendChild(text);
    form.appendChild(a);
    return;
};
function creerCSS() {
    var hex = palette.colHexJson;
    var rgba = palette.colRgbaJson;
    var hsl = palette.colHslJson;
    sendToPhp(hex,rgba,hsl,cssFileAdress);
    return;
};
function mettreEnSurbrillance(event) { // mise en surbrillance du code couleur au click sur <li>
    var couleur = event.target.firstChild.firstChild; // text node de <p> dans <li> dans <ul>
    if(document.body.createTextRange) { //IE
        var range = document.body.createTextRange();
        range.moveToElementText(couleur);
        range.select();
    } else { // Mozilla , Chrome , Opera
        var selection = window.getSelection();
        var range = document.createRange();
        range.selectNodeContents(couleur);
        selection.removeAllRanges();
        selection.addRange(range);
    }
    return;
}
//--------------/
// OBJECTS
//--------------/
function Palette(texte) { // constructeur / arg : texte renvoyé par le FileReader
    this.clearOutput(); // nettoyage éventuel affichage précédent
    this.colHex = {};
    this.colRgba = {};
    this.colHsl = {};
    this.source = "";
    this.traiterFichier(texte);
    return;
};
Palette.prototype = {
    paletteUl : document.getElementById("palette"),
    txt : function(t){ return document.createTextNode(t); },
	el : function(elem){ return document.createElement(elem); },
    godet : function(color) // création de éléments <li> et de leur attributs
    {
        var li = this.el("li");
        li.setAttribute("class","godet");
        li.setAttribute("style","background-color:"+color+";");
        li.setAttribute("onclick","mettreEnSurbrillance(event)")
        var p = this.el('p');
        p.setAttribute("class","nomCouleur");
        var codeCouleur = this.txt(color);
        p.appendChild(codeCouleur);
        li.appendChild(p);
        return li;
    },
    //--------------/
    afficherCouleurs : function(tabCouleur) {
        for(var i in tabCouleur) //remplissage <ul id="palette"> avec les éléments <li> créés par godet()
        {
            this.paletteUl.appendChild(this.godet(i));
        };
    },
    traiterFichier : function(texte) {
        if(this.source.length>0) { //nettoyage éventuelle présence d'un texte issu d'un précédent fichier
            this.source = "";
        }
        this.source += texte;
        //création des objets couleur par type d'encodage des couleurs
        this.creerCol("hex");
        this.creerCol("rgba");
        this.creerCol("hsl");
        this.afficherCouleurs(this.colHex);
        this.afficherCouleurs(this.colRgba);
        this.afficherCouleurs(this.colHsl);
    },
    nettoyage : function(color,format) { // nettoyage du format texte des couleur pours css uniforme
        let col;
        if(format=="hex") { //seuelement un trim pour le format hexa
            col=color.trim();
        } else { // trim et remplacement des tabulations éventuelles entre les paranthèses des rgb.a et hsl
            col=color.trim();
            col=color.replace(regex.space,'');
        }
        return col;
    },
    creerCol : function(format) { // création des objets couleur
        let colObj = format;
        colObj = colObj.replace(colObj.charAt(0),colObj.charAt(0).toUpperCase()); // ex. 'hex' -> 'Hex'
        colObj = "col"+colObj; //création du nom de variable correspondant à ceux donnés par le prototype -> 'colHex'
        if(regex[format].test(this.source)) { // vérification de présence de couleur au format donné dans le texte source
            let tab = this.source.match(regex[format]);
            if(format=="hex") {
                for(i in tab) { // mise en majuscule des caractères du format hexa pour uniformisation du fichier css
                    tab[i] = tab[i].toUpperCase();
                }
            }
            this[`${colObj}Json`] = JSON.stringify(tab); // créa nom de propriété avec réf à la valeur de la var colObj
            for(i in tab) {
                let col = this.nettoyage(tab[i],format);
                col = this.formatLong(col);
                this[colObj][col] = this.colStringToArray(col,format);
            }
        }
        return;
    },
    //--------------/
    clearOutput : function() { // nettoyage des affichages suite au traitement d'un fichier
		while(this.paletteUl.firstChild) {
			this.paletteUl.removeChild(this.paletteUl.firstChild);
		}
	},
    formatLong : function(color) { // mise au format long des couleurs hexa abrégées
        if(color.length>4) {
            return color;
        }
        let fLong = "";
        color = color.slice(1);
        //double les valeurs pour obtenir un format long
        for(let i=0;i<color.length;i++) {
            fLong+=color[i]+color[i];
        }
        return "#"+fLong;
    },
    colStringToArray : function(color,format) {
        return color.match(regex[format+"Values"]);
    }
}
//--------------/
//--------------/
var palette = new Palette(""); // instance de pallette vide
// mise en place des listener au chargement de la page
if (document.addEventListener) {
    document.getElementById("file").addEventListener("change",recevoirFichier,false);
} else {
    document.getElementById("file").attachEvent("onchange",recevoirFichier);
}
// déclenchement du traitement du fichier au chargement si la page à été rafraichie avec un fichier déja sélectionné
window.onload = function() {
    if (document.getElementById("file").value!="") {
        recevoirFichier();
    }
    return;
};
