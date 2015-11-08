<?php
session_start();
$_SESSION['data'] = $_POST['feedback'];
echo $_SESSION['data'];
