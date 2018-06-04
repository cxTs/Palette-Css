<?php
    header("Content-Type: text/plain");
    $hex=(isset($_POST['hex']))?json_decode($_POST['hex']):array();
    $rgba=(isset($_POST['rgba']))?json_decode($_POST['rgba']):array();
    $hsl=(isset($_POST['hsl']))?json_decode($_POST['hsl']):array();
    $head = "/*\n -- CSS FILE\n*/\n";
    $foot = "\n/*\n -- END\n*/";
    $hexS = (count($hex)>0)?"\n/*\n".implode("\n",$hex)."\n*/\n":"";
    $rgbaS = (count($rgba)>0)?"\n/*\n".implode("\n",$rgba)."\n*/\n":"";
    $hslS = (count($hsl)>0)?"\n/*\n".implode("\n",$hsl)."\n*/\n":"";
    $cssText = $head.$hexS.$rgbaS.$hslS.$foot;
    $cssFile = fopen('couleurs.css','r+');
    fputs($cssFile,$cssText);
    fclose($cssFile);
?>
