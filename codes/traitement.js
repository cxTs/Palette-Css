var regex =
{
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
    fileType:/\w*svg|\w*xml|\w*text|\w*css|\w*html/i,
};
var texte = "";
var readerText = new FileReader();
readerText.onload = function (event)
{
    texte = "";
    texte += event.target.result;
    palette = new Palette(texte);
}

////////////////////////////////////////////////
////////////////////////////////////////////////
// FUNCTIONS
////////////////////////////////////////////////
////////////////////////////////////////////////
function lireFichier(file)
{
    if(texte.length>0)
    {
        texte = "";
    }
    readerText.readAsText(file);
    return;
};
function recevoirFichier()
{
    var fichier = document.getElementById("file").files[0];
    if (regex.fileType.test(fichier.type))
    {
        lireFichier(fichier);
    }
    else
    {
        window.alert("Type de fichier non pris en charge");
        document.getElementById("file").value="";
        clearOutput("palette");
        hide("submit");
    }
    return;
};
function clearOutput(id)
{
    var el = document.getElementById(id);
    while(el.firstChild)
    {
        el.removeChild(el.firstChild);
    }
};
function hide(id)
{
    document.getElementById(id).setAttribute('type','hidden');
}
function getXHR()
{
    var xhr = null;
    if(window.XMLHttpRequest || window.ActiveXObject)
    {
        if(window.ActiveXObject)
        {
            try
            {
                xhr = new ActiveXObject("Msxml2.XMLHTTP");
            }
            catch (e)
            {
                xhr = new ActiveXObject("Microsoft.XMLHTTP");
            }
        }
        else
        {
            xhr = new XMLHttpRequest();
        }
    }
    else
    {
        window.alert("Votre navigateur ne prend pas en charge l'objet XMLHttpRequest");
        return null;
    }
    return xhr;
};
function sendToPhp(hex,rgba,hsl,callback)
{
    var xhr = getXHR();
    xhr.onreadystatechange = function()
    {
        if(xhr.readyState==4 && xhr.status==200)
        {
            callback();
        }
    };
    xhr.open("POST","creationCss.php",true);
    xhr.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
    xhr.send("hex="+hex+"&rgba="+rgba+"&hsl="+hsl);
}
function cssFileAdress()
{
    clearOutput("cssFile");
    var section = document.getElementById('cssFile');
    var a = document.createElement('a');
    var text = document.createTextNode("fichier couleurs.css");
    a.setAttribute("href","couleurs.css");
    a.setAttribute("download","couleurs.css");
    a.appendChild(text);
    section.appendChild(a);
};
function creerCSS()
{
    var hex = palette.colHexJson;
    var rgba = palette.colRgbaJson;
    var hsl = palette.colHslJson;
    sendToPhp(hex,rgba,hsl,cssFileAdress);
};


//////////////////////////////////////////////////////////////////////
// OBJETCS  //////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////
function Palette(texte)
{
    this.clearOutput();
    var date = new Date();
    this.name = "palette"+date.getMilliseconds();
    this.colHex = {};
    this.colRgba = {};
    this.colHsl = {};
    this.source = "";
    this.traiterFichier(texte);
};
Palette.prototype = {
    paletteUl : document.getElementById("palette"),
    txt : function(t){ return document.createTextNode(t); },
	el : function(elem){ return document.createElement(elem); },
    godet : function(color)
    {
        var li = this.el("li");
        li.setAttribute("class","godet");
        li.setAttribute("style","background-color:"+color+";");
        var p = this.el('p');
        p.setAttribute("class","hexa");
        var txt2 = this.txt(color);
        p.appendChild(txt2);
        li.appendChild(p);
        return li;
    },
    /////////////////////////////////
    afficherCouleurs : function(tabCouleur)
    {
        for(var i in tabCouleur)
        {
            this.paletteUl.appendChild(this.godet(i));
        };
    },
    traiterFichier : function(texte)
    {
        if(this.source.length>0)
        {
            this.source = "";
        }
        this.source += texte;
        this.creerCol("hex");
        this.creerCol("rgba");
        this.creerCol("hsl");
        this.afficherCouleurs(this.colHex);
        this.afficherCouleurs(this.colRgba);
        this.afficherCouleurs(this.colHsl);
        this.afficherGenCss();
    },
    nettoyage : function(color,format)
    {
        let col;
        if(format=="hex")
        {
            col=color.trim();
        }
        else
        {
            col=color.trim();
            col=color.replace(regex.space,'');
        }
        return col;
    },
    creerCol : function(format)
    {
        let colObj = format;
        colObj = colObj.replace(colObj.charAt(0),colObj.charAt(0).toUpperCase());
        colObj = "col"+colObj;
        if(regex[format].test(this.source))
        {
            let tab = this.source.match(regex[format]);
            this[`${colObj}Json`] = JSON.stringify(tab);
            for(i in tab)
            {
                let col = this.nettoyage(tab[i],format);
                col = this.formatLong(col);
                this[colObj][col] = this.colStringToArray(col,format);
            }
        }
        return;
    },
    /////////////////////////////////
    clearOutput : function()
    {
		while(this.paletteUl.firstChild)
        {
			this.paletteUl.removeChild(this.paletteUl.firstChild);
		}
        document.getElementById('submit').setAttribute('type','hidden');
	},
    formatLong : function(color)
    {
        if(color.length>4)
        {
            return color;
        }
        let fLong = "";
        color = color.slice(1);
        for(let i=0;i<color.length;i++)//double les valeurs pour obtenir un format long
        {
            fLong+=color[i]+color[i];
        }
        return "#"+fLong;
    },
    colStringToArray : function(color,format)
    {
        let tab = [];
        if(color.length>=6)
        {
            return color.match(regex[format+"Values"]);
        }
        for(let i=0;i<color.length;i++)//double les valeurs pour obtenir un format long
        {
            tab[i]=color[i]+color[i];
        }
        return tab;
    },
    afficherGenCss : function()
    {
        var chex = Object.values(this.colHex).length;
        var crgba = Object.values(this.colRgba).length;
        var chsl = Object.values(this.colRgba).length;
        if(chex!=0 || crgba!=0 || chsl!=0)
        {
            document.getElementById('submit').setAttribute('type','button');
        }
        else
        {
            document.getElementById('submit').setAttribute('type','hidden');
        }
    }
}
////////////////////////////
////////////////////////////
////////////////////////////
////////////////////////////
////////////////////////////
////////////////////////////
var palette = new Palette();
if (document.addEventListener)
{
    document.getElementById("file").addEventListener("change",recevoirFichier,false);
    document.getElementById("submit").addEventListener("click",creerCSS,false);
}
else
{
    document.getElementById("file").attachEvent("onchange",recevoirFichier);
    document.getElementById("submit").attachEvent("onclick",creerCSS);
}
window.onload = function()
{
    if (document.getElementById("file").value!="")
    {
        recevoirFichier();
    }
};
