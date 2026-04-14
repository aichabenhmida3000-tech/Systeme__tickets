<?php
$srvr = "localhost";
$user="root";
$mdp="";
$bdd="ticketsystem";
$cnx = mysqli_connect($srvr,$user,$mdp,$bdd);
if(!$cnx){
    die("connexion echouee:" . mysqli_connect_error()); 
}
?>